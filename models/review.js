// THIS FILE DEFINES THE SCHEMA AND CREATE REVIEW MODEL

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

// construct model
const Review = mongoose.model('Review', reviewSchema);

// export module
module.exports = Review;