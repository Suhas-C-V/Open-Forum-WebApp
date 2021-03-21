const db = require('../config/db');

var middlewareObj = {};

var keys;
if(process.env.NODE_ENV === 'development'){
  keys = require('../config/keys');
}

const {OAuth2Client} = require('google-auth-library');

middlewareObj.verifyUser = function(req,res,next){

  var CLIENT_ID_1 = process.env.CLIENT_ID_1 || keys.google.CLIENT_ID_1;
  var CLIENT_ID_2 = process.env.CLIENT_ID_2 || keys.google.CLIENT_ID_2;
  var CLIENT_ID = process.env.CLIENT_ID || keys.google.CLIENT_ID;
  const client = new OAuth2Client(CLIENT_ID);
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader === 'undefined'){
    res.status(403).json({message:"Forbidden"});
  }else{
      const bearer = bearerHeader.split(' ');
      const idtoken = bearer[1];
      console.log(idtoken);
      async function verify() {
        try{
          const ticket = await client.verifyIdToken({
            idToken: idtoken,
            audience: [CLIENT_ID_1, CLIENT_ID_2],  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        console.log(payload);
        let user = { google_id: userid , name:name , email:email};
        //console.log(user);
        let sql1 = `SELECT * from users WHERE google_id = ${user.google_id}`;
        db.query(sql1,user,(err,data)=>{
          if (err){
              res.status(500).json(err);
              throw err;
            } else if(data.length === 0){
                res.status(403).json({message:"Forbidden"});
            }else{
                next();
            }
        });
        }catch(error){
          console.log(error);
          res.status(403).json({message:"Forbidden",error});
          //console.log(error);
          //res.status(403);
          //next();
          
        }
    }
  verify();
  }
  
};

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
            if(post[0].user_id === parseInt(req.body.user_id)){
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