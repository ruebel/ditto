(function () {
    'use strict';

    angular
        .module('app.layout')
        .controller('UserMenu', UserMenu);

    UserMenu.$inject = ['$mdBottomSheet'];

    function UserMenu($mdBottomSheet) {
        /*jshint validthis: true */
        var vm = this;

        vm.items = undefined;
        vm.itemClicked = itemClicked;

        activate();

        ////////////////////

        function activate() {
            vm.items = [
                {
                    name: 'Log Out',
                    icon: 'fa-sign-out'
                },
                {
                    name: 'Mode',
                    icon: 'fa-cogs'
                }
            ];
        }

        function itemClicked($index) {
            var clickedItem = vm.items[$index];
            $mdBottomSheet.hide(clickedItem);
        }
    }
})();
