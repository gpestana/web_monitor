var test = require('tape'),
	inspector = require('../lib/inspector');

var rule_include_true = {
	"rules": {
		"include": "search"
	},
	"body": "search on google. search."
}
var rule_exclude_false = {
	"rules": {
		"exclude": "search"
	},
	"body": "try to search on google"
}
var rule_double_false = {
	"rules": {
		"exclude": "messenger",
		"include": "not include"
	},
	"body": "double false body messenger"
}
var rule_double_true = {
	"rules": {
		"exclude": "exclude",
		"include": "google"
	},
	"body": "facebook and google"
}



test('inspector', function(t){
	t.plan(6);

	var res_1 = inspector.checkValidity(
		rule_include_true['body'], rule_include_true['rules']);

	t.equal(res_1.include, true);

	var res_2 = inspector.checkValidity(
		rule_exclude_false['body'], rule_exclude_false['rules']);

	t.equal(res_2.exclude, false);

	var res_3 = inspector.checkValidity(
		rule_double_false['body'], rule_double_false['rules']);

	t.equal(res_3.include, false);
	t.equal(res_3.exclude, false);

	var res_4 = inspector.checkValidity(
		rule_double_true['body'], rule_double_true['rules']);

	t.equal(res_4.include, true);
	t.equal(res_4.exclude, true);
});
