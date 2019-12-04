var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var jumper = require('./routes/jumper');
var convenio = require('./routes/convenio');
var users = require('./routes/users');
var admin = require('./routes/admin');
var prod = require('./routes/prod');
var visita = require('./routes/visita');
var evento = require('./routes/evento');
var prejump = require('./routes/prejump');
var app = express();
var flash = require('connect-flash');


var connection  = require('express-myconnection');
var mysql = require('mysql');

// all environments
app.set('port', process.env.PORT || 4300);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.methodOverride());
app.use(flash());
app.use(express.cookieParser('isLogged'));
app.use(express.cookieSession({
    name: 'session',
    keys: ['isLoggd', 'extent']
}));

app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
const dbConfigs = require('./dbConfig');

app.use(

    connection(mysql,dbConfigs,'pool')

);



app.get('/', routes.index);
app.get('/update_db', visita.update);
app.get('/getreg', prejump.getreg);
app.post('/getbsq_back', jumper.getbsq_b);
app.get('/getbusq', prejump.getbusq);
app.get('/cont', prejump.getcont);
app.get('/gethom', prejump.gethom);

// Visitas en progreso
app.get('/vip_list', prod.list);
app.get('/table_stream', prod.tables);
app.get('/vip/save', prod.save);
app.post('/vip/check', prod.check);
app.get('/vip/end/:id', prod.time_end);
app.get('/uv_stream', prod.uv_stream);
app.get('/sudo_del/:id',prod.sudo_del);
app.post('/extend', prod.extend);
app.get('/vip/near/:id', prod.time_near);

//Visitas
app.get('/venta', visita.add);
// app.get('/getbackup', require('./routes/database').backup);
app.get('/venta/sessionpop/:id', visita.d_from_session);
app.post('/visit/save', visita.save);
app.get('/precods', visita.precods);
app.get('/getcod/:cod', visita.cods);
app.post('/venta_fin', visita.end);

//Eventos
app.get('/evnt_list/:type',evento.list);
app.post('/setended',evento.setended);
app.get('/evnt_delete/:id',evento.delete);
app.post('/evnt_save',evento.save);
app.post('/obs_add',evento.obs_add);
app.post('/evnt_upd',evento.upd_evnt);
app.get('/evnt_start/:id',evento.start);

// Convenios
app.get('/convs', convenio.convs);
app.get('/conv_rm/:id', convenio.rm_conv);
app.post('/conv/add', convenio.save_conv);
app.post('/convinfo/add', convenio.save_convinfo);

// Jumpers
app.post('/jumper_red/save/:verif', jumper.save_red);
app.get('/jumper/save/:verif', jumper.save);
app.get('/begin_list', jumper.prelist);
app.post('/jump_stream', jumper.list);
app.post('/jumper/add2session', jumper.add2session);
app.get('/get_ids', jumper.get_ids);
app.post('/m_jump',jumper.edit);
app.post('/delete_jump',jumper.delete_customer);

// Pre Jumpers
app.post('/psave',prejump.save2);
app.post('/sudo_pj',prejump.sudo_pj);
app.post('/delete_pj',prejump.remove);
app.get('/registro_jumper', prejump.list);
app.get('/registro_jumper_red', prejump.list_red);
app.post('/pjump/save', prejump.save);
app.get('/pjump/:id', prejump.add);
app.post('/pjump/register', prejump.transfer);
app.post('/m_pjump',prejump.edit);

//Admin
app.get('/user', admin.list);
app.get('/user/add', admin.add);
app.get('/csv', admin.stats);
app.post('/user/add', admin.save);
app.post('/csv_visitas', admin.g_csv);
app.post('/evnt_csv', admin.evnt_csv);
app.post('/csv_jumpers',admin.g_csv_j);
app.get('/user/delete/:username', admin.delete_user);
app.get('/user/edit/:username', admin.edit);
app.post('/user/edit/:username',admin.save_edit);
app.get('/user_logout', users.user_logout);
app.get('/admin_logout', users.admin_logout);
app.get('/user_login', users.user_login);
app.get('/admin_login', users.admin_login);
app.get('/bad_login', users.bad_login);
app.post('/admin_login_handler', users.admin_login_handler);
app.post('/user_login_handler', users.user_login_handler);


app.use(app.router);


//const mysqldump = require('mysqldump');
var node_ssh, ssh;
node_ssh = require('node-ssh');
ssh = new node_ssh();

var configs = require('./backupConfig');

const password = configs.ssh.password;
const filename = 'dump-' + configs.mysqlHost.database + '-' + new Date().toLocaleDateString() + '--'+ new Date().toLocaleTimeString().replace(/:/g,'') + '.sql';
const startDump = './dumps/' + filename;
var server = http.createServer(app);
server.listen(app.get('port'), function(){
    console.log('The game starts on port ' + app.get('port'));

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
    }).then(function(conn){
            mysqldump({
                connection: dbConfigs,
                dump:{
                    schema:{
                        table:{
                            dropIfExist:true,
                        },
                    },
                },
                dumpToFile: startDump,
            }).then(function(e){
                ssh.putFile(startDump, '/home/nodequantum/GJ-Admin/backups/' + filename).then(function() {
                    console.log("The File uploaded successfully");
                    ssh.execCommand('mysql -u ' + configs.mysqlHost.user + ' --password=' + configs.mysqlHost.password +' "' + configs.mysqlHost.database +'" < ' + filename, { cwd:'/home/nodequantum/GJ-Admin/backups/' }).then(function(result) {
                        console.log('STDOUT: ' + result.stdout);
                        console.log('STDERR: ' + result.stderr);
                    });
                }, function(error) {
                    console.log("Something's wrong");
                    console.log(error);
                    throw error;
                });
            });
    });
    
});
var videoUtils = require('./modelo/socketUtils');
const io = require('socket.io')(server);
io.on('connection', function(socket){
    console.log("conexion");
    socket.on('actualizar',function(){
        console.log("jajA");
    });
    socket.on('isVideoPosible',function(callback){
        videoUtils.checkVips(function(err,obj){
            if(err){
                callback(err,obj);
            } else {
                callback(null,obj);
            }
        });
    });
});
app.locals.io = io;