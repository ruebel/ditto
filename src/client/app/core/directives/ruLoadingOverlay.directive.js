(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('ruLoadingOverlay', ruLoadingOverlay);

    ////////////////////

    ruLoadingOverlay.$inject = ['constants', '$timeout'];

    function ruLoadingOverlay(constants, $timeout) {
        var events = constants.events;

        var service = {
            restrict: 'E',
            templateUrl: '/app/core/directives/ruLoadingOverlay.html',
            scope: true,
            link: loadingOverlayLink
        };

        return service;

        ////////////////////

        function loadingOverlayLink(scope, element) {
            var showing = false;
            var timer = null;
            var veil = $('<div class="loading-veil"></div>').insertAfter(element);
            scope.message = '';

            scope.$on(events.showLoadingOverlay, showOverlay);
            scope.$on(events.hideLoadingOverlay, hideOverlay);

            ////////////////////

            function showOverlay(event, message) {
                scope.message = message;
                element.addClass('lift').addClass('show-overlay');
                element.off('transitionend.loadingOverlay');

                if (!showing) {
                    timer = $timeout(showVeil, 750);
                }
                showing = true;
            }

            function hideOverlay() {
                cancelTimer();
                element.one('transitionend.loadingOverlay', finishHide);
                element.removeClass('show-overlay');
                veil.addClass('hide-veil').removeClass('show-veil');
                showing = false;

                ////////////////////

                function finishHide() {
                    element.removeClass('lift');
                    veil.removeClass('lift').removeClass('hide-veil');
                }
            }

            function showVeil() {
                veil.removeClass('hide-veil').addClass('lift').addClass('show-veil');
            }

            function cancelTimer() {
                if (timer) {
                    $timeout.cancel(timer);
                }
                timer = null;
            }
        }
    }
})();
