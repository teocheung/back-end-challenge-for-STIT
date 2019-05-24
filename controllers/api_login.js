/*
 this file is the API for login
 we assume the data received from client is:
 data: {
    email,
    password
}

the data send back to client is {isSuccess: true/false
                                 uid},
which indicates whether the register is successful or not, and
the uid of current user. The uid can be used in API getEvents and API setPreferences
*/

const APIError = require('../rest').APIError;

const cryptoPwd = require('../salt_crypto').cryptoPwd;
const mysql = require('mysql');
const config = require('../databaseConfig').config;

var connection = mysql.createPool(config);

module.exports = {
  'POST /api/login': async (ctx, next) => {
    var
      email = ctx.request.body.email,
      password = ctx.request.body.password;

    // input check
    if(!email || !email.trim()){
      throw new APIError('Invalid email input', 'Missing email');
    }
    if(!password || !password.trim()){
      throw new APIError('Invalid password input', 'Missing password');
    }

    await new Promise(function (resolve, reject) {
      connection.getConnection(function (error, tempCont){
        if(error){
          tempCont.release();
          console.log("Error occurs in mysql connection");
          throw new APIError('Invalid database connection', 'Error occurs in mysql connection');
        } else{
          console.log("Success in connecting to database");
          // convert password input to salted md5 style.
          password = cryptoPwd(password, 'salt');
          // use mysql.escape to prevent database injection.
          var sqlQuery = `SELECT uid FROM user
                          WHERE email = ${mysql.escape(email)} AND password = "${password}"`;
          tempCont.query(sqlQuery, function(error, rows, fields){
            tempCont.release();
            if(error){
              console.log('Error occurs in mysql query');
              console.log(error);
              throw new APIError('Invalid query', 'Error occurs in mysql query');
            } else {
              // check the result. If succeed, send the uid back to client.
              if(rows.length === 1){
                  resolve({uid: rows[0].uid});
              } else{
                throw new APIError('Invalid login information', 'Error occurs in login information');
              }
            }
          });
        }
      })
    }).then(function (result) {
      console.log("Success in API login");
      result.isSuccess = true;
      ctx.rest(result);
    }).catch(function (error){
      console.log("Fail in API login");
    });
  }
}
