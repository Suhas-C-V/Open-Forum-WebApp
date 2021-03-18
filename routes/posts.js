const express = require('express');
const router = express.Router();
const { json } = require('body-parser');
const db = require('../config/db');
const middleware = require('../middleware');

//INDEX - show all posts
router.get('/', (req, res) => {
	// Get all posts from DB
	let sql = 'SELECT p.*,u.name FROM posts p,users u WHERE u.user_id = p.user_id ORDER BY p.votes DESC';
  db.query(sql, (err,posts)=>{
      if(err){
				res.status(500).json(err);
				throw err;
			}
      var data = JSON.parse(JSON.stringify(posts));
      res.json(data);
  });
});

//CREATE - add new post
router.post('/', (req, res) => {
	if(req.method == "POST"){
		 //var user_id = req.user.user_id;
		 //var user_id = parseInt(req.body.user_id);
		 var user_id = parseInt(req.body.user_id);
		 console.log(req.body);
		 var title= req.body.title;
		 var overview= req.body.overview;
		 var body= req.body.body;
		 //var votes= parseInt(post.votes);
		 if(!req.files){
			var newPost = {user_id:user_id,title:title,overview:overview,body:body,votes:0};
			var sql = "INSERT INTO posts SET ?";                  
			db.query(sql, newPost, (error, result)=> {
					if(error){
						res.status(500).json(err);
						throw error;
					}
					 res.status(201).json({message:"Post Added"})
				});
		}else{
			var file = req.files.image;
			var img_name=file.name;
			
			if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" )
				{
					if(file.size < 1572864 ){
						var newPost = {user_id:user_id,title:title,overview:overview,body:body,image:img_name,votes:0};                  
						file.mv('public/images/uploads/'+file.name, (err) => {			 
							if (err) return res.status(500).json(err);
							var sql = "INSERT INTO posts SET ?";                  
						db.query(sql, newPost, (error, result)=> {
								if(error){
									res.status(500).json(err);
									throw error;
								}
								res.status(201).json({message:"Post added!"});
							});
					 });
					}else{
						res.status(400).json({err:"Bad Request!!",message:"File should be less than 1.5MB!!"});
					}
				} else {
					//res.render('/posts/new',{message: message});
					res.status(400).json({err:"Bad Request!!",message:"This format is not allowed , please upload file with '.png','.gif','.jpg"});
				}
		}
	}
});

// SHOW - shows more info about one post
router.get('/:id/:user_id', (req, res) => {
		let id = req.params.id;
		let user_id = req.params.user_id;
		let result = {};
		let sql = `SELECT p.post_id,p.title,p.overview,p.body,p.image,p.votes,p.created,u.name FROM posts p,users u WHERE p.user_id = u.user_id and post_id = ${id}`;
		db.query(sql,(err,post)=>{
				if(err){
					res.status(500).json(err);
					throw err;
				}else if(!post.length){
					res.status(404).json({message:"Post not Found!"});
				}else{
					result.post = post[0];
					if(user_id !== undefined){
					db.query(`SELECT * FROM post_votes WHERE user_id = ${user_id} and post_id=${id}`,(err,data)=>{
							if(err) throw err;
							else if(data.length === 0){
								result.post.voted = false;
							}else{
								result.post.voted = true;
							}
						});
					}
					let sql = `SELECT c.com_id,c.body,c.votes,c.created,u.name FROM posts p,comments c,users u WHERE c.user_id = u.user_id and c.post_id = p.post_id and c.post_id = ${id} ORDER BY c.votes DESC`;
					db.query(sql,(err,comments)=>{
							if(err){
								res.status(500).json(err);
								throw err;
							}
							var comments = JSON.parse(JSON.stringify(comments));
							result.comments = comments;
							res.json(result);
					});
				}
		});
});

// EDIT post form
router.get('/:id/edit', middleware.checkPostOwner ,(req, res) => {
		let id = req.params.id;
		let sql = `SELECT * FROM posts WHERE post_id = ${id}`;
		db.query(sql,(err,post)=>{
			if(err){
				res.status(500).json(err);
				throw err;
			}else if(!post.length){
				res.status(404).json({message:"Post not Found!"});
			}else{
				res.json(post);
			}
		});
});

// UPDATE POST ROUTE
router.put('/:id',middleware.checkPostOwner,(req, res) => {
		let id = req.params.id;
		let sql = `SELECT * FROM posts WHERE post_id = ${id}`;
		db.query(sql,(err,post)=>{
			if(err){
				res.status(500).json(err);
				throw err;
			}else if(!post.length){
				res.status(404).json({message:"Post not Found!"});
			}else{
				let sql = "UPDATE posts SET ? WHERE post_id = ?";
				db.query(sql,[req.body,id], (err,data)=>{
						if(err){
							res.status(500).json(err);
							throw err;
						} 
						res.status(201).json({message:"Post updated!"});
				});
			}
		});
});

//DELETE a perticular post
router.delete('/:id', middleware.checkPostOwner ,(req, res) => {
	let id = req.params.id;
	let sql = `SELECT * FROM posts WHERE post_id = ${id}`;
	db.query(sql,(err,post)=>{
		if(err){
			res.status(500).json(err);
			throw err;
		} else if(!post.length){
			res.status(404).json({message:"Post not Found!"});
		} else{
			let sql = `DELETE FROM posts WHERE post_id = ${id}`;
			db.query(sql,(err,post)=>{
				if(err){
					res.status(500).json(err);
					throw err;
				} 
				res.status(410).json({message:"Post Deleted!"});
			});
		}
	});
});

module.exports = router;