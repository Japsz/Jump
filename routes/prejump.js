//Vista lista de projectos.
exports.list = function(req, res){

	if(req.session.isUserLogged){
     	req.getConnection(function(err,connection){
         
        	var query = connection.query('SELECT * FROM pJumper',function(err,rows)
        	{
            	if(err)
            	    console.log("Error Selecting : %s ",err );
            	res.render('pjumpers',{page_title:"Pre Jumpers",data:rows});
       		});
           
           //console.log(query.sql);
   	 	});
  	}
  else res.redirect('/bad_login');
};

//Vista agregar projectos
exports.add = function(req, res){
	res.render('add_pjump',{page_title:"Registro"});
};

//Logica agregar prejumpers.
exports.save = function(req, res){
	var input = JSON.parse(JSON.stringify(req.body));
	req.getConnection(function(err,connection){
		var data = {
			name		:input.nom,
			last_name	:input.ape,
			fnac	:input.fnac,
		};
		var query = connection.query("INSERT INTO pJumper set ? ",data,function(err, rows){
			if (err) console.log("Error inserting : %s", err);

			res.redirect('/pjump')
		});
	});
};

//Logica registrar prejump -> jump .
exports.transfer = function(req, res){
	if(req.session.isUserLogged){
		var input = JSON.parse(JSON.stringify(req.body));
		var verif = input.verificador;
		var options = input.options;
		var ids = input.ids;
		console.log(ids);
		if(typeof req.session.jumps == 'undefined'){
			req.session.jumps = [];
		}
		if(ids.length){
			req.getConnection(function (err, connection) {
				connection.query("SELECT * FROM pJumper WHERE id = set ?", [ids], function (err, rows) {
					if (err) console.log("Error selecting : %s ", err);
					req.session.jumps = rows;
				});
			});
			res.redirect('/jumper/save');
		} else res.redirect('/bad_login');
	}
	else res.redirect('/bad_login');
};