const router = require('express').Router();
var middleware = require('../middleware');

router.get('/',middleware.isLoggedIn,(req,res)=>{
    res.render('profile',{user: req.user});
});

module.exports = router;