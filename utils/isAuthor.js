const Campground = require('../models/campground'); // import campground
const objectID = require('mongoose').Types.ObjectId; // import mongoose object id for valid id check
const ExpressError = require('../utils/ExpressError'); // import ExpressError class from utils

module.exports.isAuthor = async(req,res,next) => {
    const {id} = req.params;
    if (!objectID.isValid(id)) throw new ExpressError('Invalid ID', 400);

    const campground = await Campground.findById(id); // find campground from db by id
    // when id is valid but not found in database
    if (!campground) {
        req.flash('error', 'Cannot find that campground!'); // flash error 
        return res.redirect('/campgrounds');
    }
     // if campground is found,
    // check if campground's author is not the user logging in
    // if so, flash error message and redirect to show page
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}