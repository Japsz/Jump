var mysql      = require('mysql');
var poolDb = mysql.createPool({
    connectionLimit: 10,
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    port: 3306,
    database : 'jump'
});
var obj = {};

obj.checkVips = function(callback){
    poolDb.query('SELECT * FROM vip ORDER BY date_f ASC LIMIT 1',function(err,results, fields){
        if(err){
            console.log(err);
            callback(err,{});
        } else {
            if(results.length){
                var nextVipTimeLeft = new Date(results[0].date_f).getTime() - new Date().getTime();
                if(nextVipTimeLeft > 5*60*1000){
                    callback(null,{playVideo: true, src:"/video/gojump_test.mp4"});
                } else {
                    callback(null,{playVideo: false});
                }
            } else {
                callback(null,{playVideo: true, src:"/video/gojump_test.mp4"});
            }
        }
    });
};

module.exports = obj;