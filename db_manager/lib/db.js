var utils = require('./utils');

var last_log = {};

var update_log = function(log) {
	last_log = {};
	last_log[new Date().toString()] = log;
	utils.log("[DB] Last log updated:");
	utils.log(JSON.stringify(log));
}

var get_last_log = function() {
	return last_log;
}

module.exports.update_log = update_log;
module.exports.get_last_log = get_last_log;