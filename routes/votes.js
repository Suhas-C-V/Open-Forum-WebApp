const express = require('express');
const router = express.Router();
const { json } = require('body-parser');
const db = require('../config/db');
const middleware = require('../middleware');

router.post('/posts',(req,res)=>{
  var user_id = parseInt(req.body.user_id);
  let post_id = parseInt(req.body.post_id);
  db.query(`SELECT * FROM post_votes WHERE post_id = ${post_id} and user_id = ${user_id}`,(err,data)=>{
      if(err) throw err;
      else if(data.length === 0){
        db.query(`INSERT INTO post_votes (user_id,post_id) VALUES (${user_id},${post_id});`,(err,data)=>{
          if(err){
            res.status(500).json(err);
            throw err;
          }else{
            db.query(`SELECT * FROM post_votes WHERE vote_id = ${data.insertId}`,(err,data)=>{
                if(err) throw err;
                res.status(201).json(data[0]);
            });
          }
      });
      } else {
        res.json(data[0]);
        //res.redirect('/posts/show/'+post_id);
      }  
  });
});


module.exports = router;