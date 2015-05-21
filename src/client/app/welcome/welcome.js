(function(){
    'use strict';

    angular
        .module('app.welcome')
        .controller('Welcome', Welcome);

    Welcome.$inject = ['$state', 'common', 'security'];

    function Welcome($state, common, security){
        /*jshint validthis: true */
        var vm = this;
        var constants = common.constants;
        var logger = common.logger;

        vm.keyPress = keyPress;
        vm.login = login;
        vm.signup = signup;
        vm.user = {
            username: '',
            password: ''
        };

        activate();

        ////////////////////

        function activate(){
        }

        function login(){
            security.login(vm.user);
        }

        function keyPress($event){
            if($event.which === constants.keyCodes.enter){
                login();
            }
        }

        function signup(){
            $state.go('signup');
        }
    }
})();