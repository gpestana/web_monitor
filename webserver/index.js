var express = require('express'),
	express_hbs = require('express-handlebars'),
	request = require('request'),
	path = require('path'),
	conf = require('./conf/conf'),
	utils = require('./lib/utils')

var app = express();
var hbs = express_hbs.create({});
	
app.use('/static', express.static(__dirname + '/public'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', __dirname+'/views');

app.get(conf.http.endpoint, function(req, client_response){
	request.get(conf.db_manager.endpoint, function(err, res, body){
		var log_json = JSON.parse(body);
		var timestamp = Object.keys(log_json)[0];

		client_response.render('monitor', {
			timestamp: timestamp,
			data: log_json[timestamp],
			error: err
		});
	});
});

var start_server = function(){
	var port = conf.http.port;
	var server = app.listen(port, function(){
		utils.log('[WEBSERVER] Listening at port '+port);
	});
}

start_server();