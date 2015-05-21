(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('timer', timerService);

    ////////////////////

    timerService.$inject = ['common'];

    function timerService(common) {
        var constants = common.constants;
        var logger = common.logger;

        var service = {
            start: start,
            stop: stop
        };

        return service;

        ////////////////////

        function getTimeDiff(start, end){
            if(end < start){
                end.setDate(end.getDate()+1);
            }
            var diff = (end - start) / 1000;
            return parseTime(diff);
        }

        function parseTime(ms) {
            var hours = Math.floor(((ms % 31536000) % 86400) / 3600);
            var mins = Math.floor((((ms % 31536000) % 86400) % 3600) / 60);
            var secs = Math.min(59, Math.ceil((((ms % 31536000) % 86400) % 3600) % 60));

            return padTime(hours) + ":" + padTime(mins) + ":" + padTime(secs);

            ////////////////////////////////

            function padTime(val){
                return val.toString().length > 1 ? val : '0' + val;
            }
        }

        function start(span){
            vm.timer.end = span.end;
            vm.timer.timeLeft = getTimeDiff(moment(), moment(vm.timer.end));
            vm.runTimer = true;
            timer();
        }

        function stop(){

        }

        function timer(){
            if(!vm.runTimer) return;
            if(moment(vm.timer.end) <= moment()){
                vm.timer.timeLeft = "That's all folks";
                vm.runTimer = false;
                return;
            } else{
                vm.timer.timeLeft = getTimeDiff(moment(), moment(vm.timer.end));
            }
            $timeout(timer, 250);
        }
    }
})();
