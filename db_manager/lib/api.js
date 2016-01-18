var express = require('express'),
	conf = require('../conf/conf'),
	utils = require('./utils'),
	db = require('./db');

var app = express();

//security layer
app.use(function(req, res, next) {
  if (utils.isAllowed(req.ip)) {
  	next();
  } else {
  	res.end(403, 'You are not allowed to access this data');
  }
})

//implements API
app.get(conf.http.endpoint, function(req, res) {
	utils.log('[WEBSERVER] log request from '+req.connection.remoteAddress);
	res.json(db.get_last_log());
});

var start_server = function(){
	var port = conf.http.port;
	var server = app.listen(port, function(){
		utils.log('[WEBSERVER] Listening at port '+port);
	});
}

start_server();