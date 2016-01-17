var amqp = require('amqplib/callback_api'),
    conf = require('../conf/conf'),
    utils = require('./utils'),
    db = require('./db');

var consume = function() {
  amqp.connect('amqp://'+conf.pipeline.host, function(err, conn) {
    conn.createChannel(function(err, ch) {
      var queue = conf.pipeline.queue_name;
      ch.assertQueue(queue, {durable: true}); //queue dumps msg to disk in case of failure
      ch.prefetch(1); //fair dispatch

      utils.log("[COMMUNICATION] Waiting for messages");
      ch.consume(queue, function(msg) {

      db.update_log(JSON.parse(msg.content.toString()));

      ch.ack(msg); //send ack as msg was delivered
      }, {noAck: false}); //turns message ack on
    });
  });
}

consume();