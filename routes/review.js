const express = require('express');
const router = express.Router({mergeParams: true}); // mergeparams - let review routers get access to param "id" from campground routers

const ExpressError = require('../utils/ExpressError'); // import ExpressError class from utils
const wrapAsync = require('../utils/wrapAsync'); // import wrapAsync function from utils
const Campground = require('../models/campground');
const Review = require('../models/review');
const { isLoggedIn } = require('../utils/isLoggedIn'); // import function to check if user is logged in or not (library: passport)
const { validateReview } = require('../utils/validateModel.js'); // import middleware to check information input (for create and update)
const { isReviewAuthor } = require('../utils/isAuthor.js'); // import middleware to check if current user is the author 

// create and save a new review to db
router.post('/', isLoggedIn, validateReview, wrapAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id); // find the campground we are adding rv too
    const review = new Review(req.body.review);
    review.author = req.user._id; // save current user id to the author id of the new review
    campground.reviews.push(review); // add an review to campground
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req,res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;