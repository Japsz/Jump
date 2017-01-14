//Vista mostrar quiz
exports.list = function(req, res){
	req.getConnection(function(err,connection){

			connection.query('SELECT * FROM vip ORDER BY date_f ASC',function(err,rows)
			{
				if(err)
					console.log("Error Selecting : %s ",err );

                if(req.session.isUserLogged){
                    res.render('user_vips',{page_title:"Tiempos",data:rows});
                } else res.render('list_vips2',{page_title:"Tiempos",data:rows});
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
            if(req.params.num != rows.length){
                res.render('false');
            } else
            res.render('list_vips');
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
    const escpos = require('escpos');
     
    const device  = new escpos.USB();
    // const device  = new escpos.Network('localhost'); 
    // const device  = new escpos.Serial('/dev/usb/lp0'); 
     
    const printer = new escpos.Printer(device);
     
    device.open(function(){
     
      printer
      .font('a')
      .align('ct')
      .style('bu')
      .size(1, 1)
      .text('The quick brown fox jumps over the lazy dog')
      .barcode('12345678', 'EAN8')
      .qrimage('https://github.com/song940/node-escpos', function(err){
        this.cut();
        this.close();
      });
     
    });
    res.redirect('/venta');
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

exports.sudo_del = function(req,res){
		var idvip = req.params.id;
		req.getConnection(function(err, connection){
			connection.query('SELECT * FROM visita WHERE id = ?',[idvip],function(err,rows)
			{
                if(err) console.log("Error Selecting : %s ",err);
			    if(rows.length){
                    req.session.visita = rows[0];
                    res.redirect('/vip/delete');
                }
			});
		});
};

//Logica borrar vip.
exports.delete = function(req,res){
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

};

