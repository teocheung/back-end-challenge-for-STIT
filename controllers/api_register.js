/*
 this file is the API for register
 we assume the data received from client is:
 data: {
    email,
    password,
    name,
    birthdate,
    classificationName,
    genre
}

the data send back to client is {isSuccess: true/false},
which indicates whether the register is successful or not.
*/

const APIError = require('../rest').APIError;

const cryptoPwd = require('../salt_crypto').cryptoPwd;
const genreDictionary = require('../genreDictionary');
const mysql = require('mysql');
const config = require('../databaseConfig').config;

var connection = mysql.createPool(config);

module.exports = {
  'POST /api/register': async (ctx, next) => {

    // store request information
    var
      email = ctx.request.body.email,
      password = ctx.request.body.password,
      name = ctx.request.body.name,
      birthdate = ctx.request.body.birthdate + " 00:00:00",
      classificationName = ctx.request.body.classificationName,
      genre = ctx.request.body.genre,
      // translate genre name into genre's id
      genreId = genreDictionary[genre];

    // input check
    if(!email || !email.trim()){
      throw new APIError('Invalid email input', 'Missing email');
    }
    if(!password || !password.trim()){
      throw new APIError('Invalid password input', 'Missing password');
    }
    if(!name || !name.trim()){
      throw new APIError('Invalid name input', 'Missing name');
    }
    if(!birthdate || !birthdate.trim()){
      throw new APIError('Invalid birthdate input', 'Missing birthdate');
    }
    if(!classificationName || !classificationName.trim()){
      throw new APIError('Invalid classificationName input', 'Missing classificationName');
    }
    if(!genre || !genre.trim()){
      throw new APIError('Invalid genre input', 'Missing genre');
    }

    await new Promise(function (resolve, reject) {
      connection.getConnection(function (error, tempCont){
        if(error){
          tempCont.release();
          console.log("Error occurs in mysql connection");
          throw new APIError('Invalid database connection', 'Error occurs in mysql connection');
        } else{
          console.log("Success in connecting to database");
          // encrypt password
          password = cryptoPwd(password, 'salt');
          // insert user's information to database if query success
          var sqlQuery = `INSERT INTO user(email, password, name, birthdate, classificationName, genreId)
              VALUES ("${email}", "${password}", "${name}", "${birthdate}", "${classificationName}", "${genreId}")`;
          tempCont.query(sqlQuery, function(error, rows, fields){
            tempCont.release();
            if(error){
              console.log('Error occurs in mysql query');
              console.log(error);
              throw new APIError('invalid query', 'Error occurs in mysql query');
            } else {
              // send a flag back to client if success.
              resolve({isSuccess: true});
            }
          });
        }
      })
    }).then(function (result) {
      console.log("Success in API Register");
      ctx.rest(result);
    }).catch(function (error){
      console.log("Fail in API Register");
    });
  }
}
