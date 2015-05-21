// Note: this service is exposed in the common module as common.loading
//
// The Loading service offers an API to manipulate the loading overlay
//     for the main content area of the app. Calling the loading function
//     will show or hide the loading overlay depending on what is passed in.
//
//     Accepted values:
//         true:   The loading overlay is shown with "Loading..." as the message
//         string: The loading overlay is shown with the passed string as the message
//         false:  The loading overlay is hidden
(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('loading', loadingService);

    ////////////////////

    loadingService.$inject = ['$rootScope', 'constants'];

    function loadingService($rootScope, constants) {

        var events = constants.events;

        var currentMessage = null;
        loading.defaultMessage = 'Loading...';

        $rootScope.$on('$routeChangeStart', function () {
            loading(true);
        });

        $rootScope.$on('$routeChangeError', function () {
            loading(false);
        });

        return loading;

        ////////////////////

        function loading(value) {
            if (_.isBoolean(value)) {
                if (value) {
                    currentMessage = loading.defaultMessage;
                    show();
                } else {
                    currentMessage = null;
                    hide();
                }
            }

            if (_.isString(value)) {
                currentMessage = value;
                show();
            }

            return currentMessage;
        }

        function show() {
            if (_.isString(currentMessage)) {
                $rootScope.$broadcast(events.showLoadingOverlay, currentMessage);
            }
        }

        function hide() {
            $rootScope.$broadcast(events.hideLoadingOverlay);
        }

    }

})();
