const db = require('../config/db');

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
  console.log(req.session);
	if(!req.session.user_id){
    res.status(401).json({"message":"Logg in First!"});
  }else{
    next();
  }
};

middlewareObj.checkPostOwner = function(req,res,next){
  console.log(req.session.user_id);
  if(req.body.user_id !== undefined){
    let id = req.params.id;
    let sql = `SELECT * FROM posts WHERE post_id=${id}`;
    db.query(sql,(err,data)=>{
      let post = JSON.parse(JSON.stringify(data));
        if(err){
          res.status(500).json(err);
          throw err;
        }else if(post.length === 0){
          res.status(404).send({"message":"Post Not Found!!"});
        } else {
            if(post[0].user_id === req.body.user_id){
                next();
            }else{
               res.status(403).json({"err":"Forbidden","message":"User does not have access rights to the content"})
            }
        }
    });
  } else{
    res.status(401).json({"message":"Logg in First!"});
  }
};

middlewareObj.checkCommentOwner = function(req,res,next){
  console.log(req.session);
  if(req.session.user_id !== undefined){
    let id = req.params.comment_id;
    let sql = `SELECT * FROM comments WHERE com_id=${id}`;
    db.query(sql,(err,data)=>{
      let comment = JSON.parse(JSON.stringify(data));
        if(err){
          res.status(500).json(err);
          throw err;
        }else if(comment.length === 0){
          res.status(404).send({"message":"Comment Not Found!!"});
        } else {
            if(comment[0].user_id === req.session.user_id){
                next();
            }else{
               res.status(403).json({"err":"Forbidden","message":"User does not have access rights to the content"})
            }
        }
    });
  } else{
    res.status(401).json({"message":"Logg in First!"});
  }
};

module.exports = middlewareObj;