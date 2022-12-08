const Campground = require('../models/campground');
const Review = require('../models/review');

// function to create a review and save to the db
module.exports.createReview = async (req,res) => {
    const campground = await Campground.findById(req.params.id); // find the campground we are adding rv too
    const review = new Review(req.body.review);
    review.author = req.user._id; // save current user id to the author id of the new review
    campground.reviews.push(review); // add an review to campground
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// function to delete review from db
module.exports.deleteReview = async (req,res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}