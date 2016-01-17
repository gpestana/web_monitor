var log = function(msg){
	console.log(new Date+':   '+msg);
}

var isValidURL = function(url, obj) {
	return obj.hasOwnProperty(url);
}

var sizeRules = function(obj) {
	var size = 0;
	for (var r in obj) {
		if (obj.hasOwnProperty(r)) size++;
	}
	return size;
}

module.exports.log = log;
module.exports.isValidURL = isValidURL;
module.exports.sizeRules = sizeRules;