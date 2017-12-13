
exports.list = function(req, res){
    var query;
    req.getConnection(function(err,connection){
        if(req.params.type == 'all'){
            query = 'SELECT * FROM evento ORDER BY fecha ASC';
        } else if(req.params.type == 'fin'){
            query = 'SELECT * FROM evento where estado = "fin" ORDER BY fecha ASC';
        } else if(req.params.type == 'new'){
            query = 'SELECT * FROM evento where estado = "new" ORDER BY fecha ASC';
        }
        connection.query(query,function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );

            if(req.session.isUserLogged){
                res.render('caja_evnt',{page_title:"Eventos",data:rows});
            } else if(req.session.isAdminLogged){
                res.render('admin_evnt',{page_title:"Eventos",data:rows});
            } else res.redirect('/bad_login');
        });
        //console.log(query.sql);
    });
};
exports.save = function(req,res){
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function(err,connection){
        connection.query("INSERT INTO evento SET ?",input,function(err,rows){
            if(err)throw err;
            res.redirect("/evnt_list/all");
        })
    });
};
exports.delete = function(req,res){
    req.getConnection(function(err,connection){
        connection.query("DELETE FROM evento WHERE idevento =  ?",req.params.id,function(err,rows){
            if(err)throw err;
            res.redirect("/evnt_list/all");
        })
    });
};
exports.start = function(req,res){
    req.getConnection(function (err, connection){
        connection.query("SELECT * FROM evento WHERE idevento = ?",req.params.id, function(err, rows){
            if (err)
                console.log("Error selecting : %s ", err);
            var ahora = new Date().getTime();
            ahora = ahora + rows[0].duration*60*1000;
            var fin = new Date(ahora);
            var data = {
                id: rows[0].idevento,
                name		:rows[0].nom,
                last_name		:"",
                ended  : 1,
                date_f : fin.toLocaleString()
            };

            connection.query("INSERT INTO vip SET ? ",data, function(err, rows){
                if (err)
                    console.log("Error insrting : %s ", err);
                connection.query("UPDATE evento SET estado = 'inprog' WHERE idevento = ?",req.params.id, function(err, rows){
                    if (err)
                        console.log("Error insrting : %s ", err);
                    req.app.locals.io.emit('ajax');
                    res.redirect('/evnt_list/new');
                });
            });
        });
    });
};
exports.setended = function(req,res){
    if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        req.getConnection(function(err,connection){
           connection.query("UPDATE vip SET ended = ? WHERE id = ?",[input.newnum,input.id],function(err,rows){
               if (err)
                   console.log("Error insrting : %s ", err);
               res.redirect("/vip_list");
           });
        });
    }
};
