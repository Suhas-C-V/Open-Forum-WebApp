const mysql = require('mysql');
var keys;
if(process.env.NODE_ENV === 'development'){
  keys = require('./keys');
}
let host = process.env.HOST || keys.db_config.host;
let user = process.env.USER || keys.db_config.user;
let password = process.env.PASSWORD || keys.db_config.password;

var connection;

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

module.exports = connection;