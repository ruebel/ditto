(function () {
    'use strict';

    angular
        .module('blocks.directives')
        .directive('ruDisposeOnLoad', ruDisposeOnLoad);

    ////////////////////

    ruDisposeOnLoad.$inject = [];

    function ruDisposeOnLoad() {

        return {
            restrict: 'A',
            scope: true,
            link: disposeOnLoadLink
        };

        ////////////////////

        function disposeOnLoadLink(scope, element) {

            scope.$on('appLoaded', function () {
                element.remove();
            });
        }
    }
})();
