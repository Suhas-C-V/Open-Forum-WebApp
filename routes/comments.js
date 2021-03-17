const express = require('express');
const router = express.Router({ mergeParams: true });
const { json } = require('body-parser');
const db = require('../config/db');
const middleware = require('../middleware');

//new comment page form
router.get('/new',(req,res)=>{
    let id = req.params.id;
    let sql = `SELECT * FROM posts WHERE post_id = ${id}`;
    db.query(sql,(err,data)=>{
      if(err){
      res.status(500).json(err);
      throw err;
      }
      //let post = JSON.parse(JSON.stringify(data));
      res.json(post);
    });
});

//POST - add comment
router.post('/', (req,res)=>{
    let post_id = parseInt(req.params.id);
    db.query(`SELECT * FROM posts WHERE post_id=${post_id}`,(err,data)=>{
        let post = JSON.parse(JSON.stringify(data));
        if(err){
          res.status(500).send(err);
          throw err;
        }else if(post.length === 0 ){
          res.status(404).send({"message":"Post Not Found!!"});
        }else{
          let user_id = parseInt(req.body.user_id);
          let title = req.body.title;
          let body = req.body.body;
          let votes = req.body.votes;
          var newComment = {post_id:post_id, user_id:user_id, title:title, body:body, votes:votes};
          let sql = "INSERT INTO comments SET ?";
          db.query(sql,newComment,(err,data)=>{
              if(err){
                res.status(500).send(err);
                throw err;
              }
              res.status(201);
              res.json({"message": "Comment added"});
          });
        }
    });  
});

//EDIT comment form
router.get('/:comment_id/edit',middleware.checkCommentOwner,(req,res)=>{
  let post_id = parseInt(req.params.id);
  db.query(`SELECT * FROM posts WHERE post_id=${post_id}`,(err,data)=>{
      let post = JSON.parse(JSON.stringify(data));
      if(err){
        res.status(500).send(err);
        throw err;
      }else if(post.length ===0 ){
        res.status(404).send({"message":"Post Not Found!!"})
      }else{
        let comment_id = parseInt(req.params.comment_id);
        db.query(`SELECT * FROM comments WHERE com_id=${comment_id}`,(err,data)=>{
          let comment = JSON.parse(JSON.stringify(data));
          if(err){
            res.status(500).send(err);
            throw err;
          }else if(post.length ===0 ){
            res.status(404).send({"message":"Comment Not Found!!"})
          }else{
            res.status(200).json(comment);
          }
        });
      }
    });
});

//PUT - UPDATE comment
router.put('/:comment_id',middleware.checkCommentOwner,(req,res)=>{
    let comment = req.body;
    let id = req.params.comment_id;
    console.log(comment);
    console.log(id);
    let sql = "UPDATE comments SET ? WHERE com_id = ?";
    db.query(sql,[comment,id], (err,data)=>{
      if(err){
        res.status(500).json(err);
        throw err;
      }else{
        res.status(201).json({"message":"Comment Updated!"});
      }
  });
});

//DELETE - delete comment
router.delete('/:comment_id',middleware.checkCommentOwner,(req,res)=>{
    let id = req.params.comment_id;
    let sql = `SELECT * FROM comments WHERE com_id=${id}`;
    db.query(sql,(err,data)=>{
      let comment = JSON.parse(JSON.stringify(data));
      if(err){
        res.status(500).send(err);
        throw err;
      }else if(comment.length ===0 ){
        res.status(404).send({"message":"Comment Not Found!!"})
      }else{
        db.query(`DELETE FROM comments WHERE com_id=${id}`,(err,data)=>{
          if(err){
            res.status(500).send(err);
            throw err;
          }else{
            res.status(410);
            res.json({"message": "Comment Deleted"});
          }
      });
      }
    });
});

module.exports = router;