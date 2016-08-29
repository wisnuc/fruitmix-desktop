var testcases = {data:'testStore',cases:[]}

testcases.cases.push({
	name: 'select item',
	hint: 'please press select button',
	expectation: {	// action
		type: 'SELECT_CHILDREN',
		rowNumber: 0
	}
})

testcases.cases.push({
	name: 'select navigation',
	hint: 'please press nav button',
	expectation: {	// action
		type: 'NAV_SELECT',
		select: '分享给我的文件'
	}
})

testcases.cases.push({
	name: 'back to home',
	hint: 'please press home button',
	expectation: {	// action
		type: 'FILES_LOADING'
	}
})

testcases.cases.push({
	name: 'back to home',
	hint: 'please press select all button',
	expectation: {	// action
		type: 'SELECT_ALL_CHILDREN'
	}
})


module.exports = function() {
	return testcases
}