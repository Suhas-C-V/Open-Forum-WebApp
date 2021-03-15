const router = require('express').Router();
const db = require('../config/db');
//login
router.get('/login/show',(req,res)=>{
  res.render('login',{ page: 'login'});
});

router.post('/login',(req,res)=>{
  let user = { google_id: req.body.google_id , name: req.body.name , email:req.body.email, tumbnail: req.body.tumbnail };
  //let user = { google_id:profile.id, name:profile.displayName , email:profile.emails[0].value , tumbnail: profile._json.picture};
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
              res.status(200).json(newUser);
              
            });
        });
    } else {
        let currentUser = JSON.parse(JSON.stringify(results[0]));
        req.session.user_id = currentUser.user_id;
        req.session.save();
        //console.log(currentUser);
        res.status(200).json(currentUser);
        console.log(req.session);
    }
  });
});

router.get('/logout',(req,res)=>{
  req.session.destroy();
  console.log(req.session);
  res.json({message: "logged you out!!"})
});

module.exports = router;