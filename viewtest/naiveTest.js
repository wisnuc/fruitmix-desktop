var testcases = []

testcases.push({
	name: 'hello',
	hint: 'please press login button',
	data: 'testData',
	expectation: {	// action
		type: 'FILES_LOADING'
	}
})

module.exports = function() {
	return testcases
}