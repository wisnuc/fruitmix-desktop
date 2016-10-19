global.request = require('request')

var index = 1
loop()

function loop() {
	if (index<255) {
		testNet(index)
	}
}

function testNet(number) {
	let options = {
		method: 'GET',
		url: 'http://192.168.5.' + number + ':3721/login',
	}

	let callback = function(err,res,body) {
		if (!err) {
			console.log(number + 'statusCode is : ' + res.statusCode )
		}else {
			console.log(number + ' has error')
		}
		if (!err && res.statusCode == 200) {
			console.log(number + ' is work')
			index++
			loop()
		}else {
			index++
			loop()
		}
	}

	request(options,callback)
}

