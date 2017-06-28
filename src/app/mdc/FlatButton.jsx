import React, { Component, PureComponent } from 'react'

import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable';
import { MDCRipple, MDCRippleFoundation } from '@material/ripple/dist/mdc.ripple'

function getMatchesProperty(HTMLElementPrototype) {
  return [
    'webkitMatchesSelector', 'msMatchesSelector', 'matches',
  ].filter((p) => p in HTMLElementPrototype).pop();
}

// const {ANIM_END_EVENT_NAME} = MDCCheckboxFoundation.strings

const MATCHES = getMatchesProperty(HTMLElement.prototype)


// why initializer ?
class MFlatButton extends PureComponent {

  constructor(props) {
    super(props)
  }

  state = {
    classes: new ImmutableSet(),
    rippleCss: new ImmutableMap(),
    checkedInternal: this.props.checked,
    disabledInternal: this.props.disabled,
    indeterminateInternal: this.props.indeterminate
  }

  rippleFoundation = new MDCRippleFoundation(Object.assign(MDCRipple.createAdapter(this), {

    isUnbounded: () => false,

    // isSurfaceActive: () => this.refs.root[MATCHES](':active'),
    isSurfaceActive: () => true,

    addClass: className => this.setState(prevState => ({
      classes: prevState.classes.add(className)
    })),

    removeClass: className => this.setState(prevState => ({
      classes: prevState.classes.remove(className)
    })),

    registerInteractionHandler: (evtType, handler) => 
      this.refs.root.addEventListener(evtType, handler),

    deregisterInteractionHandler: (evtType, handler) =>
      this.refs.root.removeEventListener(evtType, handler),

    updateCssVariable: (varName, value) => {
      console.log('updateCssVariable', varName, value)
      this.setState(prevState => ({
        rippleCss: prevState.rippleCss.set(varName, value)
      }))
    },

    computeBoundingRect: () => this.refs.root.getBoundingClientRect(),

  }))

  componentDidMount() {
    this.rippleFoundation.init()
  }

  componentWillUnmount() {
    this.rippleFoundation.destroy()
  }

  componentDidUpdate() {
    if (this.refs.root) this.state.rippleCss.forEach((v, k) => 
      this.refs.root.style.setProperty(k, v))
  }

  render() {

    let classes = this.state.classes.toJS().join(' ')

    console.log('FlatButton render, classes', classes)

    return (
      <div 
        ref='root'
        className={`mdc-button mdc-button--primary ${classes}`}
        disabled={false}
      >
        确定
      </div>
    )
  }
}

export default MFlatButton
