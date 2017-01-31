//Vista lista de usuarios.
exports.list = function(req, res){
	if(req.session.isAdminLogged){
		req.getConnection(function(err,connection){
					 
						var query = connection.query('SELECT * FROM user',function(err,rows)
						{
								
								if(err)
										console.log("Error Selecting : %s ",err );
				 
								res.render('user',{page_title:"Stats",data:rows});
										
						 });
						 //console.log(query.sql);
				});
		}
		else res.redirect('/bad_login');  
};

//Vista agregar usuario.
exports.add = function(req, res){
	if(req.session.isAdminLogged){
		res.render('add_user',{page_title:"Agregar usuario"});
		}
		else res.redirect('/bad_login');
};
//Vista generar csv.
exports.stats = function(req, res){
	if(req.session.isAdminLogged){
		res.render('csv',{page_title:"Generar csv"});
		} else res.redirect('/bad_login');
};

// Logica agregar producto.
exports.save = function(req,res){
	if(req.session.isAdminLogged){
		var input = JSON.parse(JSON.stringify(req.body));
		
		req.getConnection(function (err, connection) {
				
				var data = {

						username   : input.username,
						password   : input.password 
				
				};
				
				var query = connection.query("INSERT INTO user SET ? ",data, function(err, rows)
				{
	
					if (err)
							console.log("Error inserting : %s ",err );
				 
					res.redirect('/user');
					
				});
				
			 // console.log(query.sql); get raw query
		
		});
		}
		else res.redirect('/bad_login');
};
// Logica agregar producto.
exports.g_csv = function(req,res){
	if(req.session.isAdminLogged){
		var input = JSON.parse(JSON.stringify(req.body));
		var csvWriter = require('csv-write-stream');
		var writer = csvWriter({ headers: ["edad", "duración", "fecha", "hora"]});
		var fs = require('fs');
		req.getConnection(function (err, connection) {
				
				var query = connection.query("SELECT jumper.fnac, visita.duration, visita.date_g FROM jumper INNER JOIN visita ON jumper.id=visita.idjumper AND visita.date_g >= ? AND  visita.date_g <= ? AND visita.status = 'ended'",[input.ini,input.end], function(err, rows)
				{
	
					if (err)
							console.log("Error inserting : %s ",err );
					var nac, sec_left, years, date_g;
                    var ahora = new Date().getTime();
				    if(rows.length){
				    	// 'C:/Users/Go Jump/Desktop/'
				    	writer.pipe(fs.createWriteStream('C:/Users/benja/Desktop/' + input.ini + ' ~ ' + input.end + '.csv'));
				    	for (var i = 0; i <rows.length; i++) {
				    		date_g = new Date(rows[i].date_g);
				    		nac = new Date(rows[i].fnac).getTime();
                            sec_left = (ahora - nac) / 1000;
                            years = parseInt(sec_left / 31536000);
                            writer.write([years.toString(),(parseInt(rows[i].duration)-5).toString(),date_g.toLocaleDateString(),date_g.toLocaleTimeString()]);
				    	}
				    	writer.end();
				    } 
			    	res.redirect('/csv');					
				});
				
			 // console.log(query.sql); get raw query
		
		});
		}
		else res.redirect('/bad_login');
};
//Vista editar usuario.
exports.edit = function(req, res){
	
	if(req.session.isAdminLogged){
		var username = req.params.username;
		
		req.getConnection(function(err,connection){
			 
				var query = connection.query('SELECT * FROM user WHERE username = ?',[username],function(err,rows)
				{
						
						if(err)
								console.log("Error Selecting : %s ",err );
		 
						res.render('edit_user',{page_title:"Edit Users",data:rows});
								
					 
				 });
				 
				 //console.log(query.sql);
		}); 
		}
		else res.redirect('/bad_login');
};

//Logica editar usuario.
exports.save_edit = function(req,res){

	if(req.session.isAdminLogged){
		var input = JSON.parse(JSON.stringify(req.body));
		var username = req.params.username;
		
		req.getConnection(function (err, connection) {
				
				var data = {

						username   : input.username,
						password   : input.password 
				
				};
				
				connection.query("UPDATE user set ? WHERE username = ? ",[data,username], function(err, rows)
				{
	
					if (err)
							console.log("Error Updating : %s ",err );
				 
					res.redirect('/user');
					
				});
		
		});
		}
		else res.redirect('/bad_login');
};


//Borrar usuario.
exports.delete_user = function(req,res){

	if(req.session.isAdminLogged){
		 var username = req.params.username;
		
		 req.getConnection(function (err, connection) {
				
				connection.query("DELETE FROM user WHERE username = ? ",[username], function(err, rows)
				{
						
						 if(err)
								 console.log("Error deleting : %s ",err );
						
						 res.redirect('/user');
						 
				});
				
		 });
		}
		else res.redirect('/bad_login');
};