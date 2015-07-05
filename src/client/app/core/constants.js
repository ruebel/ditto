/* global toastr:false, moment:false */
(function () {
    'use strict';

    angular
        .module('app.core')
        .constant('moment', moment)
        .constant('toastr', toastr)
        .factory('constants', constants);

    function constants() {

        var appName = 'ditto';

        var dateSettings = {
            shortFormat: 'MM/DD/YYYY',
            longFormat: 'DD-MMMM-YYYY',
            minDate: '1960-01-01',
            maxDate: '2050-12-31'
        };

        var events = {
            hideLeftNav: 'hideLeftNav',
            hideLoadingOverlay: 'hideLoadingOverlay',
            showLeftNav: 'showLeftNav',
            showLoadingOverlay: 'showLoadingOverlay',
            toggleLeftNav: 'toggleLeftNav',
            userLoggedIn: 'userLoggedIn',
            userLoggedOut: 'userLoggedOut',
            userModeSet: 'userModeSet'
        };

        var imageSettings = {
            userImageBasePath: '../Content/images/users/',
            unknownUserImageSource: 'unknown_user.png'
        };

        var modes = {
            class: 'class',
            teacher: 'teacher'
        };

        var remoteServiceNames = {
            //baseAddress: 'http://localhost:8080/',                  // Development
            baseAddress: 'http://ditto-ubel.rhcloud.com:8000/',   // Production
            userCreate: 'users/create',
            userLogin: 'users/login',
            sessionOpen: 'sessions/open'
        };

        var keyCodes = {
            backspace: 8,
            tab: 9,
            enter: 13,
            esc: 27,
            space: 32,
            pageup: 33,
            pagedown: 34,
            end: 35,
            home: 36,
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            insert: 45,
            del: 46
        };

        var socketEvents = {
            disconnect: 'disconnect',
            message: 'message',
            timerPause: 'timer.pause',
            timerStart: 'timer.start',
            timerStop: 'timer.stop'
        };

        return {
            appErrorPrefix: '[' + appName + ' Error] ',
            appTitle: appName,
            dateSettings: dateSettings,
            events: events,
            imageSettings: imageSettings,
            keyCodes: keyCodes,
            modes: modes,
            remoteServiceNames: remoteServiceNames,
            socketPrefix: 'socket:',
            socketEvents: socketEvents,
            version: '1.0.0'
        };
    }
})();
