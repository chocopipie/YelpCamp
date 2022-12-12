const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground'); // import campground model
const ExpressError = require('../utils/ExpressError'); // import ExpressError class from utils
const objectID = require('mongoose').Types.ObjectId; // import mongoose object id for valid id check

// function to find all campgrounds
module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
}

// function to render new form
module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new.ejs');
}

// function to create a new campground and save to db
module.exports.createCampground = async(req,res) => {
    const newCampground = new Campground(req.body.campground);
    // req.files is an array of image files (by multer - return from multipart form)
    // for each file (f) in files array,
    // take f.path and f.filename, map them as an object (key: url, filename) in newCampground.images array
    newCampground.images = req.files.map(f => ({url: f.path, filename: f.filename})) 
    newCampground.author = req.user._id; // save current user id to author of newCampground (the person that signed in and create new campground)
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!'); // flash success msg before redirecting
    res.redirect(`campgrounds/${newCampground._id}`);
}

// function to show a single campground
module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    if (!objectID.isValid(id)) throw new ExpressError('Invalid ID', 400); // when id is invalid
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
        }).populate('author');
    // when id is valid but not found in database
    if (!campground) {
        req.flash('error', 'Cannot find that campground!'); // flash error 
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', { campground });
}

// function to render edit form
module.exports.renderEditForm = async (req,res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);// find campground from db by id

    res.render('campgrounds/edit.ejs', { campground });
}

// function to update campground and save to db
module.exports.updateCampground = async (req,res) => {
    const { id } = req.params;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
            // req.files is an array of image files (by multer - return from multipart form)
    // for each file (f) in files array,
    // take f.path and f.filename, map them as an object (key: url, filename) in a new array
    const imageArray = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imageArray);
    if (req.body.deleteImages) {
        // delete img from cloudinary
        for (let image of req.body.deleteImages) {
            await cloudinary.uploader.destroy(image);
        }
        // delete img from db
        await campground.updateOne(
            {$pull: {images: {filename: {$in: req.body.deleteImages}}}}
        )
    }
    await campground.save();
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}


// function to delete campground from db
module.exports.deleteCampground = async (req,res) => {
    const { id } = req.params;
    // delete
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}