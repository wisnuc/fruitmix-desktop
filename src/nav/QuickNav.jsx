import React, { Component, PureComponent } from 'react'

import Radium from 'radium'

/**

  icon, text,

  if selected, highlight; if disabled, light gray

  selected overrides disabled.

  onTouchTap

*/
@Radium
class QuickNav extends PureComponent {
  constructor() {
    super()
    this.state = { hover: false }
  }

  render() {
    const { icon, text, selected, disabled } = this.props
    let { color } = this.props
    const Icon = icon
    if (!selected) color = disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.54)' // TODO

    /*
    raw: './assets/images/transmission_raw.gif',
    hover: './assets/images/transmission_hover.gif',
    selected: './assets/images/transmission_selected.gif',
    selected_dark: './assets/images/transmission_selected_dark.gif',
    selected_hover: './assets/images/transmission_selected_hover.gif'
    */

    let path
    if (typeof Icon !== 'function') {
      path = selected && this.state.hover ? icon.gif.selected_hover :
        selected ? icon.gif.selected :
        this.state.hover ? icon.gif.hover :
        icon.gif.raw
    }

    /* when Icon is array, [icon path, color icon path, hover icon path] */
    const renderIcon = typeof Icon === 'function' ? (<Icon style={{ color }} />) :
      (<img src={path} style={{ width: 24, height: 24 }} alt="img" />)

    return (
      <div
        style={{
          position: 'relative',
          width: 72,
          height: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: this.state.hover ? '#EEEEEE' : ''
        }}
        onMouseMove={() => !this.state.hover && this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        onTouchTap={this.props.onTouchTap}
      >
        <div style={{ height: 16 }} />
        <div style={{ height: 24 }}>{ renderIcon }</div>
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, lineHeight: '12px', color }}>{text}</div>
      </div>
    )
  }
}

export default QuickNav
