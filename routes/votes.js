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
            db.query(`SELECT pv.post_id,p.votes FROM post_votes pv,posts p WHERE pv.post_id = p.post_id and vote_id = ${data.insertId}`,(err,data)=>{
                if(err) throw err;
                res.status(201).json(data[0]);
            });
          }
      });
      } else {
        db.query(`SELECT pv.post_id,p.votes FROM post_votes pv,posts p WHERE pv.post_id = p.post_id and pv.post_id = ${post_id}`,(err,data)=>{
          if(err) throw err;
          res.status(201).json(data[0]);
      });
      }  
  });
});

router.post('/comments',(req,res)=>{
  var user_id = parseInt(req.body.user_id);
  let com_id = parseInt(req.body.com_id);
  db.query(`SELECT * FROM comment_votes WHERE com_id = ${com_id} and user_id = ${user_id}`,(err,data)=>{
      if(err) throw err;
      else if(data.length === 0){
        db.query(`INSERT INTO comment_votes (user_id,com_id) VALUES (${user_id},${com_id});`,(err,data)=>{
          if(err){
            res.status(500).json(err);
            throw err;
          }else{
            db.query(`SELECT cv.com_id,c.votes FROM comment_votes cv,comments c WHERE cv.com_id = c.com_id and v_id = ${data.insertId}`,(err,data)=>{
                if(err) throw err;
                res.status(201).json(data[0]);
            });
          }
      });
      } else {
        db.query(`SELECT cv.com_id,c.votes FROM comment_votes cv,comments c WHERE cv.com_id = c.com_id and cv.com_id = ${com_id}`,(err,data)=>{
          if(err) throw err;
          res.status(201).json(data[0]);
      });
      }  
  });
});

module.exports = router;