var mysql      = require('mysql');
var dbConfig = require('./../dbConfig');
dbConfig.connectionLimit = 10;
var poolDb = mysql.createPool(dbConfig);

var obj = {};
var videoQueue = require('./videoList').lista;

obj.checkVips = function(callback){
    poolDb.query('SELECT * FROM vip ORDER BY date_f ASC LIMIT 1',function(err,results, fields){
        if(err){
            console.log(err);
            callback(err,{});
        } else {
            if(results.length){
                var nextVipTimeLeft = new Date(results[0].date_f).getTime() - new Date().getTime();
                if(nextVipTimeLeft > 5*60*1000){
                    callback(null,{playVideo: true, src:videoQueue[0]});
                    var queueFile = videoQueue.shift();
                    videoQueue.push(queueFile);
                } else {
                    callback(null,{playVideo: false});
                }
            } else {
                callback(null,{playVideo: true, src:videoQueue[0]});
                var queueFile = videoQueue.shift();
                videoQueue.push(queueFile);
            }
        }
    });
};

module.exports = obj;