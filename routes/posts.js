const express = require('express');
const router = express.Router();
const { json } = require('body-parser');
const db = require('../config/db');

//INDEX - show all posts
router.get('/', (req, res) => {
	// Get all posts from DB
	let sql = 'SELECT * FROM posts';
  db.query(sql, (err,posts)=>{
      if(err) throw err;
      var data = JSON.parse(JSON.stringify(posts));
      res.json(data);
  });
});

//CREATE - add new post
router.post('/', (req, res) => {
	var newPost = req.body;
	//Create a new Post and save to DB
  let sql = "INSERT INTO posts SET ?"
  db.query(sql, newPost, (err,data)=>{
      if(err){
				res.status(500).json(err);
				throw err;
			}
			res.status(201).json({message:`Post created`})
		});	
			//res.redirect('/posts');

	// let message = '';
	// if(req.method == "POST"){
	// 	 var user_id = req.user.user_id;
	// 	 var post  = req.body;
	// 	 var title= post.title;
	// 	 var overview= post.overview;
	// 	 var body= post.body;
	// 	 var votes= post.votes;

	// 	 if (!req.files)
	// 			return res.status(400).send('No files were uploaded.');

	// 			var file = req.files.image;
	// 			var img_name=file.name;

	// 			if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){
                                 
	// 				file.mv('public/images/uploads/'+file.name, (err) => {			 
	// 					if (err) return res.status(500).send(err);
	// 					var sql = "INSERT INTO `posts`(`user_id`,`title`,`overview`,`body`, `image`,`votes`) VALUES ('" + user_id + "','" + title + "','" + overview + "','" + body + "','" + img_name + "','" + votes + "')";

	// 					db.query(sql, (error, result)=> {
	// 						if(error) throw error;
	// 						 res.redirect('/posts');
	// 					});
	// 			 });
	// 		} else {
	// 			message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
	// 			res.render('/posts/new',{message: message});
	// 		}
	// } else{
	// 	res.render('/posts/new',{message: message});
	// }
});

//NEW - show form to create new post
router.get('/new', (req, res) => {
	res.render('posts/new',{message: ''});
});

// SHOW - shows more info about one post
router.get('/:id', (req, res) => {
		let id = req.params.id;
		let result = {};
		let sql = `SELECT p.title,p.overview,p.body,p.image,p.votes,p.created,u.name FROM posts p,users u WHERE p.user_id = u.user_id and post_id = ${id}`;
		db.query(sql,(err,post)=>{
				if(err){
					res.status(500).json(err);
					throw err;
				}else if(!post.length){
					res.status(404).json({message:"Post not Found!"});
				}else{
					result.post = post[0];
					let sql = `SELECT c.title,c.body,c.votes,c.created,u.name FROM posts p,comments c,users u WHERE c.user_id = u.user_id and c.post_id = p.post_id and c.post_id = ${id}`;
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
				//res.render('posts/show',{data:data})
		});
});

// EDIT post form
router.get('/:id/edit', (req, res) => {
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
router.put('/:id',(req, res) => {
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
router.delete('/:id', (req, res) => {
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