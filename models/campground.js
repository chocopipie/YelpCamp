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

// add this because Mongoose does not include virtuals when you convert a document to JSON.
const opts = {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    // location
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
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
}, opts);

// add the popup text : a link to the campground (this refers to campground object called)
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
});

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