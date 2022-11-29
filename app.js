const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
//const morgan = require('morgan');
const ejsMate = require('ejs-mate'); // use ejs-mate for styling
const ExpressError = require('./utils/ExpressError'); // import ExpressError class from utils
const objectID = require('mongoose').Types.ObjectId; // import mongoose object id for valid id check
//app.use(morgan('dev'));

// const { application } = require('express');
// const { addAbortSignal } = require('stream');
// const { schema } = require('./models/campground');

const campgrounds = require('./routes/campground.js'); // import campground routes
const reviews = require('./routes/review.js');

app.engine('ejs', ejsMate);  
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// use the campground router set
// make sure to place this after app.use(methodOverride)...
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

main().catch(err => console.log("NOT CONNECTED"));

// connect to db
async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
  console.log("CONNECTED")
}


// home
app.get('/', (req,res) => {
    res.render('home.ejs');
})


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