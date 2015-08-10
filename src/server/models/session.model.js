var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var sessionSchema = new Schema({
    userId: Schema.Types.ObjectId,
    start: {type: Date, default: Date.now},
    connections: {type: Number}
});

module.exports = mongoose.model('session', sessionSchema);
