/**
 * Created by benja on 05-07-2017.
 */
//Vista convenios.
exports.convs = function(req, res){
    if(req.session.isAdminLogged){
        req.getConnection(function(err,connection){

            var query = connection.query('SELECT * FROM convenio',function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );

                res.render('list_convs',{data:rows});

            });
            //console.log(query.sql);
        });
    }
    else res.redirect('/bad_login');
};
function label(str) {
    switch (str){
        case "nom":
            return "Nombre";
            break;
        case "ape":
            return "Apellido";
            break;
        case "addr":
            return "Dirección";
            break;
        default:
            return str;
    }
}
// Lógica borrar convenios
exports.rm_conv = function(req,res){
  if(req.session.isAdminLogged){
      req.getConnection(function(err,connection){
         if(err)console.log(err);
         connection.query("DELETE FROM convinfo WHERE idconv = ?",[req.params.id],function(err,rows){
             if(err)console.log(err);
             connection.query("DELETE FROM convenio WHERE idconvenio = ?",[req.params.id],function(err,rows){
                 if(err)console.log(err);
                 res.redirect("/convs");
             });
          });
      });
  }
};
// Logica agregar convenio.
exports.save_conv = function(req,res){
    if(req.session.isAdminLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        req.getConnection(function (err, connection) {
            var data = { name : input.name, html : ""};
            if (typeof input.opt == "string"){
                data.html = "<label>" + label(input.opt) +  "</label><input type='text' name='" + input.opt + "' class='form-control' maxlength='50'>";
            } else {
                for (var i = 0; i<input.opt.length; i++){
                    data.html += "<label>" + label(input.opt[i]) +  "</label><input type='text' name='" + input.opt[i] + "' class='form-control' maxlength='50'>";
                }
            }
            console.log(input.opt);
            var query = connection.query("INSERT INTO convenio SET ? ",data, function(err, rows)
            {

                if (err)
                    console.log("Error inserting : %s ",err );

                res.redirect('/convs');

            });

            // console.log(query.sql); get raw query

        });
    }
    else res.redirect('/bad_login');
};
// Logica agregar info de convenio.
exports.save_convinfo = function(req,res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        req.getConnection(function (err, connection) {

            connection.query("INSERT INTO convinfo SET ? ",input, function(err, rows)
            {

                if (err)
                    console.log("Error inserting : %s ",err );
                connection.query("SELECT * FROM convinfo ORDER BY idinfo DESC LIMIT 1",input, function(err, rows)
                {

                    if (err)
                        console.log("Error inserting : %s ",err );
                    res.send(rows[0].idinfo.toString());

                });

            });

            // console.log(query.sql); get raw query

        });
    }
    else res.redirect('/bad_login');
};