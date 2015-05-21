(function(){
    'use strict';

    angular
        .module('app.presentation')
        .controller('Presentation', Presentation);

    Presentation.$inject = ['$scope', '$timeout', 'common', 'socket', 'store'];

    function Presentation($scope, $timeout, common, socket, store){
        /*jshint validthis: true */
        var vm = this;
        var constants = common.constants;
        var logger = common.logger;

        vm.mode = '';
        vm.startTimer = undefined;
        vm.stopTimer = undefined;
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
                vm.timer.timeLeft = '';
            });
        }
    }
})();