const config = require("../../config");
const mysql = require('mysql'); 

var conf = {
    host: config.csafMysql.host,
    port: config.csafMysql.port,
    user: config.csafMysql.user,
    password: config.csafMysql.password,
    database: config.csafMysql.database,
    insecureAuth : config.csafMysql.insecureAuth
};

const client = new mysql.createConnection(conf);

module.exports = client;