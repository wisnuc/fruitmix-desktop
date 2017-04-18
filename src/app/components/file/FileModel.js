import request from 'superagent'
import EventEmitter from 'eventemitter3'
import Request from './RequestSTM'



class FileModel extends EventEmitter {
	constructor(navContext, homeUUID) {
		console.log(window.store.getState(), 'in FileModel')
		super()
		this.navContext = navContext
		this.homeUUID = homeUUID
		this.file_nav = null
		this.state = {
			file_nav: null
		}
	}

	abort() {

	}

	setState(name, nextState) {
		let state = this.state
		this.state = Object.assgin({}, state, {[name]: nextState})
		this.emit()
	}

	setRequest(name, args, f, next) {
		if (this[name]) {
			this[name].abort()
			this[name].removeAllListeners()
		}

		this[name] = new Request(args, f)
		this[name].on('update', (prev, curr) => {
			this.setState(name, curr)
		})

		this.setState(name, this[name].state)
	}

	request(name, args, next) {
		switch(name) {
			case 'file_nav':
				r = request(``)
			break
		}
	}


}

export default FileModel