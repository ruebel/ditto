(function () {
    'use strict';

    angular
        .module('blocks.directives')
        .directive('ruTimer', ruTimer);

    ////////////////////

    ruTimer.$inject = ['$timeout'];

    function ruTimer($timeout) {
        var vm;

        return {
            link: link,
            replace: true,
            scope: {
                'startTimer': '=',
                'stopTimer': '=',
                'timer': '='
            },
            restrict: 'E',
            template: '<div></div>'
        };

        ////////////////////

        function getTimeDiff(start, end){
            if(end < start){
                end.setDate(end.getDate()+1);
            }
            var diff = (end - start) / 1000;
            return parseTime(diff);
        }

        function link(scope, element) {
            vm = scope;
            vm.startTimer = start;
            vm.stopTimer = stop;
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
            vm.timer.run = true;
            doTimer();
        }

        function stop(){
            vm.timer.run = false;
        }

        function doTimer(){
            if(!vm.timer.run) return;
            if(moment(vm.timer.end) <= moment()){
                vm.timer.timeLeft = "That's all folks";
                vm.timer.run = false;
                return;
            } else{
                vm.timer.timeLeft = getTimeDiff(moment(), moment(vm.timer.end));
            }
            $timeout(doTimer, 250);
        }
    }
})();
