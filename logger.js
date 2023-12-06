const config = require("./config");
var fs = require('fs');

var logFiles;

class logger {
    logger(){
        //create log file, if not exist
        fs.access(config.csafServer.logFile);
        if (fs.existsSync(config.csafServer.logFile)) {
            // write
            fs.promises.writeFile(config.csafServer.logFile, "");
        }else{
            // create and write
            fs.promises.writeFile(config.csafServer.logFile, "");
        }
    }

    log(logInstance, logString){
        var todayDate = new Date().toISOString(); //.slice(0, 10);
        var newLogString = todayDate + ": " + logString + "\r\n";
        if(logInstance == "elasticsearch"){
            fs.promises.writeFile(config.csafElasticsearch.logFile, newLogString, { flag: 'a' }, function (err) {
                if (err) throw err;
                console.log("elasticsearch logged!");
            });
        }else if(logInstance == "intermediate"){
            fs.promises.writeFile(config.csafIntermediate.logFile, newLogString, { flag: 'a' }, function (err) {
                if (err) throw err;
                console.log("intermediate logged!");
            });
        }else{
            fs.writeFile(config.csafServer.logFile, newLogString, { flag: 'a' }, function (err) {
                if (err) throw err;
                console.log("logged!");
            });
        }
    
        //return true;
    }
}

function log2(logInstance, logString){
    var i = 0;
    var temp = logInstance;
    temp = logString;

    return true;
}


const myLogger = new logger();

module.exports = myLogger;