(function(){
    'use strict';

    angular
        .module('app.dashboard')
        .controller('Dashboard', Dashboard);

    Dashboard.$inject = ['$scope', 'common', 'socket', 'store'];

    function Dashboard($scope, common, socket, store){
        /*jshint validthis: true */
        var vm = this;
        var constants = common.constants;
        var logger = common.logger;

        vm.mode = '';
        vm.sendMessage = sendMessage;
        vm.sendTimerStart = sendTimerStart;
        vm.sendTimerStop = sendTimerStop;
        vm.startTimer = undefined;
        vm.stopTimer = undefined;
        vm.time = {
            hours: 0,
            minutes: 1,
            seconds: 0
        };
        vm.timer = {
            run: false,
            end: undefined,
            start: undefined,
            timeLeft: undefined
        };

        activate();

        ////////////////////

        function activate(){
            vm.mode = store.get('userMode');

            $scope.$on(constants.socketPrefix + constants.socketEvents.message, function(event, data){
               logger.info('Message received: ' + data.payload);
            });

            $scope.$on(constants.socketPrefix + constants.socketEvents.timerStart, function(event, data){
                logger.info('Timer Started',data.payload);
                vm.startTimer(data.payload);
            });

            $scope.$on(constants.socketPrefix + constants.socketEvents.timerStop, function(event, data){
                logger.info('Timer Stopped',data.payload);
                vm.stopTimer();
            });
        }

        function sendMessage(){
            socket.emit(constants.socketEvents.message, 'test', 'test message');
        }

        function sendTimerStart(){
            var end = moment().add(vm.time.hours, 'hours')
                .add(vm.time.minutes, 'minutes')
                .add(vm.time.seconds, 'seconds');
            socket.emit(constants.socketEvents.timerStart, 'test', { end: end });
        }

        function sendTimerStop(){
            socket.emit(constants.socketEvents.timerStop, 'test', '0');
        }
    }
})();