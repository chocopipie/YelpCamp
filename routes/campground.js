const express = require('express');
const router = express.Router(); // create router obj
const wrapAsync = require('../utils/wrapAsync'); // import wrapAsync function from utils
const ExpressError = require('../utils/ExpressError'); // import ExpressError class from utils
const Campground = require('../models/campground'); // import campground
const objectID = require('mongoose').Types.ObjectId; // import mongoose object id for valid id check
const { campgroundSchema } = require('../schemas');
const { isLoggedIn } = require('../utils/isLoggedIn'); // import function to check if user is logged in or not (library: passport)

// use JOi for vaLidation
const validateCampground = (req,res,next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else {
        next();
    }
}

// display all campgrounds
router.get('/', wrapAsync(async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
}))

// goto form to add new campground
router.get('/new', isLoggedIn, wrapAsync(async(req,res) => {
    res.render('campgrounds/new.ejs');
}))

// create and save campground to db
router.post('/', isLoggedIn, validateCampground, wrapAsync(async(req,res) => {
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id; // save current user id to author of newCampground (the person that signed in and create new campground)
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!'); // flash success msg before redirecting
    res.redirect(`campgrounds/${newCampground._id}`);
}))

// display single campground
router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!objectID.isValid(id)) throw new ExpressError('Invalid ID', 400); // when id is invalid
    const campground = await Campground.findById(id).populate('reviews').populate('author');
    console.log(campground.author);
    // when id is valid but not found in database
    if (!campground) {
        req.flash('error', 'Cannot find that campground!'); // flash error 
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', { campground });
}))

// goto form to edit campground
router.get('/:id/edit', isLoggedIn, wrapAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    // when id is valid but not found in database
    if (!campground) {
        req.flash('error', 'Cannot find that campground!'); // flash error 
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', { campground });
}))

// make change and save to the db
router.put('/:id', isLoggedIn, validateCampground, wrapAsync(async (req,res) => {
    const { id } = req.params;
    if (!objectID.isValid(id)) throw new ExpressError('Invalid ID', 400);
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete 1 item by id
router.delete('/:id', isLoggedIn, wrapAsync(async (req,res) => {
    const { id } = req.params;
    if (!objectID.isValid(id)) throw new ExpressError('Invalid ID', 400);
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}))

// export router
module.exports = router;