const express = require('express');
const router = express.Router({mergeParams: true}); // mergeparams - let review routers get access to param "id" from campground routers

const ExpressError = require('../utils/ExpressError'); // import ExpressError class from utils
const wrapAsync = require('../utils/wrapAsync'); // import wrapAsync function from utils
const objectID = require('mongoose').Types.ObjectId; // import mongoose object id for valid id check
const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas');
const { isLoggedIn } = require('../utils/isLoggedIn'); // import function to check if user is logged in or not (library: passport)

const validateReview = (req,res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else {
        next();
    }
}

// create and save a new review to db
router.post('/', isLoggedIn, validateReview, wrapAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id); // find the campground we are adding rv too
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete a review
router.delete('/:reviewId', isLoggedIn, (wrapAsync(async (req,res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
})))

module.exports = router;