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
//Vista lista de projectos.
exports.remove = function(req, res){

    if(req.session.isUserLogged){
        req.getConnection(function(err,connection){

            connection.query('DELETE FROM pJumper WHERE id = ?',[req.params.id],function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                res.redirect('/registro_jumper');
            });

            //console.log(query.sql);
        });
    }
    else res.redirect('/bad_login');
};
exports.getreg = function(req, res){
    res.render('registro',{});
};
exports.getbusq = function(req, res){
    res.render('busqueda',{});
};
exports.gethom = function(req, res){
    res.render('continuar',{});
};
exports.getcont = function(req, res){
    res.render('pas2',{});
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

			res.redirect('/pjump/1');
		});
	});
};
exports.sudo_pj = function(req, res){
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function(err,connection){
        var data = {
            name        :input.nom,
            last_name   :input.ape,
            fnac    :input.fnac,
        };
        var query = connection.query("INSERT INTO pJumper set ? ",data,function(err, rows){
            if (err){
                console.log("Error inserting at" + new Date().toLocaleString() + " : %s", err);
            }
            res.redirect("/registro_jumper");
        });
    });
};
//Logica agregar prejumpers.
exports.save2 = function(req, res){
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function(err,connection){
        var data = {
            name        :input.nom,
            last_name   :input.ape,
            fnac    :input.fnac,
        };
        var query = connection.query("INSERT INTO pJumper set ? ",data,function(err, rows){
            if (err){
                console.log("Error inserting : %s", err);
            } 
            res.send("yupi");
        });
    });
};
// Lógica borrar prejumper
exports.delete = function(req, res){
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
		var ids = input.ids;
        if(verif == ""){
            verif = 'null';
        }
		if(ids.length){
			var query = "SELECT * FROM pJumper WHERE id = ?";
			var query2 = "DELETE FROM pJumper WHERE id = ?";
			if(typeof ids == "object"){
                for (var i = 1; i<ids.length; i++){
                    query += "OR id = ?";
                    query2 += "OR id = ?";
                }
            }
			req.getConnection(function (err, connection) {
				connection.query(query,ids, function (err, rows) {
					if (err) console.log("Error selecting : %s ", err);
					req.session.pjumps = rows;
					connection.query(query2,ids,function (err,rows) {
                        if (err) console.log("Error selecting : %s ", err);
                        res.redirect('/jumper/save/'+ verif);
					});
				});
			});

		} else res.redirect('/bad_login');
	}
	else res.redirect('/bad_login');
};