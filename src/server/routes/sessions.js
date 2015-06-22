module.exports = function(dataconfig) {
    var express    = require('express'),
        _          = require('lodash'),
        config     = require('./../config'),
        jwt        = require('jsonwebtoken');

    var collections = dataconfig.collections;
    var db = dataconfig.db;
    var app = express.Router();
    var Session = collections.session;
    console.log('Loading Sessions Routes');

    app.post('/open', function(req, res) {
        // Check inputs
        if (!req.body) {
            return res.status(400).send('You must provide a session type');
        }
        // Send response with session id
        res.status(201).send({
            sessionId: '1'
        });
        // TODO: Actually create session for user
    });

    app.post('/close', function(req, res) {
        // TODO: Close user's session
    });

    return app;
};
