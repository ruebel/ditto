(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('security', securityService);

    ////////////////////

    securityService.$inject = ['$http', '$state', 'common', 'socket', 'store'];

    function securityService($http, $state, common, socket, store) {
        var constants = common.constants;
        var logger = common.logger;
        var loggedOnUser;
        var server = constants.remoteServiceNames;
        var token;
        var userMode;
        var $q = common.$q;

        var service = {
            changeMode: changeMode,
            createUser: createUser,
            emit: emit,
            login: login,
            logout: logout,
            getCreds: getCreds,
            getCurrentUser: getCurrentUser,
            getMode: getMode,
            getToken: getToken,
            setMode: setMode,
        };

        return service;

        ////////////////////

        function changeMode() {
            userMode = null;
            store.set('userMode', '');
            $state.go('userMode');
        }

        function createUser(user) {
            return $http({
                url: server.baseAddress + server.userCreate,
                method: 'POST',
                data: user
            }).then(createUserSucceeded, onError);

            /////////////

            function createUserSucceeded(response) {
                store.set('jwt', response.data.idToken);
                $state.go('welcome');
                logger.success('User Created!');
            }
        }

        function emit(event, data) {
            socket.emit(event, getCreds(), data);
        }

        function getCreds() {
            if (!token) {
                recoverSession();
            }
            return {
                token: token,
                user: loggedOnUser,
                userMode: userMode
            };
        }

        function getCurrentUser() {
            // Return current user in a promise
            return $q.when(loggedOnUser);
        }

        function getMode() {
            // Return current user mode in a promise
            return $q.when(userMode);
        }

        function getToken() {
            // Return current toekn in a promise
            return $q.when(token);
        }

        function login(user) {
            return $http({
                url: server.baseAddress + server.userLogin,
                method: 'POST',
                data: user
            }).then(loginSucceeded, onError);

            ///////////////////

            function loginSucceeded(response) {
                store.set('jwt', response.data.idToken);
                store.set('user', response.data.user);
                $state.go('userMode');
                loggedOnUser = response.data.user;
                common.$broadcast(constants.events.userLoggedIn, loggedOnUser);
                logger.success('Login Successful');
            }
        }

        function logout() {
            loggedOnUser = null;
            token = null;
            userMode = null;
            store.set('jwt', '');
            store.set('user', '');
            store.set('userMode', '');
            common.$broadcast(constants.events.userLoggedOut);
            $state.go('welcome');
            logger.info('Logged Out');
        }

        function onError(error) {
            logger.error(error.data);
        }

        function recoverLoggedOnUser() {
            if (!loggedOnUser) {
                loggedOnUser = store.get('user');
                if (loggedOnUser) {
                    common.$broadcast(constants.events.userLoggedIn, loggedOnUser);
                }
            }
        }

        function recoverUserMode() {
            if (!userMode) {
                userMode = store.get('userMode');
                if (userMode) {
                    common.$broadcast(constants.events.userModeSet, userMode);
                }
            }
        }

        function recoverSession() {
            // Get session token if we need it
            if (!token) {
                token = store.get('jwt');
            }
            // Only bother getting other creds it we have a token
            if (token) {
                recoverLoggedOnUser();
                recoverUserMode();
                if (loggedOnUser && userMode) {
                    logger.info('Recovered session');
                }
            }
        }

        function setMode(mode) {
            return $http({
                url: server.baseAddress + server.sessionOpen,
                method: 'POST',
                data: {
                    'mode': mode,
                    'user': loggedOnUser.username
                }
            }).then(setModeSucceeded, setModeFailed);

            ///////////////////////

            function setModeSucceeded(response) {
                userMode = mode;
                store.set('userMode', mode);
                common.$broadcast(constants.events.userModeSet, mode);
                // Subscribe to socket room
                socket.emit(constants.socketEvents.subscribe, getCreds());
                // Go to page depending on mode
                if (mode === constants.modes.teacher) {
                    // Teacher mode
                    $state.go('app.dashboard');
                } else {
                    // Classroom mode
                    $state.go('presentation');
                }
                logger.success('Session opened as ' + mode);
            }

            function setModeFailed(error) {
                // Clear variables
                store.set('userMode', '');
                store.set('sid', '');
                onError(error);
            }
        }
    }
})();
