var http = {
	host: 'localhost',
	port: '8080',
	endpoint: '/'
}

var db_manager = {
	endpoint: 'http://localhost:3000/last_log'
}


module.exports.http = http;
module.exports.db_manager = db_manager;