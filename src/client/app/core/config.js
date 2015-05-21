(function () {
    'use strict';

    var core = angular.module('app.core');

    core.config(configure);

    configure.$inject = ['$logProvider', '$mdThemingProvider', 'exceptionConfigProvider', 'toastr'];

    function configure($logProvider, $mdThemingProvider, exceptionConfigProvider, toastr) {
        configureToastr();
        configureLogging();
        configureExceptions();
        configureMaterialDesign();

        function configureToastr() {
            toastr.options.timeOut = 4000;
            toastr.options.positionClass = 'toast-bottom-right';
        }

        function configureLogging() {
            // turn debugging off/on (no info or warn)
            if ($logProvider.debugEnabled) {
                $logProvider.debugEnabled(true);
            }
        }

        function configureExceptions() {
            exceptionConfigProvider.config.appErrorPrefix = '[Ditto Error]';
        }

        function configureMaterialDesign(){
            $mdThemingProvider.theme('default')
                .primaryPalette('cyan')
                .accentPalette('orange');
            //.warmPalette('red')
            //.backgroundPalette('grey');
        }
    }
})();