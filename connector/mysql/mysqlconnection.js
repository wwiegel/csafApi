const config = require("../../config");
const client = require('./mysql_client');

/**
 * TODO Ping the CLIENT to be sure 
 * *** mySQL *** is up
 */
client.ping({
  requestTimeout: config.csafMysql.requestTimeout,
}, function (error) {
  error
    ? console.error('mySQL cluster is down!')
    : console.log('mySQL is ok');
});

function mysqlClient(sql){
  //var abc = client.query(sql);

  return new Promise((resolve, reject) => {
    client.query(sql, function (err, result) {
      if(result) {
        const successObject = {
           msg: 'Success',
           result,//...some data we got back
        }
        resolve(successObject); 
     } else {
        const errorObject = {
           msg: 'An error occured',
           err, //...some error we got back
        }
        reject(errorObject);
     }
    });
 });
}


module.exports = {
  mysqlClient
};