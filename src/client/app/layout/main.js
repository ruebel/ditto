(function () {
    'use strict';

    angular
        .module('app.layout')
        .controller('Main', Main);

    Main.$inject = ['$location', '$mdComponentRegistry', '$rootScope', 'security', 'common'];

    function Main($location, $mdComponentRegistry, $rootScope, security, common) {
        /*jshint validthis: true */
        var vm = this;
        var constants = common.constants;
        var logger = common.logger;

        vm.hideNav = hideNav;
        vm.mode = undefined;
        vm.nav = {
            id: 'sitenav'
        };
        vm.states = [
            {name: 'Home', sref: 'app.dashboard', icon: 'fa fa-home'},
            {name: 'Timer', sref: 'app.timer', icon: 'fa fa-clock-o'}
        ];
        vm.title = constants.appTitle;

        activate();

        ////////////////////

        function activate() {
            // Catch nav bar events
            $rootScope.$on(constants.events.showLeftNav, showNav);
            $rootScope.$on(constants.events.hideLeftNav, hideNav);
            $rootScope.$on(constants.events.toggleLeftNav, toggleNav);
            // Get user mode
            getMode();
        }

        function getMode() {
            security.getMode()
                .then(function (mode) {
                    vm.mode = mode;
                });
        }

        function hideNav() {
            $mdComponentRegistry.when(vm.nav.id).then(function(it) {
                it.close();
            });
        }

        function showNav() {
            $mdComponentRegistry.when(vm.nav.id).then(function(it) {
                it.open();
            });
        }

        function toggleNav() {
            $mdComponentRegistry.when(vm.nav.id).then(function(it) {
                it.toggle();
            });
        }
    }
})();
