const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
//const keys = require('./keys');
const db = require('./db');

passport.serializeUser((user,done)=>{
  done(null,user.user_id);
});

passport.deserializeUser((id,done)=>{
  let sql = `SELECT * from users WHERE user_id = ${id}`;
  db.query(sql,(err,result)=>{
    if(err) throw err;
    let User = JSON.parse(JSON.stringify(result[0]));
    //console.log(User);
    done(null, User);
  });
});

var clientID = process.env.CLIENT_ID || keys.google.clientID;
var clientSecret = process.env.CLIENT_SECRET || keys.google.clientSecret;

passport.use(
  new GoogleStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: '/auth/google/redirect',
    //passReqToCallback:true
  },(accessToken, refreshToken, profile, done)=>{
      // console.log(accessToken);
      // console.log(refreshToken);
      let user = { google_id:profile.id, name:profile.displayName , email:profile.emails[0].value , tumbnail: profile._json.picture};
      //console.log(user);
      let sql1 = `SELECT * from users WHERE google_id = ${user.google_id}`;
      db.query(sql1, user, (err,results)=>{
        if (err){
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
                  done(null, newUser);
                });
            });
        } else {
            let currentUser = JSON.parse(JSON.stringify(results[0]));
            //console.log(currentUser);
            done(null, currentUser);
        }
      });
  }
));