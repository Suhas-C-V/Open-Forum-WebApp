const express = require('express');
const router = express.Router();
var middleware = require('../middleware');
const db = require('../config/db');

router.get('/',middleware.isLoggedIn,(req,res)=>{
    console.log(req.user);
    res.render('profile',{user: req.session.user_id});
});

router.get('/lead',(req,res)=>{
    let sql = 'SELECT u.name,u.email,us.total_posts,us.total_comments FROM users u,user_scores us WHERE u.user_id = us.user_id';
    db.query(sql,(err,data)=>{
        if(err){
            res.status(500).json(err);
            throw err;
        }else{
            let lead = JSON.parse(JSON.stringify(data));
            for(var i = 0;i<lead.length;i++){
                lead[i]['Points'] = (lead[i].total_comments)*3 + (lead[i].total_posts)*5;
            }
            function compare(a, b) {
                // Use toUpperCase() to ignore character casing
                const A = a.Points;
                const B = b.Points;
              
                let comparison = 0;
                if ( A < B ) {
                  comparison = 1;
                } else if (A > B) {
                  comparison = -1;
                }
                return comparison;
              }
            lead.sort(compare);
            res.json(lead);
        }
    });
});

module.exports = router;