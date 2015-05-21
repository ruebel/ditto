(function(){
    'use strict';

    angular
        .module('app.layout')
        .controller('Main', Main);

    Main.$inject = ['$mdComponentRegistry', '$mdSidenav', '$rootScope', '$scope', 'common'];

    function Main($mdComponentRegistry, $mdSidenav, $rootScope, $scope, common){
        /*jshint validthis: true */
        var vm = this;
        var constants = common.constants;
        var logger = common.logger;
        var mode = undefined;

        vm.nav = {
            allow: true,
            id: 'sitenav'
        };
        vm.title = constants.appTitle

        activate();

        ////////////////////

        function activate(){
            // Catch nav bar events
            $scope.$on('showNav', showNav);
            $scope.$on('hideNav', hideNav);
            $scope.$on('toggleNav', toggleNav);
            // Catch user mode events
            $rootScope.$on(constants.events.userModeSet, userModeChanged);
        }

        function hideNav(){
            //$mdSidenav(navId).close();
            $mdComponentRegistry.when(vm.nav.id).then(function(it){
                it.close();
            });
        }

        function showNav(){
            // Only show nav if we are in teacher mode
            if(vm.nav.allow){
                //$mdSidenav(navId).open();
                $mdComponentRegistry.when(vm.nav.id).then(function(it){
                    it.open();
                });
            }
        }

        function toggleNav(){
            // Only show nav if we are in teacher mode
            if(vm.nav.allow){
                //$mdSidenav(navId).toggle();
                $mdComponentRegistry.when(vm.nav.id).then(function(it){
                    it.toggle();
                });
            }
        }

        function userModeChanged(event, modeSet){
            // Cache mode
            mode = modeSet;
            // Hide nav if we are in class mode
            if(mode === constants.modes.teacher){
                vm.nav.allow = true;
                //hideNav();
            }
        }
    }
})();