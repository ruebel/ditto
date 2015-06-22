module.exports = function (io) {
    'use strict';

    var events = {
        disconnect: 'disconnect',
        message: 'message',
        timerStart: 'timer.start',
        timerStop: 'timer.stop'
    };

    io.on('connection', function (socket) {
        // Catch socket events
        socket.on(events.message, message);
        socket.on(events.timerStart, timerStart);
        socket.on(events.timerStop, timerStop);
        socket.on(events.disconnect, disconnect);
        // Connect the user
        connect();

        ///////////////////

        function connect() {
            socket.broadcast.emit('user connected');
            console.log('User Connected');
        }

        function disconnect() {
            console.log('user disconnected');
        }

        function logEvent(eventName, from, msg) {
            console.log(eventName + 'received from', from, 'msg', JSON.stringify(msg));
        }

        function message(from, msg) {
            logEvent(events.message, from, msg);

            io.sockets.emit(events.message, {
                payload: msg,
                source: from
            });
        }

        function timerStart(from, msg) {
            logEvent(events.timerStart, from, msg);

            io.sockets.emit(events.timerStart, {
                payload: msg,
                source: from
            });
        }

        function timerStop(from, msg) {
            logEvent(events.timerStop, from, msg);

            io.sockets.emit(events.timerStop, {
                payload: msg,
                source: from
            });
        }
    });
};
