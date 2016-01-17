var amqp = require('amqplib/callback_api'),
	utils = require('./utils.js'),
	conf = require('../conf/channel_conf');


var send = function(msg) {
	amqp.connect('amqp://'+conf.pipeline.host, function(err, conn) {
		conn.createChannel(function(err, ch) {
    		var queue = conf.pipeline.queue_name;
    		ch.assertQueue(queue, {durable: true});

    		ch.sendToQueue(queue, new Buffer(msg), {persistent: true});
    		utils.log('[CHANNEL] Sent: '+ msg);
  		});
	});
}

module.exports.send = send;