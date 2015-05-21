(function(){
    'use strict';

    angular
        .module('app.login')
        .controller('UserMode', UserMode);

    UserMode.$inject = ['common', 'security'];

    function UserMode(common, security){
        /*jshint validthis: true */
        var vm = this;
        var logger = common.logger;

        vm.classClick = classClick;
        vm.teacherClick = teacherClick;

        activate();

        ////////////////////

        function activate(){

        }

        function classClick(){
            security.setMode(common.constants.modes.class);
        }

        function teacherClick(){
            security.setMode(common.constants.modes.teacher);
        }
    }
})();