var log = function(msg){
	console.log(new Date+':   '+msg);
}

var isValidObj = function(url, obj) {
	return obj.hasOwnProperty(url);
}

var sizeRules = function(obj) {
	var size = 0;
	for (var r in obj) {
		if (obj.hasOwnProperty(r)) size++;
	}
	return size;
}

//TODO: make this verification more robust
var isOnline = function(res) {
	return res.statusCode == 200;
}

module.exports.log = log;
module.exports.isOnline = isOnline;
module.exports.isValidObj = isValidObj;
module.exports.sizeRules = sizeRules;