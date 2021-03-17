const express = require('express');
const router = express.Router();
const { json } = require('body-parser');
const db = require('../config/db');
const middleware = require('../middleware');

router.post('/posts',(req,res)=>{
    var user_id = parseInt(req.body.user_id);
    let post_id = parseInt(req.body.post_id);
    db.query(`INSERT INTO post_votes (user_id,post_id) VALUES (${user_id},${post_id});`,(err,data)=>{
        if(err){
          res.status(500).json(err);
          throw err;
        }else{
          res.status(201).json({message:"vote added!!"});
        }
    });
});


module.exports = router;