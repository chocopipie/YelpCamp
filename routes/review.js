const express = require('express');
const router = express.Router({mergeParams: true}); // mergeparams - let review routers get access to param "id" from campground routers

const wrapAsync = require('../utils/wrapAsync'); // import wrapAsync function from utils
const review = require('../controllers/reviews.js'); // import the review controller
const { isLoggedIn } = require('../utils/isLoggedIn'); // import function to check if user is logged in or not (library: passport)
const { validateReview } = require('../utils/validateModel.js'); // import middleware to check information input (for create and update)
const { isReviewAuthor } = require('../utils/isAuthor.js'); // import middleware to check if current user is the author 

// create and save a new review to db
router.post('/', isLoggedIn, validateReview, wrapAsync(review.createReview));

// delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(review.deleteReview));

module.exports = router;