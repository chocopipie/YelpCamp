const express = require('express');
const router = express.Router(); // create router obj
const wrapAsync = require('../utils/wrapAsync'); // import wrapAsync function from utils
const campground = require('../controllers/campgrounds.js'); // import the campground controller
const { isLoggedIn } = require('../utils/isLoggedIn'); // import middleware to check if user is logged in or not (library: passport)
const { isCampgroundAuthor } = require('../utils/isAuthor.js'); // import middleware to check if current user is the author 
const { validateCampground } = require('../utils/validateModel.js'); // import middleware to check information input (for create and update)
const multer  = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage })

router.route('/')
    .get(wrapAsync(campground.index)) // display all campgrounds
    .post(isLoggedIn, upload.array('image'), validateCampground, wrapAsync(campground.createCampground)); // create and save campground to db, upload img to Cloudinary by multer
// goto form to add new campground
router.get('/new', isLoggedIn, campground.renderNewForm);

router.route('/:id')
    .get(wrapAsync(campground.showCampground)) // display single campground
    .put(isLoggedIn, isCampgroundAuthor, upload.array('image'), validateCampground, wrapAsync(campground.updateCampground)) // make change and save to the db
    .delete(isLoggedIn, isCampgroundAuthor, wrapAsync(campground.deleteCampground)); // delete 1 item by id

// goto form to edit campground
router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, wrapAsync(campground.renderEditForm));




// export router
module.exports = router;