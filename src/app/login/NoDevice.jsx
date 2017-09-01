import React from 'react'
import request from 'superagent'
import validator from 'validator'
import { FlatButton, CircularProgress, Divider, IconButton, TextField } from 'material-ui'
import DoneIcon from 'material-ui/svg-icons/action/done'

class NoDevice extends React.Component {
  constructor(props) {
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
        this.setState({ errorText: '请输入正确的IP' })
      } else {
        request.get(`${this.state.IP}:3000/boot`, (error, res) => {
          if (!error && res && res.body && res.body.state) {
            this.updateStore()
          } else {
            this.setState({ errorText: '连接失败' })
          }
        })
      }
    }

    this.onKeyDown = (e) => {
      if (e.which === 13 && !this.state.errorText && !!this.state.IP) this.checkIP()
    }
  }
  render() {
    return (
      <div>
        <div style={{ height: 16 }} />
        <div style={{ fontSize: 16, marginBottom: 12 }}>
          未发现WISNUC OS设备
        </div>
        <div style={{ fontSize: 14, marginBottom: 12, color: 'rgba(0,0,0,0.54)' }}>
          局域网登录仅支持同一网段的WISNUC设备登录
        </div>
        <div style={{ height: 24 }} />
        <div> 1. 请确保WISNUC设备电源开启并已连接网络 </div>
        <div style={{ height: 24 }} />
        <div> 2. 请尝试微信扫码登录 </div>
        <div style={{ height: 24 }} />
        <div> 3. 请刷新再次搜索 </div>
        <div style={{ height: 12 }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { '4. 手动输入设备IP:' }
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
