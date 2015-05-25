(function(){
    'use strict';

    angular
        .module('app.layout')
        .controller('Main', Main);

    Main.$inject = ['$mdComponentRegistry', '$rootScope', 'common'];

    function Main($mdComponentRegistry, $rootScope, common){
        /*jshint validthis: true */
        var vm = this;
        var constants = common.constants;
        var logger = common.logger;

        vm.nav = {
            id: 'sitenav'
        };
        vm.title = constants.appTitle

        activate();

        ////////////////////

        function activate(){
            // Catch nav bar events
            $rootScope.$on(constants.events.showLeftNav, showNav);
            $rootScope.$on(constants.events.hideLeftNav, hideNav);
            $rootScope.$on(constants.events.toggleLeftNav, toggleNav);
        }

        function hideNav(){
            $mdComponentRegistry.when(vm.nav.id).then(function(it){
                it.close();
            });
        }

        function showNav(){
            $mdComponentRegistry.when(vm.nav.id).then(function(it){
                it.open();
            });
        }

        function toggleNav(){
            $mdComponentRegistry.when(vm.nav.id).then(function(it){
                it.toggle();
            });
        }
    }
})();