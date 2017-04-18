const EventEmitter = require('eventemitter3')

class ReqState {

  constructor(ctx) { this.ctx = ctx }

  // fallback
  exit() {}

  setState(nextState, ...args) {
    this.exit()
    this.ctx.state = new nextState(this.ctx, ...args)
    this.ctx.emit('updated', this, this.ctx.state)
  }

  // abort is NOT a state transition, it is used as a destructor, where or when:
  // 1. some action should be cancelled
  // 2. some resource should be recycled as early as possible
  // 3. or merely blocking any further transition
  // NO FURTHER TRANSITION keeps UI stable!
  abort() { this.aborted = true }

  isPending() { return false }
  isFulfilled() { return false }
  isRejected() { return false }

  isFinished() { return !this.isPending() }
}

class ReqPending extends ReqState {

  constructor(ctx) {
    super(ctx)

    this.handle = this.ctx.func((err, res) => {
      if (this.aborted) return
      if (err)
        this.setState(ReqRejected, err)
      else
        this.setState(ReqFulfilled, res.body)
    })
  }

  isPending() { return true }
}

class ReqFulfilled extends ReqState {

  constructor(ctx, data) { super(ctx); this.data = data }
  isFulfilled() { return true } 
  value() { return this.data }
}

class ReqRejected extends ReqState {

  constructor(ctx, err) { super(ctx); this.err = err }
  isRejected() { return true }
  reason() { return this.err }
}

class Request extends EventEmitter {

  constructor(props, func) {
    super()
    if (typeof props === 'function') {
      this.func = props
    }
    else {
      Object.assign(this, props)
      this.func = func
    }

    this.state = new ReqPending(this)
  }

  abort() { this.state.abort() }

  isPending() { return this.state.isPending() }
  isFulfilled() { return this.state.isFulfilled() }
  value() { return this.state.value() }
  isRejected() { return this.state.isRejected() }
  reason() { return this.state.reason() }

  isFinished() { return this.state.isFinished() }
}

export default Request