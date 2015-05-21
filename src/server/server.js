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
var oneDay = 86400000;
var pkgPath = environment === "dev" ? './../../package.json' : __dirname + '/package.json';
var pkg = require(pkgPath);
// Try to get openshift variables and if they aren't there use local hosting variables
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.use(bodyParser.urlencoded({extended: true}));   // Support URL-encoded bodies
app.use(bodyParser.json());                         // Support JSON-encoded bodies
app.use(compress());                                // Compress response data with gzip
app.use(logger('dev'));                             // logger
app.use(favicon(__dirname + '/favicon.ico'));// favicon
app.use(cors());                                    // enable ALL CORS requests
app.use(errorHandler.init);                         // Error handler

///////////////////////////////////////////////////////////////////
// ROUTES
app.use('/sessions', sessions);
app.use('/users', users);
// Set up socket server
require('./sockets/base')(io);

console.log('IP=' + server_ip_address);
console.log('PORT=' + server_port);
console.log('NODE_ENV=' + environment);

///////////////////////////////////////////////////////////////////
// APP
switch(environment){
    default:
        console.log('** STAGE **');
        app.use('/', express.static(__dirname + '/client/'));
        // production error handler
        // no stacktraces leaked to user
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
        app.use('/', express.static(pkg.paths.client, {maxAge: oneDay}));
        // Serve bower components
        app.use('/', express.static('G:/Code/Ditto/', {maxAge: oneDay}));
        // development error handler
        // will print stacktrace
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
server.listen(server_port, server_ip_address, function (err) {
    console.log('************************');
    console.log('Ditto Server');
    console.log('Listening on ' + server_ip_address + ', port ' + server_port);
    console.log('\nRemember to first start MongoDb server');
    console.log('env = ' + app.get('env') +
        '\n__dirname = ' + __dirname +
        '\nprocess.cwd() = ' + process.cwd());
    console.log('************************');
});