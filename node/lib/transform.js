const EventEmitter = require('events')
const debug = require('debug')('transform')

class Transform extends EventEmitter {
  constructor (options) {
    if (Array.isArray(options)) {
      debug('get array')
      return options.reduce((pipe, opts) => (pipe
        ? pipe.pipe(new Transform(opts))
        : new Transform(opts)), null).root()
    }
    super()

    this.concurrency = 1024
    Object.assign(this, options)
    this.pending = []
    this.working = []
    this.finished = []
    this.failed = []

    this.ins = []
    this.outs = []
  }

  unshift (x) {
    this.pending.unshift(x)
    this.schedule()
  }

  push (x) {
    // debug('push', x)
    this.pending.push(x)
    this.schedule()
  }

  pull () {
    const xs = this.finished
    this.finished = []
    this.schedule()
    return xs
  }

  // for inputs, isBlocked means I won't process new jobs.
  isBlocked () {
    return !!this.failed.length || // blocked by failed
      !!this.finished.length || // blocked by output buffer (lazy)
      this.outs.some(t => t.isBlocked()) // blocked by outputs transform
  }

  isStopped () {
    return !this.working.length && this.outs.every(t => t.isStopped())
  }

  isSelfStopped () {
    return !this.working.length
  }

  isFinished () {
    return !this.pending.length &&
      !this.working.length &&
      !this.finished.length &&
      !this.failed.length
  }

  root () {
    return this.ins.length === 0 ? this : this.ins[0].root()
  }

  pipe (next) {
    this.outs.push(next)
    next.ins.push(this)
    return next
  }

  print () {
    debug(
      this.name,
      this.pending.map(x => x.name || x),
      this.working.map(x => x.name || x),
      this.finished.map(x => x.name || x),
      this.failed.map(x => x.name || x),
      this.isStopped()
    )
    this.outs.forEach(t => t.print())
  }

  clear () {
    this.pending.length = 0
    this.working.length = 0
    this.finished.length = 0
    this.failed.length = 0
    this.outs.forEach(t => t.clear())
  }

  schedule () {
    if (this.isBlocked()) return

    this.pending = this.ins.reduce((acc, t) => [...acc, ...t.pull()], this.pending)

    while (this.working.length < this.concurrency && this.pending.length) {
      const x = this.pending.shift()
      this.working.push(x)

      if (this.transform) {
        this.transform(x, (err, y) => {
          const index = this.working.indexOf(x)
          const curr = index > -1 ? this.working.splice(index, 1) : null
          if (!curr) return
          if (err) {
            if (Array.isArray(x)) x.forEach(c => (c.error = err))
            else x.error = err
            this.failed.push(x)
            console.log(
              'error in: ', this.name, '\nentry: ', x.entry || (x[0] && x[0].entry) || x,
              '\nerror: ', Object.assign({}, err, { response: '' }), '\nresponse: ', err.response
            )
          } else if (this.outs.length) {
            this.outs.forEach(t => t.push(y))
          } else if (this.root().listenerCount('data')) {
            this.root().emit('data', y)
          } else {
            this.finished.push(y)
          }

          this.schedule()
          this.root().emit('step', this.name, x.name)
        })
      } else if (this.spawn) {
        const t = new Transform(this.spawn)

        t.on('data', (data) => {
          if (this.outs.length) {
            this.outs.forEach(out => out.push(data))
          } else if (this.root().listenerCount('data')) {
            this.root().emit('data', data)
          } else {
            this.finished.push(data)
          }
        })

        t.on('step', () => {
          t.print()
          if (t.isStopped()) {
            this.working.splice(this.working.indexOf(x), 1)
            if (t.isFinished()) {
              // drop
            } else {
              this.failed.push(x)
            }
            this.schedule()
          }
          this.root().emit('step')
        })

        t.push(x)
        x.transform = t
      }
    }
  }
}

module.exports = Transform
