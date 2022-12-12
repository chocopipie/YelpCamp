// THIS FILE DEFINES THE SCHEMA AND CREATE MAIN MODEL

const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// every image will have width 200 (w_200)
// link to a single image: https://res.cloudinary.com/dmrxxot2x/image/upload/v1670827501/YelpCamp/g3va1oipuetgmh1cg0pu.jpg
// adding /w_200 after /upload will set the width of the img to 200pixels
// so, here we are trying to plug that in the url
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

// post-middleware, happening when deleting a campground
// after campground in Campground is deleted, delete all corresponding reviews from Review
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

// construct model
const Campground = mongoose.model('Campground', CampgroundSchema);

// export module
module.exports = Campground;