const express = require('express');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const passportSetup = require('./config/passport-setup');
const keys = require('./config/keys');
const mysql = require('mysql');
const cookieSession = require('cookie-session');
const passport = require('passport');
const app = express();

//database connection
var connection;

function handleDisconnect() {
  connection = mysql.createConnection(keys.db_config); 

  connection.connect(function(err) {              
    if(err) {                                     
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    }     
  });                     
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      handleDisconnect();    
    } else {         
      throw err;                      
    }
  });
}

handleDisconnect();


//set up view engine
app.set('view engine','ejs');

app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys: [keys.session.cookieKey]
}));

//initialize passport
app.use(passport.initialize());
app.use(passport.session());
//routes
app.use('/auth',authRoutes);
app.use('/profile',profileRoutes);

//create home route
app.get('/',(req,res)=>{
  res.render('home',{user:req.user});
});

app.listen(5000,()=>{
  console.log('App started');
});