//Vista mostrar quiz
exports.list = function(req, res){
	req.getConnection(function(err,connection){

			connection.query('SELECT * FROM vip ORDER BY date_f ASC',function(err,rows)
			{
				if(err)
					console.log("Error Selecting : %s ",err );

                if(req.session.isUserLogged){
                    res.render('user_vips',{page_title:"Tiempos",data:rows});
                } else if(req.session.isMonitLogged){
                    res.render('monit_vips',{page_title:"Tiempos",data:rows});
                } else res.render('list_vips2',{page_title:"Tiempos",data:rows});
			 });
			 //console.log(query.sql);
	});
};
exports.uv_stream = function(req, res){
    req.getConnection(function(err,connection){

        connection.query('SELECT * FROM vip ORDER BY date_f ASC',function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );

            res.render("uvipstream",{data:rows});
        });
        //console.log(query.sql);
    });
};
exports.tables = function(req, res){
    req.getConnection(function(err,connection){

        connection.query('SELECT * FROM vip ORDER BY date_f ASC',function(err,rows)
        {
            if(err)
                console.log("Error Selecting : %s ",err );
            console.log(rows);
            res.render('list_vips',{data:rows});
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
                        var seconds_left = (target_date - current_date);
                        if( seconds_left < 0){
                        	res.redirect('/vip/delete');
    					} else
                        res.redirect('/vip_list');
                    });
                } else {
    				res.redirect('/vip_list');
    			}
            }
        });
		//console.log(query.sql);
	});
};
// 5 minutos restantes
exports.time_near = function(req,res){
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
// Tiempo cumplido
exports.time_end = function(req,res){
    var idvisit = req.params.id;
    req.getConnection(function(err,connection){

        connection.query("UPDATE vip SET ended = 2 WHERE id = ?", [idvisit], function (err, rows) {
            if (err)
                console.log("Error updating : %s ", err);
            res.redirect('/vip_list');
        });
        //console.log(query.sql);
    });
};

exports.extend = function(req,res){
    var input = JSON.parse(JSON.stringify(req.body));
    var id = input.id;

    req.getConnection(function(err,connection){

        connection.query("SELECT visita.idjumper, vip.date_f FROM visita INNER JOIN vip WHERE visita.id = vip.id AND vip.id = ?", [id], function (err, rows) {
            if (err)
                console.log("Error updating : %s ", err);
            var ahora = new Date(rows[0].date_f).getTime();
            ahora = ahora + parseInt(input.tiempo)*60*1000;
            var fin = new Date(ahora);
            var data = {
                idjumper : rows[0].idjumper,
                duration: parseInt(input.tiempo) + 5,
                date_g: new Date().toLocaleString(),
                status: 'ended'
            };
            connection.query("INSERT INTO visita SET  ?",[data], function (err, rows) {
                if (err)
                    console.log("Error updating : %s ", err);
                connection.query("UPDATE vip SET date_f = ? WHERE id = ?",[fin.toLocaleString(), input.id], function (err, rows) {
                    if (err)
                        console.log("Error updating : %s ", err);
                    req.app.locals.io.emit('ajax');

                    res.redirect('/vip_list');
                });
            });
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
				ended  : 9,
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

exports.sudo_del = function(req,res){
    var idvip = req.params.id;
    req.getConnection(function(err, connection){
        connection.query("SELECT * FROM vip WHERE id = ?",idvip,function(err,exvip){
            connection.query("DELETE FROM vip WHERE id = ? ",[idvip], function(err,rows){
                if(err)
                    console.log("Error deleting : %s", err);
                if(!exvip[0].ended){
                    connection.query("UPDATE visita SET status = 'ended' WHERE id = ? ",[idvip], function(err,rows){
                        if(err)
                            console.log("Error deleting : %s", err);
                        req.app.locals.io.emit('ajax');
                        res.redirect('/vip_list');
                    });
                } else {
                    connection.query("UPDATE evento SET estado = 'fin',asistentes = ? WHERE idevento = ? ",[exvip[0].ended,idvip], function(err,rows){
                        if(err)
                            console.log("Error deleting : %s", err);
                        req.app.locals.io.emit('ajax');
                        res.redirect('/vip_list');
                    });
                }
            });
        });
    });
};

