var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var sessionSchema = new Schema({
    userId: Schema.Types.ObjectId,
    start: {type: Date, default: Date.now}
});

module.exports = mongoose.model('session', sessionSchema);
