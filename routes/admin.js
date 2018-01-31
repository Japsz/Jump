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

// Logica agregar User.
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
// Logica Generar csv Jumpers.
exports.g_csv_j = function(req,res){
    if(req.session.isAdminLogged){
        var csvWriter = require('csv-write-stream');
        var writer = csvWriter({ headers: ["idjumper", "Nombre", "Apellido", "FdeNac", "correo"]});
        var fs = require('fs');
        req.getConnection(function (err, connection) {

            var query = connection.query("SELECT * FROM jumper",[], function(err, rows)
            {

                if (err)
                    console.log("Error Select : %s ",err );
                var fnac, correo;
                var ahora = new Date();
                if(rows.length){
                    // 'C:/Users/Go Jump/Desktop/'
                    writer.pipe(fs.createWriteStream('C:/Users/Go Jump/Desktop/Jump/public/csvs/Jumpers_hasta_~_' + ahora.toLocaleDateString() + '.csv'));
                    for (var i = 0; i <rows.length; i++) {
                        if(typeof rows[i].correo == "string"){
							correo = rows[i].correo;
                        } else {
                        	correo = "N/A";
						}
						fnac = new Date(rows[i].fnac).toLocaleDateString();
                        writer.write([rows[i].id, rows[i].name, rows[i].last_name,fnac, correo]);
                    }
                    writer.end();
                }
                res.send('/csvs/Jumpers_hasta_~_' + ahora.toLocaleDateString() + '.csv');
            });

            // console.log(query.sql); get raw query

        });
    }
    else res.redirect('/bad_login');
};
// Logica Generar csv Eventos.
exports.evnt_csv = function(req,res){
    if(req.session.isAdminLogged){
        var csvWriter = require('csv-write-stream');
        var writer = csvWriter({ headers: ["Nombre", "Tipo", "Fecha", "Duracion", "Asistentes","Observaciones"]});
        var fs = require('fs');
        console.log(req.body);
        req.getConnection(function (err, connection) {

            var query = connection.query("SELECT * FROM evento WHERE fecha >= ? AND fecha <= ? ",[new Date(req.body.desde),new Date(req.body.hasta)], function(err, rows)
            {

                if (err)
                    console.log("Error Select : %s ",err );
                var fnac;
                var ahora = req.body.desde;
                if(rows.length){
                    // 'C:/Users/Go Jump/Desktop/'
                    writer.pipe(fs.createWriteStream('C:/Users/Go Jump/Desktop/Jump/public/csvs/Eventos_desde_el' + ahora+ '.csv'));
                    for (var i = 0; i <rows.length; i++) {
                        fnac = new Date(rows[i].fecha).toLocaleString();
						rows[i].obs = rows[i].obs.replace(/\@\@\@/g," | ");
                        writer.write([rows[i].nom, rows[i].tipo, fnac,rows[i].duration,rows[i].asistentes, rows[i].obs]);
                    }
                    writer.end();
                }
                res.send('/csvs/Eventos_desde_el' + ahora + '.csv');
            });

            // console.log(query.sql); get raw query

        });
    }
    else res.redirect('/bad_login');
};
// Logica Generar csv visitas.
exports.g_csv = function(req,res){
	if(req.session.isAdminLogged){
		var input = req.body;
		console.log(input);
        // 'C:/Users/Go Jump/Desktop/Visitas - '
        var camino = "/csvs/Visitas_-_";
		var dats =[];
		if(input.hasta == "si"){
			dats.push(input.ini);
            var fin = new Date(input.end).getTime();
            fin += 1000*60*60*24;
            fin = new Date(fin);
			dats.push(fin);
			camino += input.ini + "_~_" + input.end + ".csv";
		} else {
			var fin = new Date(input.ini).getTime();
			fin += 1000*60*60*25;
			fin = new Date(fin);
            camino += input.ini + ".csv";
            dats.push(input.ini);
			dats.push(fin);
		}
		var csvWriter = require('csv-write-stream');
		var writer = csvWriter({ headers: ["n°visita", "Edad", "idjumper", "tiempo", "fecha", "hora"]});
		var fs = require('fs');
		req.getConnection(function (err, connection) {
				
				connection.query("SELECT visita.id, visita.idjumper, visita.duration, visita.date_g, jumper.fnac FROM jumper INNER JOIN visita" +
					" ON jumper.id=visita.idjumper AND visita.date_g >= ? AND  visita.date_g < ? AND visita.status = 'ended'",dats, function(err, rows)
				{
	
					if (err)
							console.log("Error inserting : %s ",err );
					var nac, sec_left, years, date_g;
                    var ahora = new Date().getTime();
				    if(rows.length){
				    	writer.pipe(fs.createWriteStream("C:/Users/Go Jump/Desktop/Jump/public" + camino));
				    	for (var i = 0; i <rows.length; i++) {
				    		date_g = new Date(rows[i].date_g);
				    		nac = new Date(rows[i].fnac).getTime();
                            sec_left = (ahora - nac) / 1000;
                            years = parseInt(sec_left / 31536000);
                            writer.write([rows[i].id, years.toString(), rows[i].idjumper,(parseInt(rows[i].duration)-5).toString(),
								date_g.toLocaleDateString(),date_g.toLocaleTimeString()]);
				    	}
				    	writer.end();
                        res.send(camino);
				    } else {
				    	res.send("0");
					}
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
