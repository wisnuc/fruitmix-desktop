import React, { Component, PureComponent } from 'react'

import Radium from 'radium'
import muiThemeable from 'material-ui/styles/muiThemeable'

/**

  icon, text,

  if selected, highlight; if disabled, light gray

  selected overrides disabled.

  onTouchTap

**/
@muiThemeable()
@Radium
class QuickNav extends PureComponent {

  render() {

    let { icon, text, selected, disabled } = this.props
    let Icon = icon
    let color = selected 
      ? this.props.muiTheme.palette.primary1Color
      : (disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.54)')

    return (
      <div 
        style={{
          width: '100%', 
          height: 72, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          ':hover': { 
            backgroundColor: '#EEEEEE' 
          },
          backgroundColor: selected ? '#F5F5F5' : '#FFF'
        }}

        onTouchTap={this.props.onTouchTap}
      >
        <div style={{height: 16}} />
        <div style={{height: 24}}><Icon style={{color}}/></div>
        <div style={{marginTop: 6, fontSize:10, lineHeight:'10px', color}}>{text}</div>
      </div>
    )
  }
}

export default QuickNav

