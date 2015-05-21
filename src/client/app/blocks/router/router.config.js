(function(){
    'use strict';

    var app = angular.module('blocks.router');
    app.config(configure);

    configure.$inject = ['$httpProvider', '$stateProvider', '$urlRouterProvider', 'jwtInterceptorProvider'];

    function configure($httpProvider, $stateProvider, $urlRouterProvider, jwtInterceptorProvider) {
        // any unmatched url, redirected to welcome page
        $urlRouterProvider.otherwise('/');

        jwtInterceptorProvider.tokenGetter = tokenGetter;

        tokenGetter.$inject = ['store'];
        function tokenGetter(store){
            return store.get('jwt');
        }

        $httpProvider.interceptors.push('jwtInterceptor');

        // Set up requireLogin flag
        $stateProvider
            .state('welcome', {
                url: '/',
                templateUrl: 'app/welcome/welcome.html',
                data: {
                    requireLogin: false
                }
            })
            .state('signup', {
                url: '/signup',
                templateUrl: 'app/signup/signup.html',
                data: {
                    requireLogin: false
                }
            })
            .state('userMode', {
                url: '/usermode',
                templateUrl: 'app/login/userMode.html',
                data: {
                    requireLogin: true
                }
            })
            .state('app', {
                abstract: true,
                templateUrl: 'app/layout/main.html',
                data: {
                    requireLogin: true // this property will apply to all children of 'app'
                }
            })
            .state('app.dashboard', {
                url: '/dashboard',
                templateUrl: 'app/dashboard/dashboard.html',
                data: {
                    requireLogin: true
                }
            })
            .state('presentation', {
                url: '/presentation',
                templateUrl: 'app/presentation/presentation.html',
                data: {
                    requireLogin: true
                }
            });
    }
})();