const router = require('express').Router();
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
  // var user_id = req.body.user_id;
	// var title = req.body.title;
	// var overview = req.body.overview;
	// var body = req.body.body;
  //var newPost = { user_id: user_id, title:title, overview:overview, body:body };
	var newPost = req.body;
	//Create a new Post and save to DB
  let sql = "INSERT INTO posts SET ?"
  db.query(sql, newPost, (err,data)=>{
      if(err) throw err;
      console.log(data.insertId);
			db.query(`SELECT * FROM posts WHERE post_id = ${data.insertId}`,(error,post)=>{
				if(error) throw error;
				var insertedPost = JSON.parse(JSON.stringify(post));
				res.json(insertedPost);
			});
			//res.redirect('/posts');
  });
});

//NEW - show form to create new post
router.get('/new', (req, res) => {
	res.render('posts/new');
});

// SHOW - shows more info about one post
router.get('/:id', (req, res) => {
		let id = req.params.id;
		let sql = `SELECT * FROM posts WHERE post_id = ${id}`;
		db.query(sql,(err,post)=>{
				if(err) throw err;
				var data = JSON.parse(JSON.stringify(post));
				res.json(data);
		});
});

// EDIT post form
router.get('/:id/edit', (req, res) => {
		let id = req.params.id;
		let sql = `SELECT * FROM posts WHERE post_id = ${id}`;
		db.query(sql,(err,post)=>{
				if(err) throw err;
				var data = JSON.parse(JSON.stringify(post));
				res.json(data);
		});
});

// UPDATE POST ROUTE
router.put('/:id',(req, res) => {
		let id = req.params.id;
		let sql = "UPDATE posts SET ? WHERE post_id = ?";
		db.query(sql,[req.body,id], (err,data)=>{
				if(err) throw err;
				db.query(`SELECT * FROM posts WHERE post_id = ${id}`,(error,post)=>{
					if(error) throw error;
					var updatedPost = JSON.parse(JSON.stringify(post));
					res.json(updatedPost);
				});
		});
});

//DELETE a perticular post
router.delete('/:id', (req, res) => {
	let id = req.params.id;
	let sql = `DELETE FROM posts WHERE post_id = ${id}`;
	db.query(sql,(err,post)=>{
			if(err) throw err;
			console.log(post);
			res.redirect('/posts');
	});
});

module.exports = router;