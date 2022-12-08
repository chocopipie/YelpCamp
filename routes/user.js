const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync'); // import wrapAsync function from utils
const user = require('../controllers/users.js'); // import the user controller
const passport = require('passport');

router.get('/register', user.renderRegisterForm);

router.post('/register', wrapAsync(user.registerUser));

router.get('/login', user.renderLoginForm);

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), user.loginUser);

router.get('/logout', user.logoutUser);

module.exports = router; 