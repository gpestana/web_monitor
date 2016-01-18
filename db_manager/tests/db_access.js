var test = require('tape'),
	db = require('../lib/db.js');


var log_1 = {
	this: 'that',
	that: 'this'
}

var log_2 = {
	log: 'stub'
}


test('db access', function(t){
	t.plan(3);
	
	var empty = db.get_last_log();
	t.equal(Object.keys(empty).length, Object.keys({}).length, 
		'db should be empty when db_manager starts');

	db.update_log(log_1);
	var log1 = db.get_last_log();
	var ts = Object.keys(log1)[0];
	t.equal(log1[ts], log_1, 
		'db should have been updated accordingly');

	db.update_log(log_2);
	var log2 = db.get_last_log();
	var ts = Object.keys(log2)[0];
	t.equal(log2[ts], log_2,
		'db should have been updated accordingly');


});
