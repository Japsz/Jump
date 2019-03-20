const mysqldump = require('mysqldump');
var path, node_ssh, ssh, fs;
fs = require('fs');
path = require('path');
node_ssh = require('node-ssh');
ssh = new node_ssh()

const configs = require('../backupConfig');
const dbconfigs = require('../dbConfig');

const password = configs.ssh.password;
const filename = 'dump-' + configs.mysqlHost.database + '-' + new Date().toLocaleDateString() + '--'+ new Date().toLocaleTimeString().replace(/:/g,'') + '.sql';
const startDump = './dumps/' + filename;
ssh.connect({
    host: configs.ssh.host,
    username: configs.ssh.username,
    password,
    tryKeyboard: true,
    onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
        if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')){
            finish([password])
        }
    },
});

var data = {};
data.backup = function(req,res){
    mysqldump({
        connection: dbconfigs,
        dump:{
            schema:{
                table:{
                    dropIfExist:true,
                },
            },
        },
        dumpToFile: startDump,
    }).then(function(e){
        console.log("Dump realizado?");
        ssh.putFile(startDump, '/home/nodequantum/GJ-Admin/backups/' + filename).then(function() {
            console.log("The File uploaded successfully");
            ssh.execCommand('mysql -u ' + configs.mysqlHost.user + ' --password=' + configs.mysqlHost.password +' "' + configs.mysqlHost.database +'" < ' + filename, { cwd:'/home/nodequantum/GJ-Admin/backups/' }).then(function(result) {
                console.log('STDOUT: ' + result.stdout);
                console.log('STDERR: ' + result.stderr);
                res.send({err:false});
            });
        }, function(error) {
            console.log("Something's wrong");
            console.log(error);
            res.send({err:error});
        });
    });
};

module.exports = data;
