import UUID from 'node-uuid'

class Job { 

  constructor(key, op, callback) {
    this.id = UUID.v4()
    this.key = key
    this.cmd = op.cmd
    this.args = op.args
    this.timeout = op.timeout || 5000 // default timeout 5 seconds
    this.callback = callback
    this.timestamp = new Date().getTime()
  }
  
  abort() {
    if (this.callback) {
      let err = new Error('aborted')
      err.code = 'EABORT'
      this.callback(err)
    }
  }

  isTimeout() {
    return new Date().getTime() - this.timestamp > this.timeout 
  }

  fireTimeout() {
    if (this.callback) {
      let err = new Error('timeout')
      err.code = 'ETIMEOUT'
      setImmediate(() => this.callback(err))
    }
  } 
}

export default (key, op, callback) => new Job(key, op, callback)