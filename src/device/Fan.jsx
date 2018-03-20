import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { Paper, FlatButton } from 'material-ui'
import HardwareKeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'

const debug = Debug('component:control:Fan')

class Fan extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      fanScale: '',
      fanSpeed: ''
    }

    this.setFanScale = (fanScale) => {
      this.props.request('setFanScale', { fanScale }, (err, res) => {
        if (!err) {
          debug('this.setFanScale res', res)
          this.props.openSnackBar(i18n.__('Adjust FanScale Success'))
          this.setState({ fanScale })
        } else {
          this.props.openSnackBar(i18n.__('Adjust FanScale Failed'))
        }
        this.props.refresh()
      })
    }

    this.increment = () => {
      if (typeof this.state.fanScale !== 'number') return

      let fanScale = this.state.fanScale
      fanScale += 5
      if (fanScale > 100) fanScale = 100

      this.setFanScale(fanScale)
    }

    this.decrement = () => {
      if (typeof this.state.fanScale !== 'number') return

      let fanScale = this.state.fanScale
      fanScale -= 5
      if (fanScale < 5) fanScale = 5

      this.setFanScale(fanScale)
    }
  }

  componentDidMount () {
    this.autoRefresh = setInterval(() => this.props.refresh(), 1000)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.fan && (nextProps.fan !== this.props.fan)) {
      this.setState({
        fanScale: nextProps.fan.fanScale,
        fanSpeed: nextProps.fan.fanSpeed
      })
    }
  }

  componentWillUnmount () {
    clearInterval(this.autoRefresh)
  }

  render () {
    // debug('fan, this.props', this.props, this.state)
    if (!this.props.fan) return <div />
    const { fanScale, fanSpeed } = this.props.fan
    const titleStyle = {
      width: 240,
      height: 48,
      fontSize: 16,
      color: 'rgba(0,0,0,0.87)',
      backgroundColor: '#FFF',
      opacity: 1,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 16
    }

    const footerStyle = {
      width: 240,
      height: 96,
      fontSize: 14,
      color: 'rgba(0,0,0,0.54)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div style={{ paddingLeft: 72, paddingTop: 48, display: 'flex' }}>
          <Paper style={{ padding: 0 }}>
            <div style={titleStyle}>{ i18n.__('Fan Scale') }</div>
            <div style={{ height: 48 }} />
            <div
              style={{
                width: 240,
                height: 144,
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <FlatButton
                primary
                onTouchTap={this.increment}
                icon={<HardwareKeyboardArrowUp />}
              />
              <div
                style={{
                  fontSize: 34,
                  margin: 8,
                  color: 'rgba(0,0,0,0.54)',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                { this.state.fanScale ? this.state.fanScale : fanScale }
              </div>
              <FlatButton
                primary
                onTouchTap={this.decrement}
                icon={<HardwareKeyboardArrowDown />}
              />
            </div>
            <div style={footerStyle}>
              <div> { i18n.__('Adjust Fan Scale Text') }</div>
            </div>
          </Paper>

          <Paper style={{ padding: 0, marginLeft: 24 }}>
            <div style={titleStyle}>{ i18n.__('Fan Speed') }</div>
            <div style={{ height: 48 }} />
            <div
              style={{ width: 240,
                height: 144,
                fontSize: 45,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              { this.state.fanSpeed ? this.state.fanSpeed : fanSpeed }
            </div>
            <div style={footerStyle}>{ i18n.__('Fan Speed Text') }</div>
          </Paper>
        </div>
      </div>
    )
  }
}

export default Fan
