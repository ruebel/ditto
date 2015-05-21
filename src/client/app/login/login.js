(function(){
    'use strict';

    angular
        .module('app.login')
        .controller('Login', Login);

    Login.$inject = ['$scope', 'common', 'security'];

    function Login($scope, common, security){
        /*jshint validthis: true */
        var vm = this;
        var constants = common.constants;
        var logger = common.logger;

        vm.cancel = cancel;
        vm.login = login;
        vm.user = {
            username: '',
            password: ''
        };

        activate();

        ////////////////////

        function activate(){
            logger.success('Login loaded!');
        }

        function cancel(){
            return $scope.$dismiss;
        }

        function login(){
            security.login(vm.user);
        }
    }
})();