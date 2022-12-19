// if we are running our code in development mode,
// then we require dotenv package (take secret in .env and add it to process.env)
// this will look for .env file in root directory
//if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
//}


const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
//const morgan = require('morgan');
const ejsMate = require('ejs-mate'); // use ejs-mate for styling
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError'); // import ExpressError class from utils
const passport = require('passport');  // require passport 
const LocalStrategy = require('passport-local'); // require passport strategy
const User = require('./models/user.js'); // require user model
const mongoSanitize = require('express-mongo-sanitize'); //  middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection.
const helmet = require('helmet'); // secure your Express apps by setting various HTTP headers.

const userRoutes = require('./routes/user.js');
const campgroundRoutes = require('./routes/campground.js'); // import campground routes
const reviewRoutes = require('./routes/review.js');

const dbUrl = process.env.DB_URL; // mongo cloud connection variable
//const dbUrl = 'mongodb://localhost:27017/yelp-camp'
const MongoStore = require('connect-mongo'); // mongo store for session

app.engine('ejs', ejsMate);  
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); // use static asset - public folder


const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: 'thisshouldbeabettersecret',
    touchAfter: 24 * 60 * 60 // auto save if nothing change 1 day (in seconds)
})

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store,
    name: 'van',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    // secure: true, // cookies can only be accessible via http
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1000 ms * 60 * 60 * 24 * 7 - means 1 week after today
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
// To remove data using these defaults:
app.use(mongoSanitize());

// middlewares for session and flash
app.use(session(sessionConfig));
app.use(flash());
//app.use(helmet()); - enable all middleware (default)
// This disables the `contentSecurityPolicy` middleware but keeps the rest.
app.use(helmet({contentSecurityPolicy: false}));

// middlewares for passport
app.use(passport.initialize()); // initialize passport
app.use(passport.session());  // use session for persistent login - MAKE SURE THAT app.use(session()); IS BEFORE THIS LINE

// choose a strategy for passport to use (passport-local) which will be located on User model
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser()); // how we store user in session
passport.deserializeUser(User.deserializeUser()); // how we unstore a user in session

// middleware to display flash 'success' on every route
// make sure to put this before using any route handler
app.use((req,res,next) => {
    // check if there is a returnTo url in session (url b4 redirecting to login)
    // ***
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    // ***
    //By default, when authentication succeeds, the req.user property is set to the authenticated use
    res.locals.currentUser = req.user; // set req.user to currentUser of session
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// use the campground router set
// make sure to place this after app.use(methodOverride)...
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

main().catch(err => console.log("NOT CONNECTED"));
// mongodb://localhost:27017/yelp-camp
//dbUrl, {}
// connect to db
async function main() {
    mongoose.set("strictQuery", false);
  await mongoose.connect(dbUrl, {});
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})