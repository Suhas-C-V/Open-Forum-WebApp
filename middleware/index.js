
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
	if(!req.user){
    res.redirect('/auth/login');
  }else{
    next();
  }
};

module.exports = middlewareObj;