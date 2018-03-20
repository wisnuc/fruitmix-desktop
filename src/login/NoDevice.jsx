import React from 'react'
import i18n from 'i18n'
import request from 'superagent'
import validator from 'validator'
import { IconButton, TextField } from 'material-ui'
import DoneIcon from 'material-ui/svg-icons/action/done'

class NoDevice extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      IP: '',
      errorText: ''
    }
    this.handleChange = (IP) => {
      this.setState({ IP, errorText: '' })
    }

    this.updateStore = () => {
      global.mdnsStore.push({
        address: this.state.IP,
        domain: 'manual',
        host: 'wisnuc-generic-1024.public',
        model: 'generic',
        name: 'wisnuc-generic-1024',
        serial: '1024'
      })
      console.log('global.mdnsStore', global.mdnsStore)
      this.props.refresh()
    }

    this.checkIP = () => {
      if (!validator.isIP(this.state.IP)) {
        this.setState({ errorText: i18n.__('ErrorText: Wrong IP') })
      } else {
        request.get(`${this.state.IP}:3000/boot`, (error, res) => {
          if (!error && res && res.body && res.body.state) {
            this.updateStore()
          } else {
            this.setState({ errorText: i18n.__('ErrorText: Connect Failed') })
          }
        })
      }
    }

    this.onKeyDown = (e) => {
      if (e.which === 13 && !this.state.errorText && !!this.state.IP) this.checkIP()
    }
  }
  render () {
    return (
      <div>
        <div style={{ height: 16 }} />
        <div style={{ fontSize: 16, marginBottom: 12 }}>
          { i18n.__('No Wisnuc Device') }
        </div>
        <div style={{ fontSize: 14, marginBottom: 12, color: 'rgba(0,0,0,0.54)' }}>
          { i18n.__('No Wisnuc Device Comment') }
        </div>
        <div style={{ height: 24 }} />
        <div> { i18n.__('No Wisnuc Device Text 1') }</div>
        <div style={{ height: 24 }} />
        <div> { i18n.__('No Wisnuc Device Text 2') }</div>
        <div style={{ height: 24 }} />
        <div> { i18n.__('No Wisnuc Device Text 3') }</div>
        <div style={{ height: 12 }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { i18n.__('No Wisnuc Device Text 4') }
          <TextField
            style={{ width: 120, marginLeft: 16, marginRight: 8 }}
            name="setIP"
            value={this.state.IP}
            errorText={this.state.errorText}
            onChange={e => this.handleChange(e.target.value)}
            onKeyDown={this.onKeyDown}
          />
          <IconButton
            onTouchTap={this.checkIP}
            disabled={!!this.state.errorText || !this.state.IP}
          >
            <DoneIcon color="#006064" />
          </IconButton>
        </div>
      </div>
    )
  }
}

export default NoDevice
