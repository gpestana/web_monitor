var	conf = require('../conf/conf');


var isAllowed = function(ip) {
	var result = false;
	conf.hosts_allowed.ips.forEach(function(allowed_ip){
		if(ip == allowed_ip) {
			result = true;
			return;
		}
	});
	return result;
}

var log = function(msg){
	console.log(new Date+':   '+msg);
}

module.exports.log = log;
module.exports.isAllowed = isAllowed;