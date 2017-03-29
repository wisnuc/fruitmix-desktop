const StateUp = base => class extends base {
  setSubPState(name, nextSubState) {
    const state = this.props.state
    const subState = state[name]
    const nextSubStateMerged = Object.assign(new subState.constructor(), subState, nextSubState)
    const nextState = { [name]: nextSubStateMerged }
    this.props.setState(nextState)
  }

  setSubPStateBound(name) {
    const obj = this.setSubPStateBoundObj || (this.setSubVStateBoundObj = {})
    return obj[name] ? obj[name] : (obj[name] = this.setSubPState.bind(this, name))
  }

  bindPState(name) {
    return {
      state: this.props.state[name],
      setState: this.setSubPStateBound(name)
    }
  }

  setSubVState(name, nextSubState) {
    const state = this.state
    const subState = state[name]
    const nextSubStateMerged = Object.assign(new subState.constructor(), subState, nextSubState)
    const nextState = { [name]: nextSubStateMerged }
    this.setState(nextState)
  }

  setSubVStateBound(name) {
    const obj = this.setSubVStateBoundObj || (this.setSubPStateBoundObj = {})
    return obj[name] ? obj[name] : (obj[name] = this.setSubVState.bind(this, name))
  }

  bindVState(name) {
    return {
      state: this.state[name],
      setState: this.setSubVStateBound(name)
    }
  }
}

export default StateUp
