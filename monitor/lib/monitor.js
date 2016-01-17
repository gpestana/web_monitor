var http = require('request'),
	utils  = require('./utils'),
	parser = require('./parser');


var nr_requests;
var results = [];

var start = function(rules){
	nr_requests = utils.sizeRules(rules);
	utils.log('MONITOR: Processing '+ nr_requests+' websites');

	for(var url in rules){
		if(utils.isValidURL(url, rules)){
			request(url, rules[url]);
		}
	}
}

var request = function(url, rules){
	var time_before_req = new Date();
	var time_after_res;
	http(url, function(err, res, body) {
		time_after_res = new Date();
		if(!err && isOnline(res)) { 
			process_ok(url, body, rules, time_after_res - time_before_req);
		} else {
			process_error(url, err, time_after_res - time_before_req);
		}
	})
}

//TODO: make this verification more robust
var isOnline = function(res) {
	return res.statusCode == 200;
}

var process_ok = function(url, body, rules, latency) {
	var content_check = parser.checkValidity(body, rules);

	add_result({url: url, latency: latency, status: '200 OK',
		content_check: content_check});
}

var process_error = function(url, err, latency) {
	add_result({url: url, latency: latency, status: err});
}

var add_result = function(res) {
	results.push(res);
	if (results.length == nr_requests) {
		utils.log(results);
		results = [];
	}
}




module.exports.start = start;