var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    username: { type: String, trim: true },
    passwordHash: { type: String },
    passwordSalt: {
        type: String,
        default: generateSalt
    }
});

////////////////

function generateSalt(){
    return Math.round((new Date().valueOf() * Math.random())) + '';
}

module.exports = mongoose.model('user', userSchema);