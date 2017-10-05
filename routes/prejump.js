//Vista lista de prejumper.
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
exports.list_red = function(req, res){

    if(req.session.isUserLogged){
        var red = require('mysql');
        var con = red.createConnection({
            host: "gojump.cl",
            user: "gojumpcl_log",
            password: "13551355",
            database: "gojuamcl_1355"
        });
        con.connect(function(err) {
            if (err) {
                console.log("Error Selecting : %s ",err );
                res.render('pjumpers_red',{page_title:"Pre Jumpers",data:[], con: "no"});
            } else {
                con.query("Select * FROM pJumper", function (err, result) {
                    if (err)
                        console.log("Error Selecting red : %s ",err );
                    res.render('pjumpers_red',{page_title:"Pre Jumpers",data:result, con: "si"});
                });
            }
        });
    }
    else res.redirect('/bad_login');
};
exports.remove_red = function(req, res){

    if(req.session.isUserLogged){
        var red = require('mysql');
        var con = red.createConnection({
            host: "gojump.cl",
            user: "gojumpcl_log",
            password: "13551355",
            database: "gojuamcl_1355"
        });
        var input = JSON.parse(JSON.stringify(req.body));
        var ids = input.ids;
        if(ids.length){
            con.connect(function (err) {
                if (err) {
                    console.log("Error Selecting : %s ", err);
                    res.render('pjumpers_red', {page_title: "Pre Jumpers", data: [], con: "no"});
                } else {
                    var query = "DELETE FROM pJumper WHERE id = ?";
                    if(typeof ids == "object"){
                        for (var i = 1; i<ids.length; i++){
                            query += "OR id = ?";
                        }
                    }
                    con.query(query,ids, function (err, result) {
                        if (err)
                            console.log("Error Deleting red : %s ", err);
                        res.send("1");
                    });
                }
            });
            } else res.send("0");
    }
    else res.send('0');
};
//Vista lista de projectos.
exports.remove = function(req, res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var ids = input.ids;
        if(ids.length){
            var query = "DELETE FROM pjumper WHERE id = ?";
            if(typeof ids == "object"){
                for (var i = 1; i<ids.length; i++){
                    query += "OR id = ?";
                }
            }
            req.getConnection(function (err, connection) {
                connection.query(query,ids,function(err, rows){
                    if (err) console.log("Error deleting : %s", err);
                    res.send("1");
                });
            });
        } else
            res.send("0");
        //  var phone = req.params.phone;
        //
        //  req.getConnection(function (err, connection) {
        //
        //     connection.query("DELETE FROM contact WHERE phone = ? ",[phone], function(err, rows)
        //     {
        //
        //          if(err)
        //              console.log("Error deleting : %s ",err );
        //
        //          res.redirect('/contact');
        //
        //     });
        //  });
    }
    else res.redirect('/bad_login');
};
exports.edit_red = function(req, res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var data = {
            name: input.nom,
            last_name: input.ape,
            fnac: input.fnac
        };
        var red = require('mysql');
        var con = red.createConnection({
            host: "gojump.cl",
            user: "gojumpcl_log",
            password: "13551355",
            database: "gojuamcl_1355"
        });
        con.connect(function(err) {
            if (err) {
                console.log("Error Selecting : %s ",err );
                res.render('pjumpers_red',{page_title:"Pre Jumpers",data:[], con: "no"});
            } else {
                con.query("UPDATE pJumper SET ? WHERE id = ?",[data,input.id], function (err, result) {
                    if (err)
                        console.log("Error Updating red : %s ",err );
                    res.redirect('/registro_jumper_red');
                });
            }
        });
    }
    else res.redirect('/bad_login');
};

exports.edit = function(req, res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var data = {
            name: input.nom,
            last_name: input.ape,
            fnac: input.fnac,
        }
        req.getConnection(function(err,connection){

            connection.query("UPDATE pjumper SET ? WHERE id = ?",[data,input.id],function(err,rows)
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
exports.transfer_red = function(req, res){
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
            var red = require('mysql');
            var con = red.createConnection({
                host: "gojump.cl",
                user: "gojumpcl_log",
                password: "13551355",
                database: "gojuamcl_1355"
            });
            con.connect(function(err) {
                if (err) {
                    console.log("Error connecting : %s ", err);
                    res.render('pjumpers_red', {page_title: "Pre Jumpers", data: []});
                } else {
                    con.query(query,ids, function (err, rows) {
                        if (err) console.log("Error selecting : %s ", err);
                        req.session.pjumps = rows;
                        console.log(rows);
                        con.query(query2,ids,function (err,rows) {
                            if (err) console.log("Error selecting : %s ", err);
                            res.redirect('/jumper/save/'+ verif);
                        });
                    });
                }
            });

        } else res.redirect('/bad_login');
    }
    else res.redirect('/bad_login');
};