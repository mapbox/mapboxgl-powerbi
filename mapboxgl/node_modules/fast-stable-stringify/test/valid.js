var substackStringify = require('json-stable-stringify'),
	myStringify = require('../index'),
	assert = require('assert'),
	eachRecursive = require('../util/eachRecursive');

var fixtures = require('../fixtures'),
	input = fixtures.input,
	numComparisons = 0;

suite("Unit test", function(){
	test("valid", function() {
		eachRecursive(input, function (val, path) {
			var mine = myStringify(val),
				expectedVal = substackStringify(val);
			if (mine !== expectedVal) {
				console.log("[Not equal] path:", path, "value:", val, "mine:", mine);
			}
			assert.equal(mine, expectedVal);
			numComparisons++;
		});
		//console.log(numComparisons + " comparisons made");
	});
	test("Expected number of comparisons run (599)", function() {
		assert.equal(numComparisons, 599);
	})
});
