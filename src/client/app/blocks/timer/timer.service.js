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
            // find the different (divide by 1000 for seconds)
            var diff = (end - start) / 1000;
            // Parse the time to a clock format and return it
            return parseToClockTime(diff);
        }

        function parseToClockTime(ms) {
            // Find the hours
            var hours = Math.floor(((ms % 31536000) % 86400) / 3600);
            // Find minutes
            var mins = Math.floor((((ms % 31536000) % 86400) % 3600) / 60);
            // Find seconds
            var secs = Math.min(59, Math.ceil((((ms % 31536000) % 86400) % 3600) % 60));
            // Return as a clock format
            return padTime(hours) + ':' + padTime(mins) + ':' + padTime(secs);

            ////////////////////////////////

            function padTime(val) {
                // pad a 1 digit number to read 01 instead of 1
                // to keep consistent clock spacing
                return val.toString().length > 1 ? val : '0' + val;
            }
        }

        function start(span) {
            // Get the end
            timer.end = span.end;
            // Find time left
            timer.timeLeft = getTimeDiff(moment(), moment(timer.end));
            // Set running flag
            timer.run = true;
            // Start the timer running
            runTimer();
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
