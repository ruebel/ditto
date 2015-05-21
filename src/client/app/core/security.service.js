(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('security', securityService);

    ////////////////////

    securityService.$inject = ['$http', '$state', 'common', 'store'];

    function securityService($http, $state, common, store) {
        var constants = common.constants;
        var logger = common.logger;
        var loggedOnUser = undefined;
        var session = undefined;
        var server = constants.remoteServiceNames;
        var token = undefined;
        var userMode = undefined;
        var $q = common.$q;

        var service = {
            changeMode: changeMode,
            createUser: createUser,
            login: login,
            logout: logout,
            getCreds: getCreds,
            getCurrentUser: getCurrentUser,
            getMode: getMode,
            getSessionId: getSessionId,
            getToken: getToken,
            setMode: setMode
        };

        return service;

        ////////////////////

        function changeMode(){
            userMode = null;
            store.set('userMode', '');
            $state.go('userMode');
        }

        function createUser(user){
            return $http({
                url: server.baseAddress + server.userCreate,
                method: 'POST',
                data: user
            }).then(createUserSucceeded, onError);

            /////////////

            function createUserSucceeded(response){
                store.set('jwt', response.data.id_token);
                $state.go('welcome');
                logger.success('User Created!');
            }
        }

        function getCreds(){
            if(!token){
                recoverSession();
            }
            return {
                sessionId: session,
                token: token,
                user: loggedOnUser,
                userMode: userMode
            }
        }

        function getCurrentUser(){
            // Return current user in a promise
            return $q.when(loggedOnUser);
        }

        function getMode(){
            // Return current user mode in a promise
            return $q.when(userMode);
        }

        function getSessionId(){
            // Return current session in a promise
            return $q.when(session);
        }

        function getToken(){
            // Return current toekn in a promise
            return $q.when(token);
        }

        function login(user){
            return $http({
                url: server.baseAddress + server.userLogin,
                method: 'POST',
                data: user
            }).then(loginSucceeded, onError);

            ///////////////////

            function loginSucceeded(response){
                store.set('jwt', response.data.id_token);
                store.set('user', response.data.user);
                $state.go('userMode');
                loggedOnUser = response.data.user;
                common.$broadcast(constants.events.userLoggedIn, loggedOnUser);
                logger.success('Login Successful');
            }
        }

        function logout(){
            loggedOnUser = null;
            token = null;
            userMode = null;
            session = null;
            store.set('jwt', '');
            store.set('user', '');
            store.set('userMode', '');
            store.set('sid', '');
            common.$broadcast(constants.events.userLoggedOut);
            $state.go('welcome');
            logger.info('Logged Out');
        }

        function onError(error){
            logger.error(error.data);
        }

        function recoverSession(){
            // Get session token if we need it
            if(!token){
                token = store.get('jwt');
            }
            // Only bother getting other creds it we have a token
            if(token){
                if(!loggedOnUser){
                    loggedOnUser = store.get('user');
                    if(loggedOnUser){
                        common.$broadcast(constants.events.userLoggedIn, loggedOnUser);
                    }
                }
                if(!userMode){
                    userMode = store.get('userMode');
                    if(userMode){
                        common.$broadcast(constants.events.userModeSet, userMode);
                    }
                }
                if(!session){
                    session = store.get('sid');
                }
                if(loggedOnUser && userMode && session){
                    logger.info('Recovered session');
                }
            }
        }

        function setMode(mode){
            return $http({
                url: server.baseAddress + server.sessionOpen,
                method: 'POST',
                data: {
                    'mode': mode,
                    'user': loggedOnUser.username
                }
            }).then(setModeSucceeded, setModeFailed);

            ///////////////////////

            function setModeSucceeded(response){
                userMode = mode;
                session = response.data.sessionId;
                store.set('userMode', mode);
                store.set('sid', response.data.sessionId);
                common.$broadcast(constants.events.userModeSet, mode);
                if(mode === constants.modes.teacher) {
                    // Teacher mode
                    $state.go('app.dashboard');
                }else{
                    // Classroom mode
                    $state.go('presentation');
                }
                logger.success('Session opened as ' + mode);
            }

            function setModeFailed(error){
                // Clear variables
                store.set('userMode', '');
                store.set('sid', '');
                onError(error);
            }
        }
    }
})();
