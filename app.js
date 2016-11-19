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
        
        host: 'localhost',
        user: 'root',
        password : '1234',
        port : 3306, 
        database:'jump'

    },'pool')

);



app.get('/', routes.index);
//Ventas
app.get('/venta', visita.add);
// Jumpers
app.get('/jumper/save', jumper.save);
// Pre Jumpers

app.get('/registro_jumper', prejump.list);
app.post('/pjump/save', prejump.save);
app.get('/pjump', prejump.add);
app.post('/pjump/register', prejump.transfer);
//Users
app.get('/user', admin.list);
app.get('/user/add', admin.add);
app.post('/user/add', admin.save);
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