const { campgroundSchema , reviewSchema } = require('../schemas');
const ExpressError = require('../utils/ExpressError'); // import ExpressError class from utils

// middleware to validate campground (check if input if appropriate or not) - use when creating and updating
// use JOi for vaLidation
module.exports.validateCampground = (req,res,next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else {
        next();
    }
}

// middleware to validate review (check if input if appropriate or not) - use when creating and updating
// use JOi for vaLidation
module.exports.validateReview = (req,res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else {
        next();
    }
}