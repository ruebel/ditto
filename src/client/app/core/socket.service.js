(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('socket', socketService);

    ////////////////////

    socketService.$inject = ['constants', 'socketFactory'];

    function socketService(constants, socketFactory) {
        var events = constants.socketEvents;
        var socket = socketFactory();

        // Forward all socket events
        for (var key in events) {
            if (events.hasOwnProperty(key)) {
                socket.forward(events[key]);
            }
        }

        return socket;
    }
})();
