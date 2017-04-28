import React, { Component, PureComponent } from 'react'

import Radium from 'radium'

/**

  icon, text,

  if selected, highlight; if disabled, light gray

  selected overrides disabled.

  onTouchTap

**/
@Radium
class QuickNav extends PureComponent {

  render() {

    let { icon, text, color, selected, disabled } = this.props
    let Icon = icon
    if (!selected) color = disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.54)' // TODO

    return (
      <div 
        style={{
          position: 'relative', 
          width: 72, 
          height: 72, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          ':hover': { 
            backgroundColor: '#EEEEEE'
          },
        }}

        onTouchTap={this.props.onTouchTap}
      >
        <div style={{height: 16}} />
        <div style={{height: 24}}><Icon style={{color}}/></div>
        <div style={{marginTop: 6, fontSize:11, fontWeight: 700, lineHeight:'12px', color}}>{text}</div>
      </div>
    )
  }
}

export default QuickNav

