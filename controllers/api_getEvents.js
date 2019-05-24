/*
 this file is the API for getEvents
 we assume the data received from client is:
 data: {
    uid
}

the data send back to client is an object including information for events
*/

const APIError = require('../rest').APIError;

const genreDictionary = require('../genreDictionary');
const axios = require('axios');
const mysql = require('mysql');
const config = require('../databaseConfig').config;

var connection = mysql.createPool(config);


module.exports = {
  'POST /api/getEvents': async (ctx, next) => {
    var uid = ctx.request.body.uid;

    // get user's classificationName and preferences according to uid
    await new Promise(function (resolve, reject) {
      connection.getConnection(function (error, tempCont){
        if(error){
          tempCont.release();
          console.log("Error occurs in mysql connection");
          throw new APIError('Invalid database connection', 'Error occurs in mysql connection');
        } else{
          var sqlQuery = `SELECT classificationName, genreId FROM user
                          WHERE uid = ${uid};`;
          tempCont.query(sqlQuery, function(error, rows, fields){
            tempCont.release();
            if(error){
              console.log('Error occurs in mysql query');
              console.log(error);
              throw new APIError('Invalid query', 'Error occurs in mysql query');
            } else {
              resolve({classificationName: rows[0].classificationName,
                       genreId: rows[0].genreId});
            }
          });
        }
      })
    }).then(function (result) {
      return new Promise(function (resolve, reject){
        var classificationName = result.classificationName;
        var genreId = result.genreId;
        // send a request to get event information from the url provided in the instruction.
        axios({
          url: `https://yv1x0ke9cl.execute-api.us-east-1.amazonaws.com/prod/events?classificationName=${classificationName}&genreId=${genreId}`,
          method: 'get',
          auth: {
            username: 'stitapplicant',
            password: 'zvaaDsZHLNLFdUVZ_3cQKns'
          }
        }).then(function (response){
          result.events = response.data;
          resolve(result);
        });
      });
    }).then(function (result){
      console.log("Success in API getEvents");
      ctx.rest(result.events);
    }).catch(function (error){
      console.log("Fail in API getEvents");
    });
  }
}
