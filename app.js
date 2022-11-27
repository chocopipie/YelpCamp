const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
//const morgan = require('morgan');
const ejsMate = require('ejs-mate'); // use ejs-mate for styling
const ExpressError = require('./utils/ExpressError'); // import ExpressError class from utils
const wrapAsync = require('./utils/wrapAsync'); // import wrapAsync function from utils
const objectID = require('mongoose').Types.ObjectId; // import mongoose object id for valid id check
const Joi = require('joi');
//app.use(morgan('dev'));

const Campground = require('./models/campground');
const Review = require('./models/review');
const { application } = require('express');
const { addAbortSignal } = require('stream');
const { schema } = require('./models/campground');
const { campgroundSchema, reviewSchema } = require('./schemas')

app.engine('ejs', ejsMate);  
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

main().catch(err => console.log("NOT CONNECTED"));

// connect to db
async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
  console.log("CONNECTED")
}

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

const validateReview = (req,res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else {
        next();
    }
}

// home
app.get('/', (req,res) => {
    res.render('home.ejs');
})

// display all campgrounds
app.get('/campgrounds', wrapAsync(async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
}))

// goto form to add new campground
app.get('/campgrounds/new', wrapAsync(async(req,res) => {
    res.render('campgrounds/new.ejs');
}))

// create and save campground to db
app.post('/campgrounds', validateCampground, wrapAsync(async(req,res) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`campgrounds/${newCampground._id}`);
}))

// display single campground
app.get('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!objectID.isValid(id)) throw new ExpressError('Invalid ID', 400); // when id is invalid
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) throw new ExpressError('Data Not Found',404); // when id is valid but not found in database
    res.render('campgrounds/show.ejs', { campground });
}))

// goto form to edit campground
app.get('/campgrounds/:id/edit', wrapAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit.ejs', { campground });
}))

// make change and save to the db
app.put('/campgrounds/:id', validateCampground, wrapAsync(async (req,res) => {
    const { id } = req.params;
    if (!objectID.isValid(id)) throw new ExpressError('Invalid ID', 400);
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete 1 item by id
app.delete('/campgrounds/:id', wrapAsync(async (req,res) => {
    const { id } = req.params;
    if (!objectID.isValid(id)) throw new ExpressError('Invalid ID', 400);
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))


// create and save a new review to db
app.post('/campgrounds/:id/reviews', validateReview, wrapAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id); // find the campground we are adding rv too
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete a review
app.delete('/campgrounds/:id/reviews/:reviewId', (wrapAsync(async (req,res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
})))

// invalid route
app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404));
})

// custom error handler for all errors
app.use((err,req,res,next) => {
    const { statusCode = 500} = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error.ejs', { err });
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
})