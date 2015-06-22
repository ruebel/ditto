(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('timer', timerService);

    ////////////////////

    timerService.$inject = ['$timeout', 'common'];

    function timerService($timeout, common) {
        var constants = common.constants;
        var logger = common.logger;
        var service = {
            start: start,
            stop: stop
        };
        var timer = {
            run: false,
            end: undefined,
            show: false,
            start: undefined,
            timeLeft: undefined
        };

        return service;

        ////////////////////

        function getTimeDiff(start, end) {
            if (end < start) {
                end.setDate(end.getDate() + 1);
            }
            var diff = (end - start) / 1000;
            return parseTime(diff);
        }

        function parseTime(ms) {
            var hours = Math.floor(((ms % 31536000) % 86400) / 3600);
            var mins = Math.floor((((ms % 31536000) % 86400) % 3600) / 60);
            var secs = Math.min(59, Math.ceil((((ms % 31536000) % 86400) % 3600) % 60));

            return padTime(hours) + ':' + padTime(mins) + ':' + padTime(secs);

            ////////////////////////////////

            function padTime(val) {
                return val.toString().length > 1 ? val : '0' + val;
            }
        }

        function start(span) {
            timer.end = span.end;
            timer.timeLeft = getTimeDiff(moment(), moment(timer.end));
            timer.run = true;
            timer();
        }

        function stop() {

        }

        function runTimer() {
            if (!timer.run) {return;}
            if (moment(timer.end) <= moment()) {
                timer.timeLeft = 'That\'s all folks';
                timer.run = false;
                return;
            } else {
                timer.timeLeft = getTimeDiff(moment(), moment(timer.end));
            }
            $timeout(timer, 250);
        }
    }
})();
