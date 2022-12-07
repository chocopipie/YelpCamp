// THIS FILE DEFINES THE SCHEMA AND CREATE MODEL FOR USER

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// add on username and pw for user using passport.js (already included hash and encrypt)
userSchema.plugin(passportLocalMongoose); 

// construct model
const User = mongoose.model('User', userSchema);

// export model
module.exports = User;