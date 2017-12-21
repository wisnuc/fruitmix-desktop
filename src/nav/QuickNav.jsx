import React from 'react'

/**

  icon, text,
  if selected, highlight; if disabled, light gray
  selected overrides disabled.
  onTouchTap

*/

class QuickNav extends React.PureComponent {
  constructor() {
    super()
    this.state = { hover: false }
  }

  render() {
    const { icon, text, selected, disabled } = this.props
    let { color } = this.props
    const Icon = icon
    if (!selected) color = disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.54)'

    return (
      <div
        style={{
          width: 72,
          height: 72,
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          flexDirection: 'column',
          backgroundColor: this.state.hover ? '#EEEEEE' : ''
        }}
        onTouchTap={this.props.onTouchTap}
        onMouseLeave={() => this.setState({ hover: false })}
        onMouseMove={() => !this.state.hover && this.setState({ hover: true })}
      >
        <div style={{ height: 16 }} />
        <div style={{ height: 24 }}> <Icon style={{ color }} /> </div>
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, lineHeight: '12px', color }}>{text}</div>
      </div>
    )
  }
}

export default QuickNav
