const User = require('../models/user.js'); // require user model

// function to render register form
module.exports.renderRegisterForm = (req,res) => {
    res.render('users/register');
}

// function to register a new user and log them in
module.exports.registerUser = async (req,res,next) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({username, email});
        const registeredUser = await User.register(newUser,password); // save new user to db at this step
        // log the new user in
        req.login(registeredUser, err => {
            if(err) {
                return next(err);
            }
            req.flash('success', `Hi ${username}. Welcome to Yelp Camp!`);
            res.redirect('/');
        })
    } catch (e) {
        // in case their is an error in input, flash error message
        // then redirect to register page
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

// function to render login form
module.exports.renderLoginForm = (req,res) => {
    res.render('users/login.ejs');
}

// function to log user in
module.exports.loginUser = (req,res) => {
    const { username, password } = req.body;
    req.flash('success', `Welcome back, ${username}!`);
    // ***
    const redirectUrl = res.locals.returnTo || '/';
    delete res.locals.returnTo;
    // ***
    res.redirect(redirectUrl); // redirect after logging in successfully
}

// function to log user out
module.exports.logoutUser = (req,res,next) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You are logged out!');
        res.redirect('/'); // redirect to homepage
    });  // method in passport for logging out
}