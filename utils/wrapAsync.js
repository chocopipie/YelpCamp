// this file contains the wrap Async functions in try-catch block
// this function take fn as parameter and return a function that call fn with catching error
// export this function
module.exports = fn => {
    return function(req,res,next) {
        fn(req,res,next).catch(e => next(e));
    }
}
