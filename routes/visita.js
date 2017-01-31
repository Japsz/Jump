//Redirección y obtención de encuesta(s)
exports.add = function(req, res) {
	if (req.session.isUserLogged) {
		res.render('venta_actual',{data:req.session.jumps});
	}
	else res.redirect('/bad_login');
};
//Quitar de venta
exports.d_from_session = function(req, res) {
    if (req.session.isUserLogged) {
    	// Nótese que el id es del array y no de el jumper
        if(req.params.id == 0){
            req.session.jumps.shift();
        } else {
    	    req.session.jumps.splice(req.params.id);
        }
        res.redirect('/venta');
    }
    else res.redirect('/bad_login');
};
//Mostrar Visitas creadas - precods
exports.precods = function(req, res) {
	if(req.session.isUserLogged){
        req.getConnection(function (err, connection) {
            connection.query('SELECT * FROM visita ORDER BY id DESC LIMIT ?',[req.session.jumps.length],function(err, rows){
                if (err) console.log("Error selecting : %s", err);
                req.session.previps = rows;
                res.render('getcodes',{data: rows,jumps: req.session.jumps});
            });
        });

	} else res.redirect('/bad_login');
}
exports.end = function(req,res) {
    if(req.session.isUserLogged){
        var ahora = new Date().getTime();
        if(req.session.previps.length == 1) {
            var query = "INSERT INTO vip SET ? ";
            ahora = ahora + req.session.previps[0].duration*60*1000;
            var fin = new Date(ahora);
            var data = {
                id : req.session.previps[0].id,
                name:req.session.jumps[0][1],
                last_name:req.session.jumps[0][2],
                fnac: req.session.jumps[0][3],
                date_f: fin.toLocaleString()
            };
        } else {
            var data = [];
            var query = "INSERT INTO vip (`id`, `name`, `last_name`, `fnac`, `date_f`) VALUES ?";
            for (var i = 0; i<req.session.jumps.length; i++){
                ahora = ahora + req.session.previps[req.session.previps.length - 1 - i].duration*60*1000;
                var fin = new Date(ahora);
                var aux = [req.session.previps[req.session.previps.length - 1 - i].id, req.session.jumps[i][1], req.session.jumps[i][2], req.session.jumps[i][3], fin.toLocaleString()];
                data.push(aux);
                ahora = new Date().getTime();
            }
        }
        req.getConnection(function (err, connection){
            connection.query(query,[data], function(err, rows){
                if (err)
                    console.log("Error selecting : %s ", err);
                req.session.jumps = [];
                req.session.previps = [];
                res.redirect('/venta');

            });
        });
    } else res.redirect('/bad_login');

}
// Generar code128
exports.cods = function(req, res) {
    if(req.session.isUserLogged){
        var bwipjs = require('bwip-js');
        var jimps = require('jimp');
        req.getConnection(function (err, connection) {
            connection.query('SELECT * FROM visita WHERE id = ?',[req.params.cod],function(err, rows){
                if (err) console.log("Error selecting : %s", err);
                for(var i = 0; i < req.session.jumps.length; i++){
                    if(rows[0].idjumper == req.session.jumps[i][0]){
                        // 'C:/Users/Go Jump/Desktop/Jump/public/cods/'
                        var pat = 'C:/Users/Go Jump/Desktop/Jump/public/cods/' + req.params.cod.toString() + req.session.jumps[i][1].toString() + '.png';
                        jimps.read('C:/Users/Go Jump/Desktop/Jump/public/cods/base.png', function (err,image2) {
                            if(err) console.log(err);
                            jimps.loadFont(jimps.FONT_SANS_32_BLACK).then(function (font) {
                                image2.print(font, 0, 20, req.params.cod.toString());
                                image2.print(font, 100, 20, req.session.jumps[i][1].toString());
                                jimps.loadFont(jimps.FONT_SANS_16_BLACK).then(function (font) {
                                    image2.print(font, 0, 60, (parseInt(rows[0].duration) - 5).toString() + " Minutos");
                                    image2.rotate(90);
                                    image2.write( pat, function (){
                                        res.redirect('cods/' + req.params.cod.toString() + req.session.jumps[i][1].toString() + '.png');
                                    });
                                });
                            });
                        });
                        break;
                    }
                }
            });
        });
    } else res.redirect('/bad_login');
}
// Crear visitas desde jumpers
exports.save = function(req, res){
	if(req.session.isUserLogged){
        var input = JSON.parse(JSON.stringify(req.body));
        var tiempos = input.tiempos;
        var nowdate = new Date();
        if (req.session.jumps.length == 1){
        	var data = {
				idjumper : req.session.jumps[0][0],
				duration: parseInt(tiempos) + 5,
				date_g: nowdate.toLocaleString(),
				status: 'inprog'
			}
            var query = "INSERT INTO visita SET ?";
		} else {
            var data = [];
            var query = "INSERT INTO visita (`idjumper`, `duration`, `date_g`, `status`) VALUES ?";
            for (var i = 0; i<req.session.jumps.length; i++){
                var aux = [req.session.jumps[i][0], parseInt(tiempos[i]) + 5, nowdate.toLocaleDateString(), 'new'];
                data.push(aux);
            }
        }
		req.getConnection(function (err, connection) {
			connection.query(query,[data],function(err, rows){
				if (err) console.log("Error inserting : %s", err);
				res.redirect('/precods');
			});
		});

	}
	else res.redirect('/bad_login');
}
exports.update = function(req,res){
    req.getConnection(function(err,connection){

        connection.query("ALTER TABLE jump.visita CHANGE COLUMN `date_g` `date_g` DATETIME NOT NULL",function(err,rows)
        {

            if(err)
                console.log("Error Selecting : %s ",err );

            res.redirect('/user');


        });

        //console.log(query.sql);
    });
}