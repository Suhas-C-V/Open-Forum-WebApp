const express = require('express');
const router = express.Router();
const { json } = require('body-parser');
const db = require('../config/db');
const middleware = require('../middleware');

var keys;
if(process.env.NODE_ENV === 'development'){
  keys = require('../config/keys');
}

const mysql = require( 'mysql' );
let host = process.env.HOST || keys.db_config.host;
let user = process.env.USER || keys.db_config.user;
let password = process.env.PASSWORD || keys.db_config.password;

class Database {
	constructor( config ) {
			this.connection = mysql.createConnection( config );
	}
	query( sql, args ) {
			return new Promise( ( resolve, reject ) => {
					this.connection.query( sql, args, ( err, rows ) => {
							if ( err )
									return reject( err );
							resolve( rows );
					} );
			} );
	}
	close() {
			return new Promise( ( resolve, reject ) => {
					this.connection.end( err => {
							if ( err )
									return reject( err );
							resolve();
					} );
			} );
	}
}

var database = new Database({
	host: host,
	user: user,
	password: password,
	database:'openforum',
	port:'3306',
	timezone:"Asia/kolkata"
});

// function getColour( posts, callback)
// {	
//     db.query( `SELECT * FROM posts_votes WHERE user_id = ${posts.user_id} and post_id = ${posts.post_id}` , (err, result) =>
//     {
//         if (err) 
//             callback(err,null);
//         else
//             callback(null,result[0].hexcode);
//     });

// }

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

router.get('/log/:user_id', (req, res) => {
	// Get all posts from DB
	let user_id = req.params.user_id;
	// let sql = 'SELECT p.*,u.name FROM posts p,users u WHERE u.user_id = p.user_id ORDER BY p.votes DESC';
  // db.query(sql, (err,posts)=>{
  //     if(err){
	// 			res.status(500).json(err);
	// 			throw err;
	// 		}
  //     var data = JSON.parse(JSON.stringify(posts));
	// 		//global.votes = [];
	// 		data.forEach(element => {
	// 			db.query(`SELECT * FROM post_votes WHERE user_id = ${user_id} and post_id = ${element.post_id}`,(err,postv)=>{
	// 				console.log(postv);
	// 				if(postv.length === 0){
	// 					element.voted = 0;
	// 				}else{
	// 					element.voted = 1;
	// 				}
	// 				console.log(element);
	// 		});
	// 		});
  //     res.json(data);
  // });

	var someRows;
	var da = [];
	database.query( 'SELECT p.*,u.name FROM posts p,users u WHERE u.user_id = p.user_id ORDER BY p.votes DESC' )
    .then( rows => {
        someRows = JSON.parse(JSON.stringify(rows));
				var len = someRows.length;
				//console.log(someRows);
				someRows.forEach(element => {
								database.query(`SELECT * FROM post_votes WHERE user_id = ${user_id} and post_id = ${element.post_id}`)
								.then(row =>{
									if(row.length === 0){
											element.voted = 0;
									}else{
											element.voted = 1;
									}
									return element;
								}).then (ele=>{
									da.push(ele);
									//console.log(da);
									if( da.length === len ){
										res.json(da);
									}
								})
							});
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
router.delete('/:id',(req, res) => {
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