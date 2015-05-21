module.exports = function (){
    var config      = require('./config'),
        mongoose    = require('mongoose');
    var collections = {};
    var db;
    var dbConfig = {
        connString: process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost:27017/',
        dbName: 'ditto'
    };

    // properties with getter functions for export
    Object.defineProperty(this, 'db', {
        get: function() {
            return db;
        }
    });
    Object.defineProperty(this, 'collections', {
        get: function() {
            return collections;
        }
    });

    openMongo();

    return {
        db: this.db,
        collections: this.collections
    };

    function openMongo(){
        mongoose.connect(dbConfig.connString + dbConfig.dbName);

        db = mongoose.connection;

        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function(callback){
            console.log('Holy crap it worked!');
        });

        var user = require('./models/user.model.js');
        collections['user'] = user;
        var session = require('./models/session.model.js');
        collections['session'] = session;
    }
};


