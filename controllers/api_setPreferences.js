/*
 this file is the API for setPreferences
 we assume the data received from client is:
 data: {
    uid,
    classificationName,
    genre
}

the data send back to client is {isSuccess: true/false},
which indicates whether the register is successful or not
*/

const APIError = require('../rest').APIError;

const genreDictionary = require('../genreDictionary');
const mysql = require('mysql');
const config = require('../databaseConfig').config;

var connection = mysql.createPool(config);

module.exports = {
  'POST /api/setPreferences': async (ctx, next) => {
    var
      uid = ctx.request.body.uid,
      classificationName = ctx.request.body.classificationName,
      genre = ctx.request.body.genre,
      genreId = genreDictionary[genre];

    await new Promise(function (resolve, reject) {
      connection.getConnection(function (error, tempCont){
        if(error){
          tempCont.release();
          console.log("Error occurs in mysql connection");
          throw new APIError('Invalid database connection', 'Error occurs in mysql connection');
        } else{
          var sqlQuery = `UPDATE user SET classificationName = "${classificationName}", genreId = "${genreId}"
                          WHERE uid = ${uid};`;
          tempCont.query(sqlQuery, function(error, rows, fields){
            tempCont.release();
            if(error){
              console.log('Error occurs in mysql query');
              console.log(error);
              throw new APIError('Invalid query', 'Error occurs in mysql query');
            } else {
              resolve({isSuccess: true});
            }
          });
        }
      })
    }).then(function (result) {
      console.log("Success in API setPreferences");
      ctx.rest(result);
    }).catch(function (error){
      console.log("Fail in API setPreferences");
    });
  }
}
