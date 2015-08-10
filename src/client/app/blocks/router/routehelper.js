(function() {
    'use strict';

    angular
        .module('blocks.router')
        .run(routehelper);

    routehelper.$inject = ['$rootScope', '$state', 'security', 'store'];

    function routehelper($rootScope, $state, security, store) {

        init();

        /////////////

        function init() {
            requireLogin();
            updateTitle();
        }

        function updateTitle() {
            $rootScope.$on('$routeChangeSuccess', function(e, nextRoute) {
                if (nextRoute.$$route && angular.isDefined(nextRoute.$$route.pageTitle)) {
                    $rootScope.pageTitle = nextRoute.$$route.pageTitle + ' | ditto';
                }
            });
        }

        function requireLogin() {
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
                var requireLogin = toState.data.requireLogin;
                if (requireLogin) {
                    var creds = security.getCreds();
                    // Login required for current route
                    if (!creds.token || !creds.user) {
                        // we don't have a valid one of the following (security token, user)
                        // go back to welcome screen and force login
                        event.preventDefault();
                        $state.go('welcome');
                    }
                    else if (!creds.userMode && toState.name !== 'userMode') {
                        // we have a valid token and user but not a mode or session
                        event.preventDefault();
                        $state.go('userMode');
                    }
                }
            });
        }
    }
})();
