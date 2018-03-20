import React from 'react'
import { ipcRenderer } from 'electron'

class TransNav extends React.PureComponent {
  constructor () {
    super()
    this.state = {
      num: 0,
      hover: false,
      moving: false
    }

    this.updateTransmission = (e, userTasks) => {
      const num = Math.min(userTasks.length, 100)
      if (num > this.state.num) {
        clearTimeout(this.timer2)
        this.setState({ moving: true, num })
        clearTimeout(this.timer)
        this.timer = setTimeout(() => this.setState({ moving: false }), 2666)
      } else if (!num && this.state.num) {
        clearTimeout(this.timer2)
        this.timer2 = setTimeout(() => this.setState({ num: 0 }), 1000)
      } else if (num !== this.state.num) {
        clearTimeout(this.timer2)
        this.setState({ num })
      }
    }
  }

  componentDidMount () {
    ipcRenderer.on('UPDATE_TRANSMISSION', this.updateTransmission)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('UPDATE_TRANSMISSION', this.updateTransmission)
    clearTimeout(this.timer2)
    clearTimeout(this.timer)
  }

  render () {
    const { icon, text, selected, disabled } = this.props
    let { color } = this.props
    if (!selected) color = disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.54)'

    /*
    raw: './assets/images/transmission_raw.gif',
    hover: './assets/images/transmission_hover.gif',
    selected: './assets/images/transmission_selected.gif',
    selected_dark: './assets/images/transmission_selected_dark.gif',
    selected_hover: './assets/images/transmission_selected_hover.gif'
    */

    const path = selected && this.state.hover ? icon.gif.selected_hover
      : selected ? icon.gif.selected
        : this.state.hover ? icon.gif.hover
          : icon.gif.raw

    /* svg icon */
    const Icon = icon.icon

    const renderIcon = (<img src={path} style={{ width: 24, height: 24 }} alt="img" />)

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
        <div style={{ height: 24 }}>{ this.state.moving ? renderIcon : <Icon style={{ color }} /> }</div>
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, lineHeight: '12px', color }}>{text}</div>
        {/* render num */}
        {
          this.state.num < 100
            ? (
              <div
                style={{
                  position: 'absolute',
                  right: 14,
                  top: 14,
                  width: 14,
                  height: 14,
                  borderRadius: 9,
                  border: '2px #FFF solid',
                  backgroundColor: '#4CAF50',
                  fontSize: 10,
                  fontWeight: 500,
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: !this.state.num ? 0 : 1,
                  transition: 'all 225ms'
                }}
              >
                { this.state.num }
              </div>
            )
            : this.state.num > 99
              ? (
                <div
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: 14,
                    width: 24,
                    height: 14,
                    borderRadius: 9,
                    border: '2px #FFF solid',
                    backgroundColor: '#4CAF50',
                    fontSize: 10,
                    fontWeight: 500,
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  99+
                </div>
              )
              : <div />
        }
      </div>
    )
  }
}

export default TransNav
