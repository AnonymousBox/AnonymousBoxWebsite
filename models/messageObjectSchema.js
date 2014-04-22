var mongoose = require('mongoose');
var moment = require('moment');
var MessageSchema = new mongoose.Schema({
        message: String,
        created: {type: Date, default: Date.now()},
        staytime: Number,
        distance: Number,
        temperature: Number,
        pictureurls: [String]
    },
    {
        toObject: {virtuals: true},
        toJSON: {virtuals: true}

});
MessageSchema
    .virtual('getDate').get(function(){
        return moment(this._id.getTimestamp()).zone("-03:00").format('MMMM Do YYYY. h:mm:ss a');
    });

exports.MessageSchema = MessageSchema;
