module.exports.isLoggedIn = (req,res,next) => {
    // user needs to signin to view this page
    // method checks if signin or not
    if (!req.isAuthenticated()) {
        // ***
        req.session.returnTo = req.originalUrl; // save the url before redirecting to session variable "returnTo"
                                                // after logging in, we will redirect back to this originalUrl
        // ***
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}