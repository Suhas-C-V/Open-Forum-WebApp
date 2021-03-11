const express = require('express');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const passportSetup = require('./config/passport-setup');
const keys = require('./config/keys');
const mysql = require('mysql');
const cookieSession = require('cookie-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload')
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
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');
app.set('view engine','ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
app.use(fileUpload());

app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys: [keys.session.cookieKey]
}));

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});
//routes
app.use('/auth',authRoutes);
app.use('/profile',profileRoutes);
app.use('/posts', postRoutes);
app.use('/posts/:id/comments', commentRoutes);

//create home route
app.get('/',(req,res)=>{
  res.redirect('/posts');
});

app.listen(5000,()=>{
  console.log('App started');
});