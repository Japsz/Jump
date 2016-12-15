//Vista mostrar quiz
exports.list = function(req, res){
	req.getConnection(function(err,connection){

			connection.query('SELECT * FROM vip WHERE ended = 1',function(err,rows)
			{
				if(err)
					console.log("Error Selecting : %s ",err );
                if(rows.length){
                    var endeds = rows;
                } else var endeds = [];
                connection.query('SELECT * FROM vip WHERE ended = 0',function(err,rows)
                {
                    if(err)
                        console.log("Error Selecting : %s ",err );

                    res.render('list_vips',{page_title:"Tiempos",data:rows,ends:endeds});
                });
			 });
			 //console.log(query.sql);
	});
};

//Handler pulsera
exports.check = function(req,res){
    var input = JSON.parse(JSON.stringify(req.body));
    var idvisit = input.idvisita;
	req.getConnection(function(err,connection){
		connection.query('SELECT * FROM visita WHERE id = ?',[idvisit],function(err,rows)
		{
			if(err)
				console.log("Error Selecting : %s ",err );
			if (rows.length == 0){
				res.redirect('/vip_list');
			} else {
    			if(rows[0].status == "new"){
    				req.session.visita = rows[0];
                    connection.query("UPDATE visita SET status = 'inprog' WHERE id = ?",[idvisit],function(err,rows)
                    {
                        if(err)
                            console.log("Error updating : %s ",err );
                        res.redirect('/vip/save');
                    });
    			} else if(rows[0].status == "inprog"){
    				req.session.visita = rows[0];
                    connection.query("SELECT * FROM vip WHERE id = ?",[idvisit],function(err,rows)
                    {
                        if(err)
                            console.log("Error updating : %s ",err );
                        var target_date = new Date(rows[0].date_f ).getTime();
                        // find the amount of "seconds" between now and target
                        var current_date = new Date().getTime();
                        var seconds_left = (target_date - current_date) / 1000;
                        var minutes = parseInt(seconds_left / 60);
                        if(req.session.visita.duration - minutes < 5){
                        	res.redirect('vip_list');
    					} else
                        res.redirect('/vip/delete');
                    });
                } else {
    				res.redirect('vip_list');
    			}
            }
        });
		//console.log(query.sql);
	});
};
// Tiempo cumplido
exports.time_end = function(req,res){
    var idvisit = req.params.id;
    req.getConnection(function(err,connection){

        connection.query("UPDATE vip SET ended = 1 WHERE id = ?", [idvisit], function (err, rows) {
            if (err)
                console.log("Error updating : %s ", err);
            res.redirect('/vip_list');
        });
        //console.log(query.sql);
    });
};

//Logica iniciar visita.
exports.save = function(req,res){
	req.getConnection(function (err, connection){

		connection.query("SELECT * FROM jumper WHERE id = ?",[req.session.visita.idjumper], function(err, rows){
            if (err)
                console.log("Error selecting : %s ", err);
            var ahora = new Date().getTime();
            ahora = ahora + req.session.visita.duration*60*1000;
            var fin = new Date(ahora);
            var data = {
            	id : req.session.visita.id,
                name		:rows[0].name,
                last_name		:rows[0].last_name,
				ended  : 0,
				date_f : fin.toLocaleString()
            };

            connection.query("INSERT INTO vip SET ? ",data, function(err, rows){
                if (err)
                    console.log("Error insrting : %s ", err);
                res.redirect('/vip_list');
            });
        });
	});
};

exports.disable_quiz = function(req,res){
	if(req.session.isAdminLogged){
		var idquiz = req.params.idquiz;
		var activated = req.params.activated;
		var idproject = req.params.idproject;
		req.getConnection(function(err, connection){
			connection.query('UPDATE quiz SET activated = ? WHERE idquiz = ? AND idproject = ?',[activated,idquiz,idproject],function(err,rows)
			{
				if(err) console.log("Error Selecting : %s ",err);

			res.redirect('/quiz/list/'+idproject);
			});
		});
	}else res.redirect('/bad_login')
};

//Logica borrar encuesta.
exports.delete = function(req,res){
	if(req.session.isUserLogged){
		req.getConnection(function(err, connection){
			connection.query("DELETE FROM vip WHERE id = ? ",[req.session.visita.id], function(err,rows){
				if(err)
					console.log("Error deleting : %s", err);

                connection.query("UPDATE visita SET status = 'ended' WHERE id = ? ",[req.session.visita.id], function(err,rows){
                    if(err)
                        console.log("Error deleting : %s", err);

                    res.redirect('/vip_list');
                });
			});
		});
	}
	else
		res.redirect('/bad_login');
};

