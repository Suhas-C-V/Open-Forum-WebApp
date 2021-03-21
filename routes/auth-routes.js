const router = require('express').Router();
const db = require('../config/db');
var keys;
if(process.env.NODE_ENV === 'development'){
  keys = require('../config/keys');
}

const {OAuth2Client} = require('google-auth-library');

router.post('/login',(req,res)=>{
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
    db.query(sql1, user, (err,results)=>{
      if (err){
        res.status(500).json(err);
        throw err;
      } else if(results.length === 0) {
        let sql = 'INSERT INTO users SET ?';
        db.query(sql, user, (error,result)=>{
              if (error) throw error;
              //console.log(user.google_id);
              let sql2 = `SELECT * from users WHERE google_id = ${user.google_id}`;
              db.query(sql2,(errsql2,ressql2)=>{
                if (errsql2) throw errsql2;
                var newUser = JSON.parse(JSON.stringify(ressql2[0]));
                req.session.user_id = newUser.user_id;
                req.session.save();
                res.status(200).json({user_id:newUser.user_id});
                
              });
          });
      } else {
          let currentUser = JSON.parse(JSON.stringify(results[0]));
          req.session.user_id = currentUser.user_id;
          req.session.save();
          //console.log(currentUser);
          res.status(200).json({user_id:currentUser.user_id});
          console.log(req.session);
      }
    });
    }catch(error){
          console.log(error);
          res.status(403).json({message:"Forbidden",error});
    }
    }
  
  verify().catch(console.error);
  }
});

router.get('/logout',(req,res)=>{
  req.session.destroy();
  console.log(req.session);
  res.json({message: "logged you out!!"})
});

module.exports = router;