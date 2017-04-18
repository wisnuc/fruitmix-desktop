import EventEmitter from 'events'
import Request from './Request'

class RequestManager extends EventEmitter {

  abort() {
    // TODO
  }

  setState(name, nextState) {

    let state = this.state
    this.state = Object.assign({}, state, { [name]: nextState })
    this.emit('updated', state, this.state)
  }

  setRequest(name, props, f, next) {

    if (this[name]) {
      this[name].abort()
      this[name].removeAllListeners()
    }

    this[name] = new Request(props, f)
    this[name].on('updated', (prev, curr) => {

      this.setState(name, curr)

      console.log(`${name} updated`, prev, curr, 
        this[name].isFinished(), typeof next === 'function')

      if (this[name].isFinished() && next) {
        this[name].isRejected() 
          ? next(this[name].reason())  
          : next(null, this[name].value())
      }
    })

    // emit 
    this.setState(name, this[name].state)
  }

  clearRequest(name) {

    if (this[name]) {
      this[name].abort()
      this[name].removeAllListeners()
      this[name] = null
      this.setState(name, null)
    }
  }
}

export default RequestManager

