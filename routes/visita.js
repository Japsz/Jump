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
                date_f: fin.toLocaleString()
            };
        } else {
            var data = [];
            var query = "INSERT INTO vip (`id`, `name`, `last_name`, `date_f`) VALUES ?";
            for (var i = 0; i<req.session.jumps.length; i++){
                ahora = ahora + req.session.previps[req.session.previps.length - 1 - i].duration*60*1000;
                var fin = new Date(ahora);
                var aux = [req.session.previps[req.session.previps.length - 1 - i].id, req.session.jumps[i][1], req.session.jumps[i][2], fin.toLocaleString()];
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
                        var pat = 'C:/Users/Go Jump/Desktop/Jump/public/cods/' + req.params.cod.toString() + req.session.jumps[i][1].toString() + '.png';
                        bwipjs.toBuffer({
                            bcid:        'code128',       // Barcode type
                            text:        req.params.cod.toString(),    // Text to encode
                            height:      10,              // Bar height, in millimeters
                            includetext: true,            // Show human-readable text
                            textxalign:  'center'        // Always good to set this
                        }, function (err, png) {
                            if (err) {
                                throw err;
                                console.log(err);
                                // Decide how to handle the error
                                // `err` may be a string or Error object
                            } else {
                                jimps.read(png, function (err, image) {
                                    if(err) console.log(err);
                                    jimps.read('C:/Users/Go Jump/Desktop/Jump/public/cods/base.png', function (err,image2) {
                                        if(err) console.log(err);
                                        image2.blit(image,300,5);
                                        jimps.loadFont(jimps.FONT_SANS_32_BLACK).then(function (font) {
                                            image2.print(font, 450, 20, req.session.jumps[i][1].toString());
                                            image2.rotate(90);
                                            image2.write( pat, function (){ 
                                                console.log("yupi - " + pat);
                                                res.redirect('/cods/' + req.params.cod.toString() + req.session.jumps[i][1].toString() + '.png');
                                             } );
                                        });
                                    });
                                    // do stuff with the image (if no exception)
                                });
                                // `png` is a Buffer
                                // png.length           : PNG file length
                                // png.readUInt32BE(16) : PNG image width
                                // png.readUInt32BE(20) : PNG image height
                            }
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
				duration: parseInt(tiempos) + 7,
				date_g: nowdate.toLocaleString(),
				status: 'inprog'
			}
            var query = "INSERT INTO visita SET ?";
		} else {
            var data = [];
            var query = "INSERT INTO visita (`idjumper`, `duration`, `date_g`, `status`) VALUES ?";
            for (var i = 0; i<req.session.jumps.length; i++){
                var aux = [req.session.jumps[i][0], parseInt(tiempos[i]) + 7, nowdate.toLocaleDateString(), 'new'];
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