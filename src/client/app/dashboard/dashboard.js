(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('Dashboard', Dashboard);

    Dashboard.$inject = ['$scope', 'common', 'socket'];

    function Dashboard($scope, common, socket) {
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

        // TODO: Test Method - Remove for production
        function sendMessage() {
            socket.emit(constants.socketEvents.message, 'test', 'test message');
        }
    }
})();
