import Debug from 'debug'
const debug = Debug('lib:command')

class CommandTask {
	constructor(evt, id, op, hander) {
		this.evt = evt
		this.id = id
		this.cmd = op.cmd
		this.args = op.args
		this.hander = hander
	}

	isIDExist() {
		if (!this.id) {
			this.commandWithNoCallback()		
		}else {
			this.commandWithCallback()
		}
	}

	commandWithNoCallback() {
		if (this.hander) {
			this.hander(this.args, (err, data) => {
				debug('command no reply', op, err, data)
			})
		}
	}

	commandWithCallback() {
		let _this = this
		if (!this.hander) return this.evt.sender.send('command', { 
			id: this.id,
			err: {
				code: 'ENOCOMMAND',
				message: `command ${this.cmd} not found`
			},
		})
		this.hander(this.args, (err, data) => {
			if (err) {
				console.log(err)
				_this.evt.sender.send('command', {
					id:_this.id,
					err: {
						code: 'ENOCOMMAND',
						message: `command ${_this.cmd} not found`
					},
				})
			}
			else {
				_this.evt.sender.send('command', {id:_this.id,data:data})
			}
		})
	}
}

export default (evt, id, op, commandMap) => {
	let hander = commandMap.get(op.cmd)
	if (!hander && !id) return undefined
	let task = new CommandTask(evt, id, op, hander)
	return task
}