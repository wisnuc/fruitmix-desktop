var event = require('events').EventEmitter
class A extends event {
	construct(file) {
		this.file = file
	}

	start() {
		console.log('a')
		this.emit('aaa','b')
	}
}

var a = new A('f')
a.on('aaa',(data)=>{
	console.log(data)
})
a.start()
