//Redirección y obtención de encuesta(s)
exports.add = function(req, res) {
	if (req.session.isUserLogged) {
		if(typeof req.session.jumps == 'undefined'){
			res.render('venta_actual',{data:[]});
		} else res.render('venta_actual',{data:req.session.jumps});
	}
	else res.redirect('/bad_login');
}

exports.save = function(req, res){
	if(req.session.isUserLogged){

		var status_result = req.params.result;
		var idcontact = req.params.idcontact;

		req.getConnection(function (err, connection)
			{
				var nowdate = new Date();
				var data = {
					idcontact	:input.name,
					idquiz		:req.session.selected_quizes[req.session.selected_number].idquiz,
					duration	:60, //hay que implementar esto con la grabación
					date		:nowdate.toLocaleDateString(),
					status		:input
				};
				connection.query("INSERT INTO call set ? ",data,function(err, rows){
					if (err) console.log("Error inserting : %s", err);

					res.redirect('/call/' + req.session.selected_idproject);
				});
			})

	}
	else res.redirect('/bad_login');
}