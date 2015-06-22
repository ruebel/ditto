(function () {
    'use strict';

    angular
        .module('app.layout')
        .controller('Shell', Shell);

    Shell.$inject = ['$mdBottomSheet', '$rootScope', 'common', 'security'];

    function Shell($mdBottomSheet, $rootScope, common, security) {
        /*jshint validthis: true */
        var vm = this;
        var constants = common.constants;

        vm.mode = '';
        vm.modeIcon = getModeIcon;
        vm.showMenu = showMenu;
        vm.title = constants.appTitle;
        vm.user = undefined;
        vm.userNameClicked = userNameClicked;

        activate();

        ////////////////////

        function activate() {
            getCurrentUser();
            getMode();
            // Catch user log on
            $rootScope.$on(common.constants.events.userLoggedIn, function(event, data) {
                vm.user = data;
            });
            // Catch user log off
            $rootScope.$on(common.constants.events.userLoggedOut, function(event, data) {
                vm.user = null;
            });
            // Catch user mode set
            $rootScope.$on(common.constants.events.userModeSet, function(event, data) {
                vm.mode = data;
            });
        }

        function getCurrentUser() {
            security.getCurrentUser()
                .then(function(user) {
                    vm.user = user;
                });
        }

        function getMode() {
            security.getMode()
                .then(function (mode) {
                    vm.mode = mode;
                });
        }

        function getModeIcon() {
            switch (vm.mode){
                case constants.modes.teacher:
                    return 'fa-users';
                case constants.modes.class:
                    return 'fa-users';
                default:
                    return '';
            }
        }

        function userNameClicked($event) {
            $mdBottomSheet.show({
                templateUrl: '/app/layout/userMenu.html',
                controller: 'UserMenu',
                targetEvent: $event
            }).then(function(clickedItem) {
                switch (clickedItem.name){
                    case 'Log Out':
                        security.logout();
                        break;
                    case 'Mode':
                        security.changeMode();
                        break;
                }
            });
        }

        function showMenu($event) {
            common.$broadcast(constants.events.showLeftNav, $event);
        }
    }
})();
