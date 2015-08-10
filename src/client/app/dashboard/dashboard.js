(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('Dashboard', Dashboard);

    Dashboard.$inject = ['$scope', 'common', 'security'];

    function Dashboard($scope, common, security) {
        /*jshint validthis: true */
        var vm = this;
        var constants = common.constants;
        var logger = common.logger;

        vm.sendMessage = sendMessage;

        activate();

        ////////////////////

        function activate() {
            // Catch test message
            $scope.$on(constants.socketPrefix + constants.socketEvents.message,
                       function(event, data) {
                           logger.info('Message received: ' + data.payload);
                       });

        }

        function sendMessage() {
            security.emit(constants.socketEvents.message, 'Test Message');
        }
    }
})();
