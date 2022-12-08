const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync'); // import wrapAsync function from utils
const user = require('../controllers/users.js'); // import the user controller
const passport = require('passport');

router.route('/register')
    .get(user.renderRegisterForm)
    .post(wrapAsync(user.registerUser));

router.route('/login')
    .get(user.renderLoginForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), user.loginUser);

router.get('/logout', user.logoutUser);

module.exports = router; 