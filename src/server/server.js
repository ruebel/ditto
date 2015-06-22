/*jshint node:true*/
'use strict';

///////////////////////////////////////////////////////////////////
// PLUGINS
var path            = require('path');
var express         = require('express');
var app             = express();
var http            = require('http');
var server          = http.createServer(app);
var bodyParser      = require('body-parser');
var compress        = require('compression');
var cors            = require('cors');
var errorHandler    = require('./routes/utils/errorHandler')();
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var io              = require('socket.io').listen(server);
var dataconfig      = require('./data.config.js')();
var UserProfileModel = require('./models/userProfile.model.js');
var sessions        = require('./routes/sessions')(dataconfig);
var users           = require('./routes/user')(dataconfig, UserProfileModel);

///////////////////////////////////////////////////////////////////
// VARIABLES
console.log('dirname: ' + __dirname);
var environment = process.env.NODE_ENV;
// Try to get openshift variables and if they aren't there use local hosting variables
var serverPort = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
var serverIp = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.use(bodyParser.urlencoded({extended: true}));   // Support URL-encoded bodies
app.use(bodyParser.json());                         // Support JSON-encoded bodies
app.use(compress());                                // Compress response data with gzip
app.use(logger('dev'));                             // logger
app.use(favicon(__dirname + '/favicon.ico'));       // favicon
app.use(cors());                                    // enable ALL CORS requests
app.use(errorHandler.init);                         // Error handler

///////////////////////////////////////////////////////////////////
// ROUTES
app.use('/sessions', sessions);
app.use('/users', users);
// Set up socket server
require('./sockets/base')(io);

console.log('IP=' + serverIp);
console.log('PORT=' + serverPort);
console.log('NODE_ENV=' + environment);

///////////////////////////////////////////////////////////////////
// APP
switch (environment) {
    default:
        console.log('** BUILD **');
        // serve client code
        app.use('/', express.static(__dirname + '/client/'));
        // production error handler - no stack traces
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                //error: {}
                error: err
            });
        });
        break;
    case 'dev':
        console.log('** DEV **');
        // Serve client code
        app.use(express.static('./src/client/'));
        // Serve bower components
        app.use(express.static('./'));
        // Serve template cache
        app.use(express.static('./tmp'));
        // Route for index html
        app.use('/*', express.static('./src/client/index.html'));
        // development error handler w/ stack traces
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
        break;
}

///////////////////////////////////////////////////////////////////
// SERVER
server.listen(serverPort, serverIp, function (err) {
    console.log('************************');
    console.log('Ditto Server');
    console.log('Listening on ' + serverIp + ', port ' + serverPort);
    console.log('\nRemember to first start MongoDb server');
    console.log('env = ' + app.get('env') +
        '\n__dirname = ' + __dirname +
        '\nprocess.cwd() = ' + process.cwd());
    console.log('************************');
});
