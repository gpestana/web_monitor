var pipeline = {
	host: 'localhost',
	queue_name: 'database_channel'
}

var http = {
	host: 'localhost',
	port: '3000',
	endpoint: '/last_log'
}

var hosts_allowed = {
	ips: ['127.0.0.1']
}

module.exports.pipeline = pipeline;
module.exports.http = http;
module.exports.hosts_allowed = hosts_allowed;