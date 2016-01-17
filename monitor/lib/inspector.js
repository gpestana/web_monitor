var utils  = require('./utils');


var checkValidity = function(body, rules){
	var results = {};

	for(var rule in rules) {
		if(utils.isValidObj(rule, rules)){
			results[rule] = check_functions[rule](rules[rule], body);
		}
	}
	return results;
}

/*
 * [Object] check_functions
 * Object contains functions that check the content of the page against rules of conf. file.
 * 
 */
var check_functions = {
	include: function(string, body){
		var regex = new RegExp(string, 'g');
		var res = body.match(regex);

		if(res) return true;
		return false;
	},

	exclude: function(string, body){
		var regex = new RegExp(string, 'g');
		var res = body.match(regex);

		if(res) return false;
		return true;
	}
}



module.exports.checkValidity = checkValidity;