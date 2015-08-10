module.exports = function (io) {
    'use strict';

    var events = {
        disconnect: 'disconnect',
        message: 'message',
        subscribe: 'subscribe',
        timerPause: 'timer.pause',
        timerStart: 'timer.start',
        timerStop: 'timer.stop'
    };

    io.on('connection', function (socket) {
        // Catch socket events
        socket.on(events.disconnect, disconnect);
        socket.on(events.message, message);
        socket.on(events.subscribe, subscribe);
        socket.on(events.timerPause, timerPause);
        socket.on(events.timerStart, timerStart);
        socket.on(events.timerStop, timerStop);

        // Connect the user
        connect();

        ///////////////////

        function connect() {
            socket.broadcast.emit('user connected');
            console.log('User Connected');
        }

        function disconnect() {
            console.log('User Disconnected');
        }

        function logEvent(eventName, from, msg) {
            console.log(eventName + 'received from', from, 'msg', JSON.stringify(msg));
        }

        function message(from, msg) {
            logEvent(events.message, from, msg);

//            io.sockets.to(from).emit(events.message, {
//                payload: msg,
//                source: from
//            });
            io.sockets.in(from.user).emit(events.message, {
                payload: msg,
                source: from.user
            });
        }

        function subscribe(data) {
            logEvent('User Subscribed');
            socket.join(data.user);
            message(data.user, data.userMode + ' Joined Session');
        }

        function timerPause(from, msg) {
            logEvent(events.timerPause, from, msg);

            io.sockets.to(from).emit(events.timerPause, {
                payload: msg,
                source: from
            });
        }

        function timerStart(from, msg) {
            logEvent(events.timerStart, from, msg);

            io.sockets.to(from).emit(events.timerStart, {
                payload: msg,
                source: from
            });
        }

        function timerStop(from, msg) {
            logEvent(events.timerStop, from, msg);

            io.sockets.to(from).emit(events.timerStop, {
                payload: msg,
                source: from
            });
        }
    });
};
