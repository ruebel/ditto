(function(){
    'use strict';

    angular
        .module('app.signup')
        .controller('SignUp', SignUp);

    SignUp.$inject = ['$scope', '$state', 'common', 'security'];

    function SignUp($scope, $state, common, security){
        /*jshint validthis: true */
        var vm = this;
        var constants = common.constants;
        var logger = common.logger;

        vm.cancel = cancel;
        vm.createUser = createUser;
        vm.keyPress = keyPress;
        vm.user = {
            username: '',
            password: '',
            password2: '',
            firstName: '',
            lastName: ''
        };

        activate();

        ////////////////////

        function activate(){
        }

        function cancel(){
            // Go back to the welcome screen if user doesn't want to sign up
            $state.go('welcome');
        }

        function createUser(){
            if(vm.user.password != vm.user.password2){
                vm.user.password = '';
                vm.user.password2 = '';
                logger.error('The passwords do not match');
                return;
            }
            security.createUser(vm.user);
        }

        function keyPress($event){
            if($event.which === constants.keyCodes.enter){
                createUser();
            }
        }
    }
})();