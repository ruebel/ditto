(function () {
    'use strict';

    angular.module('app.core', [
        /*
         * Angular modules
         */
        'ngAnimate',  // Angular Animations
        'ngSanitize',
        'ngMessages',  // Angular validation messages
        'ngMaterial',  // Angular Material Design

        /*
         * Our reusable cross app code modules
         */
        'blocks.directives',
        'blocks.exception',
        'blocks.logger',
        'blocks.router',

        /*
         * 3rd Party modules
         */
        'angular-jwt', // json web token service
        'angular-storage', // Angular Storage
        'btford.socket-io', // Angular - SocketIO shim
    ]);
})();
