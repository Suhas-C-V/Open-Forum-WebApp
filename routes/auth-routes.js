const router = require('express').Router();
const passport = require('passport');
//login
router.get('/login',(req,res)=>{
  res.render('login',{ page: 'login'});
});

router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success', 'Successfully Logged out!');
  res.redirect('/');
});

//auth with google
router.get('/google', passport.authenticate('google',{
  scope:['profile','email']
}));

//callback route for google to redirect to
router.get('/google/redirect',passport.authenticate('google'),(req,res)=>{
  //res.send(req.user);
  req.flash('success', 'Successfully Signed Up! Nice to meet you ' + req.user.name);
  res.redirect('/profile/')
});

module.exports = router;