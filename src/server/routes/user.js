module.exports = function(dataconfig, UserProfileModel) {
    var express    = require('express'),
        _          = require('lodash'),
        config     = require('./../config'),
        jwt        = require('jsonwebtoken'),
        crypto     = require('crypto');

    var app = module.exports = express.Router();
    var collections = dataconfig.collections;
    var User = collections.user;

    console.log('Loading User Routes');

    app.post('/create', function(req, res) {
        // Check inputs
        if (!req.body.username || !req.body.password) {
            return res.status(401).send('Email and password are required');
        }
        // Look for existing user record
        User.findOne({username: req.body.username}, foundUser);

        ///////////////////////

        function foundUser(err, user) {
            // check for errors
            if (err) {
                return handleError(err, res);
            }
            // check if user already exists
            if (user) {
                return res.status(401).send('User already exists');
            }
            // create a new user
            var newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username
            });
            // hash their password with their newly created salt
            newUser.passwordHash = getPasswordHash(req.body.password, newUser.passwordSalt);
            // Save user
            newUser.save(userCreated);
        }

        function userCreated(err, user) {
            // check for errors
            if (err) {
                return handleError(err, res);
            }
            // User has been created
            return res.status(201).send('User created');
        }
    });

    app.post('/login', function(req, res) {
        // make sure all inputs were provided
        if (!req.body.username || !req.body.password) {
            return res.status(401).send('You must send the username and the password');
        }
        // look for user record
        User.findOne({username: req.body.username}, foundUser);

        /////////////////////

        function foundUser(err, user) {
            // check for error during query
            if (err) {
                return handleError(err, res);
            }
            // check inputs that the user sent in against the db
            if (!user) {
                return res.status(401).send('The username and password do not match');
            }
            var passwordHash = getPasswordHash(req.body.password, user.passwordSalt);
            // Make sure hashes match
            if (passwordHash !== user.passwordHash) {
                return res.status(401).send('The username and password do not match');
            }

            // Send back id_token and user profile object to client
            res.status(201).send({
                idToken: createToken(user),
                user: new UserProfileModel({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username
                })
            });
        }
    });

    app.post('/logoff', function(req, res) {
        // TODO: log a user off
    });

    app.post('/resetPassword', function(req, res) {
        // TODO: Reset a user's password
    });

    return app;

    /////////////////////////////

    // Creates a secure JWT
    function createToken(user) {
        return jwt.sign(_.omit(user, 'password'), config.secret, {expiresInMinutes: 60 * 5});
    }
    // Hash a password using salt
    function getPasswordHash(password, salt) {
        if (!password) {return '';}
        try {
            return crypto
                .createHmac('sha1', salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    }
    // Handle internal server error
    function handleError(err, res) {
        return res.status(401).send('Internal server error:' + err);
    }
};
