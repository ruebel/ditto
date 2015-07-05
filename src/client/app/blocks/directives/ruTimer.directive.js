(function () {
    'use strict';

    angular
        .module('blocks.directives')
        .directive('ruTimer', ruTimer);

    ////////////////////////////////////////

    function ruTimer() {
        return {
            controller: RuTimerController,
            controllerAs: 'vm',
            replace: true,
            restrict: 'E',
            scope: {
                'startTimer': '=',
                'stopTimer': '=',
                'timer': '='
            },
            templateUrl: getTemplateUrl
        };

        ////////////////////////////////////////

        // Gets the template based on the user mode
        function getTemplateUrl(elem, attrs) {
            var ctrlPage = (attrs.controller === '1' ? 'ruTimerController.html'
                            : 'ruTimerPresentation.html');
            return 'app/blocks/directives/' + ctrlPage;
        }
    }

    RuTimerController.$inject = ['$scope', '$timeout', 'common', 'socket'];

    function RuTimerController($scope, $timeout, common, socket) {
        var vm = this;
        var constants = common.constants;
        var logger = common.logger;

        vm.sendTimerPause = sendTimerPause;
        vm.sendTimerStart = sendTimerStart;
        vm.sendTimerStop = sendTimerStop;
        vm.time = {
            end: undefined,
            hours: 0,
            minutes: 1,
            seconds: 0
        };
        vm.timeMode = 1;
        vm.timer = {
            end: undefined,
            message: 'Fin.',
            pause: false,
            pauseTime: undefined,
            run: false,
            show: false,
            start: undefined,
            timeLeft: undefined
        };

        activate();

        ////////////////////////////////////////

        function activate() {
            // Catch pause timer
            $scope.$on(constants.socketPrefix + constants.socketEvents.timerPause,
                       function(event, data) {
                           logger.info('Timer Paused', data.payload);
                           pause();
                       });
            // Catch start timer
            $scope.$on(constants.socketPrefix + constants.socketEvents.timerStart,
                       function(event, data) {
                           logger.info('Timer Started', data.payload);
                           start(data.payload);
                       });
            // Catch stop timer
            $scope.$on(constants.socketPrefix + constants.socketEvents.timerStop,
                       function(event, data) {
                           logger.info('Timer Stopped', data.payload);
                           stop();
                       });
        }

        // Gets difference between start and end time in ms
        function getTimeDiff(start, end) {
            var diff = (end - start) / 1000;
            return parseTime(diff);
        }

        // Parse ms into hh:mm:ss clock string
        function parseTime(ms) {
            // Break down the hours, minutes, and seconds
            var hours = Math.floor(((ms % 31536000) % 86400) / 3600);
            var mins = Math.floor((((ms % 31536000) % 86400) % 3600) / 60);
            var secs = Math.min(59, Math.ceil((((ms % 31536000) % 86400) % 3600) % 60));
            // Pad the sections so it looks more like a clock (i.e. 01 instead of 1)
            // Concatenate the hh:mm:ss and return
            return padTime(hours) + ':' + padTime(mins) + ':' + padTime(secs);

            ////////////////////////////////////////////

            // Ensures that each time section is two digits (pads a zero in front if only one)
            function padTime(val) {
                return val.toString().length > 1 ? val : '0' + val;
            }
        }

        // Pause timer
        function pause() {
            // Set pause flag
            vm.timer.pause = true;
            // Store how much time is left so we can resume with that much time
            vm.timer.pauseTime = moment(vm.timer.end) - moment();
        }

        // Send pause timer command
        function sendTimerPause() {
            // Make sure timer is running
            if (vm.timer.run) {
                socket.emit(constants.socketEvents.timerPause, 'test', '0');
            }
        }

        // Send start timer command
        function sendTimerStart() {
            var end;
            if (vm.timeMode === 1) {
                // Countdown mode
                if (vm.timer.pause) {
                    // Paused timer
                    // Add pause time to current time
                    end = moment().add(vm.timer.pauseTime, 'milliseconds');
                    // Clear pause time
                    vm.timer.pauseTime = 0;
                } else {
                    // Regular start
                    // Calculate from Hrs Min Sec
                    end = moment().add(vm.time.hours, 'hours')
                        .add(vm.time.minutes, 'minutes')
                        .add(vm.time.seconds, 'seconds');
                }
            } else {
                // End time mode
                end = moment().startOf('day').add(vm.time.end);
                if (end < moment()) {
                    logger.warning('End time is less than start time');
                    return;
                }
            }
            socket.emit(constants.socketEvents.timerStart, 'test', {end: end});
        }

        // Send stop timer command
        function sendTimerStop() {
            socket.emit(constants.socketEvents.timerStop, 'test', '0');
        }

        // Start the timer
        function start(span) {
            vm.timer.end = span.end;
            vm.timer.timeLeft = getTimeDiff(moment(), moment(vm.timer.end));
            vm.timer.run = true;
            vm.timer.show = true;
            vm.timer.pause = false;
            doTimer();
        }

        // Stop the timer
        function stop() {
            // Clearn run and pause flags
            vm.timer.run = false;
            vm.timer.pause = false;
        }

        // Timer running 'thread'
        function doTimer() {
            // Check if we are still running
            if (!vm.timer.run || vm.timer.pause) {
                return;
            }
            // Check if time has run out
            if (moment(vm.timer.end) <= moment()) {
                // Time is up
                vm.timer.messasge = 'Fin.';
                vm.timer.run = false;
                return;
            } else if (!vm.timer.pause) {
                // Update time and continue running
                vm.timer.timeLeft = getTimeDiff(moment(), moment(vm.timer.end));
            }
            // wait and update every 250 ms
            $timeout(doTimer, 250);
        }
    }
})();
