const router = require('express').Router();

const isLoggedin = (req,res,next)=>{
    if(!req.user){
        res.redirect('/auth/login');
    }else{
      next();
    }
};

router.get('/',isLoggedin,(req,res)=>{
    res.render('profile',{user: req.user});
});

module.exports = router;