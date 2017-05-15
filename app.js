var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var jumper = require('./routes/jumper');
var users = require('./routes/users');
var admin = require('./routes/admin');
var prod = require('./routes/prod');
var visita = require('./routes/visita');
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
app.use(express.cookieSession());

app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use(
    
    connection(mysql,{
        
        host: '127.0.0.1',
        user: 'root',
        password : '1355gojump',
        port : 3306,
        database:'jump'

    },'pool')

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
app.post('/table_stream', prod.tables);
app.get('/vip/save', prod.save);
app.post('/vip/check', prod.check);
app.get('/vip/end/:id', prod.time_end);
app.get('/uv_stream', prod.uv_stream);
app.get('/sudo_del/:id',prod.sudo_del);
app.post('/extend', prod.extend);
app.get('/vip/near/:id', prod.time_near);

//Visitas
app.get('/venta', visita.add);
app.get('/venta/sessionpop/:id', visita.d_from_session);
app.post('/visit/save', visita.save);
app.get('/precods', visita.precods);
app.get('/getcod/:cod', visita.cods);
app.get('/venta_fin', visita.end);

// Jumpers
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
app.get('/delete/:id',prejump.remove);
app.get('/registro_jumper', prejump.list);
app.post('/pjump/save', prejump.save);
app.get('/pjump/:id', prejump.add);
app.post('/pjump/register', prejump.transfer);
app.post('/m_pjump',prejump.edit);
//Users
app.get('/user', admin.list);
app.get('/user/add', admin.add);
app.get('/csv', admin.stats);
app.post('/user/add', admin.save);
app.post('/g_csv', admin.g_csv);
app.get('/g_csv_j',admin.g_csv_j);
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

http.createServer(app).listen(app.get('port'), function(){
  console.log('The game starts on port ' + app.get('port'));
});