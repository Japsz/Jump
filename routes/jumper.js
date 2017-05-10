// Mostrar resultado de búsqueda
exports.list = function(req, res){
    var input = JSON.parse(JSON.stringify(req.body));
    var dats = [];
    if(req.session.isUserLogged){
        if(input.verif == ""){
            var query = "SELECT * FROM jumper WHERE name LIKE ? AND last_name LIKE ? ORDER BY name, last_name";
            dats.push(input.nom + "%");
            dats.push(input.ape + "%");
        } else {
            var query = 'SELECT * FROM jumper WHERE name LIKE ? AND last_name LIKE ? AND correo LIKE ? ORDER BY name, last_name';
            dats.push(input.nom + "%");
            dats.push(input.ape + "%");
            dats.push(input.verif + "%");
        }
        req.getConnection(function(err,connection){
            connection.query(query,dats,function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                res.render('jump_stream',{data:rows});

            });
            //console.log(query.sql);
        });
    }
    else res.redirect('/bad_login');

};
exports.getbsq_b = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    console.log(input.cor);
    req.getConnection(function(err,connection){
        connection.query('SELECT * FROM jumper WHERE  correo LIKE ?',input.cor,function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );
            res.render('bsq_stream',{data:rows, cor: input.cor.substring(0, input.cor.length - 1)});

        });
        //console.log(query.sql);
    });
}
//Index de Búsqueda
exports.prelist = function (req, res) {
    if(req.session.isUserLogged){
        res.render('jumpers',{page_title:"Jumpers",data2:req.session.jumps});
    } else res.redirect('/bad_login');
};

//Agregar a Venta (variable de sesión).
exports.add2session = function(req, res){
    var input = JSON.parse(JSON.stringify(req.body));
    var ids = input.ids;
    if(req.session.isUserLogged){
        if(ids.length){
            var query = "SELECT * FROM jumper WHERE id = ?";
            if(typeof ids == "object"){
                for (var i = 1; i<ids.length; i++){
                    query += "OR id = ?";
                }
            }
            req.getConnection(function (err, connection) {
                connection.query(query,ids, function (err, rows) {
                    if (err) console.log("Error selecting : %s ", err);
                    var dateFormat = require('dateFormat');
                    for(var i = 0; i < rows.length;i++){
                        var aux = [rows[i].id,rows[i].name,
                            rows[i].last_name, dateFormat(rows[i].fnac,"yyyy-mm-dd")];
                        req.session.jumps.push(aux);
                    }
                    if(parseInt(input.continue)) {
                        res.redirect('/venta');
                    } else
                    res.redirect('/begin_list');
                });
            });

        } else res.redirect('/bad_login');
    }
    else res.redirect('/bad_login');
};
// Modificar Jumper
exports.edit = function(req, res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var data = {
            name: input.nom,
            last_name: input.ape,
            fnac: input.fnac,
            correo: input.verif
        }
        req.getConnection(function(err,connection){

            connection.query("UPDATE jumper SET ? WHERE id = ?",[data,input.id],function(err,rows)
            {

                if(err)
                    console.log("Error Selecting : %s ",err );

                res.redirect('/begin_list');


             });

             //console.log(query.sql);
        });
    }
    else res.redirect('/bad_login');
};

// Guardar desde pre jumpers
exports.save = function(req,res){

    if(req.session.isUserLogged){
        var data =[];
        var dateFormat = require('dateFormat');
        for(var i = 0; i < req.session.pjumps.length;i++){
            req.session.pjumps[i].fnac = dateFormat(req.session.pjumps[i].fnac,
                "yyyy-mm-dd");
            var aux = [req.session.pjumps[i].name,
                req.session.pjumps[i].last_name, req.session.pjumps[i].fnac];
            if(req.params.verif != "null"){
                aux.push(req.params.verif);
            }
            req.session.jumps.push(aux);
            data.push(aux);
        }
        if(req.params.verif != "null"){
            var query = "INSERT INTO jumper (`name`, `last_name`, `fnac`, `correo`) VALUES ?";
        } else {
            var query = "INSERT INTO jumper (`name`, `last_name`, `fnac`) VALUES ?";
        }
        req.getConnection(function (err, connection) {

            connection.query(query,[data], function (err, rows) {
                if (err)
                    console.log("Error inserting : %s ", err);
                res.redirect('/get_ids');
            });
            // console.log(query.sql); get raw query
        });
    }

    else res.redirect('/bad_login');
};
exports.get_ids = function(req, res) {
    if(req.session.isUserLogged){
        req.getConnection(function (err, connection) {
            connection.query('SELECT * FROM jumper ORDER BY id DESC LIMIT ?',[req.session.pjumps.length],function(err, rows){
                if (err) console.log("Error selecting : %s", err);
                for(var i = 0;i < rows.length;i++){
                    req.session.jumps[req.session.jumps.length-i-1].unshift(rows[i].id);
                }
                console.log(req.session.jumps);
                res.redirect('/venta');
            });
        });

    } else res.redirect('/bad_login');
}

// No implementada
exports.delete_customer = function(req,res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var ids = input.ids;
        if(ids.length){
            var query2 = "DELETE FROM visita WHERE idjumper = ?";
            var query = "DELETE FROM jumper WHERE id = ?";
            if(typeof ids == "object"){
                for (var i = 1; i<ids.length; i++){
                    query += "OR id = ?";
                    query2 += "OR idjumper = ?";
                }
            }
            req.getConnection(function (err, connection) {
                connection.query(query2,ids,function(err, rows){
                    if (err) console.log("Error selecting : %s", err);
                    connection.query(query,ids,function(err, rows){
                        if (err) console.log("Error selecting : %s", err);
                        res.send('1');
                    });
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