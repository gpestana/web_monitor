var fs 	= require('fs'),
	path = require('path'),
	monitor = require('./lib/monitor.js');

var CONFIG_FILE = './conf/monitor_conf.json';
var TIME_CONV = 60*1000;

var start = function() {
	var config = JSON.parse(
		fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'UTF-8'));
	var interval_time = config['meta']['interval_time'];
		
	setTimeout(function(){
		monitor.start(config['rules']);
		start();
	}, interval_time*TIME_CONV);
}

start();



