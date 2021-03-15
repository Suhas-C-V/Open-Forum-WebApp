//export NODE_ENV=development
const express = require('express');

const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

var keys;
if(process.env.NODE_ENV === 'development'){
  keys = require('./config/keys');
}
console.log(process.env.NODE_ENV);

const cors = require('cors');
const mysql = require('mysql');
var session = require('express-session')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
const app = express();

let port = process.env.PORT || 5000;
let host = process.env.HOST || keys.db_config.host;
let user = process.env.USER || keys.db_config.user;
let password = process.env.PASSWORD || keys.db_config.password;
//database connection
var connection;

//let dbconfig = process.env.DB_CONFIG || keys.db_config;

function handleDisconnect() {
  connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database:'openforum',
    port:'3306',
    timezone:"Asia/kolkata"
  }); 

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
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin 
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) === -1) {
      var message = 'The CORS policy for this origin doesn ' +
        'allow access from the particular origin.';
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');
app.set('view engine','ejs');
app.use(express.static(__dirname + '/public'));
app.use(fileUpload());

const cookieKey = process.env.SECRET || keys.session.cookieKey;

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie:{
        maxAge: 1000*60*60*24
    }
}));

//initialize passport
// app.use(passport.initialize());
// app.use(passport.session());

app.use(function(req, res, next) {
	res.locals.currentUser = req.session.user_id;
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

app.listen(port,()=>{
  console.log(`App started and listenig in port ${port}`);
});