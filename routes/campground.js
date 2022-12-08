const express = require('express');
const router = express.Router(); // create router obj
const wrapAsync = require('../utils/wrapAsync'); // import wrapAsync function from utils
const campground = require('../controllers/campgrounds.js'); // import the campground controller
const { isLoggedIn } = require('../utils/isLoggedIn'); // import middleware to check if user is logged in or not (library: passport)
const { isCampgroundAuthor } = require('../utils/isAuthor.js'); // import middleware to check if current user is the author 
const { validateCampground } = require('../utils/validateModel.js'); // import middleware to check information input (for create and update)

// display all campgrounds
router.get('/', wrapAsync(campground.index))

// goto form to add new campground
router.get('/new', isLoggedIn, campground.renderNewForm);

// create and save campground to db
router.post('/', isLoggedIn, validateCampground, wrapAsync(campground.createCampground))

// display single campground
router.get('/:id', wrapAsync(campground.showCampground));

// goto form to edit campground
router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, wrapAsync(campground.renderEditForm));

// make change and save to the db
router.put('/:id', isLoggedIn, isCampgroundAuthor, validateCampground, wrapAsync(campground.updateCampground));

// delete 1 item by id
router.delete('/:id', isLoggedIn, isCampgroundAuthor, wrapAsync(campground.deleteCampground));

// export router
module.exports = router;