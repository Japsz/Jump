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
    	req.session.jumps.splice(req.params.id);
        res.redirect('/venta');
    }
    else res.redirect('/bad_login');
};
//Generar codigos de barras
exports.cods = function(req, res) {
	if(req.session.isUserLogged){
        var path = require('path');
        var bwipjs = require('bwip-js');
        var jimps = require('jimp');
        req.getConnection(function (err, connection) {
            connection.query('SELECT * FROM visita ORDER BY id DESC LIMIT ?',[req.session.jumps.length],function(err, rows){
                if (err) console.log("Error selecting : %s", err);
                var pat = 'public/cods/0.png';
                for(var i = 0; i < rows.length; i++){
                    var pat = 'public/cods/' + rows[i].id + '.png';
                    bwipjs.toBuffer({
                        bcid:        'code128',       // Barcode type
                        text:        rows[i].id.toString(),    // Text to encode
                        height:      10,              // Bar height, in millimeters
                        includetext: true,            // Show human-readable text
                        textxalign:  'center'        // Always good to set this
                    }, function (err, png) {
                        if (err) {
                            throw err;
                            // Decide how to handle the error
                            // `err` may be a string or Error object
                        } else {
                            jimps.read(png, function (err, image) {
                                if(err) console.log(err);
                                image.write( pat, function (){ console.log("exito" )} );
                                // do stuff with the image (if no exception)
                            });
                            // `png` is a Buffer
                            // png.length           : PNG file length
                            // png.readUInt32BE(16) : PNG image width
                            // png.readUInt32BE(20) : PNG image height
                        }
                    });
                    console.log(pat);

                }
                req.session.jumps = [];
                res.redirect('/venta');
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
				duration: tiempos,
				date_g: nowdate.toLocaleString(),
				status: 'new'
			}
            var query = "INSERT INTO visita SET ?";
		} else {
            var data = [];
            var query = "INSERT INTO visita (`idjumper`, `duration`, `date_g`, `status`) VALUES ?";
            for (var i = 0; i<req.session.jumps.length; i++){
                var aux = [req.session.jumps[i][0], tiempos[i], nowdate.toLocaleDateString(), 'new'];
                data.push(aux);
            }
        }
		req.getConnection(function (err, connection) {
			connection.query(query,[data],function(err, rows){
				if (err) console.log("Error inserting : %s", err);
				res.redirect('/cods');
			});
		});

	}
	else res.redirect('/bad_login');
}