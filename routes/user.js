const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync'); // import wrapAsync function from utils
const User = require('../models/user.js'); // require user model
const passport = require('passport');

router.get('/register', (req,res) => {
    res.render('users/register');
})

router.post('/register', wrapAsync(async (req,res,next) => {
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
}))

router.get('/login', (req,res) => {
    res.render('users/login.ejs');
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req,res) => {
    const { username, password } = req.body;
    req.flash('success', `Welcome back, ${username}!`);
    // ***
    const redirectUrl = res.locals.returnTo || '/';
    delete res.locals.returnTo;
    // ***
    res.redirect(redirectUrl); // redirect after logging in successfully
})

router.get('/logout', (req,res,next) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You are logged out!');
        res.redirect('/'); // redirect to homepage
    });  // method in passport for logging out
})

module.exports = router; 