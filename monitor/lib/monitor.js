var http = require('request'),
	utils  = require('./utils'),
	inspector = require('./inspector'),
	comm = require('./channel.js');


var nr_requests;
var results = [];

var start = function(rules){
	nr_requests = utils.sizeRules(rules);
	utils.log('[MONITOR] Processing '+ nr_requests+' websites');

	for(var url in rules){
		if(utils.isValidObj(url, rules)){
			request(url, rules[url]);
		}
	}
}

var request = function(url, rules){
	var time_before_req = new Date();
	var time_after_res;
	http(url, function(err, res, body) {
		time_after_res = new Date();
		if(!err && utils.isOnline(res)) { 
			process_ok(url, body, rules, time_after_res - time_before_req);
		} else {
			process_error(url, err, time_after_res - time_before_req);
		}
	})
}

var process_ok = function(url, body, rules, latency) {
	var content_result = inspector.checkValidity(body, rules);
	
	add_result({url: url, latency: latency, status: '200 OK',
		content_result: content_result});
}

var process_error = function(url, err, latency) {
	add_result({url: url, latency: latency, status: err});
}

var add_result = function(res) {
	results.push(res);

	if (results.length == nr_requests) {
		//comm.send(JSON.stringify(results));
		comm.send(JSON.stringify(results));

		results = [];
	}
}




module.exports.start = start;