import React from 'react'
import Debug from 'debug'
import validator from 'validator'
import { TextField } from 'material-ui'
import ActionSettingsEthernet from 'material-ui/svg-icons/action/settings-ethernet'
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:ethernet')

class Ethernet extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      alias: '',
      focusFirst: true
    }
    this.setIp = () => {
      this.setState({ open: true })
    }
    this.onCloseDialog = () => {
      this.setState({ open: false })
    }

    this.validateAlias = () => {
      if (this.state && this.state.alias && typeof this.state.alias === 'string' && validator.isIP(this.state.alias, 4)) {
        return true
      }
      return false
    }

    this.aliasRequest = () => {
      debug('this.aliasRequest', this.state, this.props)
      this.setState({ open: false })
    }
  }

  renderList(Icon, titles, values) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        {
          titles.map((title, index) => (
            <div style={{ height: 72, display: 'flex', alignItems: 'center', width: '100%' }} key={title}>
              <div style={{ flex: '0 0 24px' }} />
              <div style={{ flex: '0 0 56px' }} >
                { !index && <Icon color={this.props.primaryColor} /> }
              </div>
              <div>
                <div style={{ fontSize: 16, flex: '0 0 240px', color: 'rgba(0, 0, 0, 0.87)' }}> { values[index] }</div>
                <div style={{ fontSize: 14, flex: '0 0 240px', color: 'rgba(0, 0, 0, 0.54)' }}> { title } </div>
              </div>
              <div style={{ flexGrow: 1 }} />
            </div>
          ))
        }
      </div>
    )
  }

  render() {
    const net = this.props.net
    if (!net) return (<div />)

    const NIC = net.find(card => card.ipAddresses && card.ipAddresses.length > 0)
    const ipv4 = NIC.ipAddresses.find(addr => addr.internal === false && addr.family === 'IPv4')

    const getAddress = () => (
      <div>
        {/*
        <div onTouchTap={this.setIp}>
          {data.address}
          <ModeEdit color={this.props.primaryColor} style={{ marginLeft: 8 }} viewBox="0 0 36 12" />
        </div>
        */}
      </div>
    )

    const Icon = ActionSettingsEthernet

    const Titles = [
      '网卡名称',
      '带宽',
      '地址类型',
      '网络地址',
      '子网掩码',
      'MAC地址'
    ]

    const Values = [
      NIC.name,
      `${NIC.speed} M`,
      ipv4.family,
      ipv4.address,
      ipv4.netmask,
      ipv4.mac.toUpperCase()
    ]

    // debug('this.props', this.props, NIC)
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{ height: 16 }} />
        { this.renderList(Icon, Titles, Values) }

        {/* dialog */}
        <DialogOverlay open={this.state.open}>
          {
            this.state.open &&
            <div style={{ width: 336, padding: '24px 24px 0px 24px' }}>
              {/* title */}
              <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                { '设置固定IP' }
              </div>
              <div style={{ height: 56 }} />
              <div style={{ height: 56, display: 'flex', marginBottom: 10, position: 'relative' }}>
                <TextField
                  fullWidth
                  hintText={data.address}
                  onChange={e => this.setState({ alias: e.target.value })}
                  ref={(input) => {
                    if (input && this.state.focusFirst) {
                      input.focus()
                      this.setState({ focusFirst: false })
                    }
                  }}
                />
              </div>

              {/* button */}
              <div style={{ height: 24 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label="取消" onTouchTap={this.onCloseDialog} primary />
                <FlatButton label="确认" disabled={!this.validateAlias()} onTouchTap={this.aliasRequest} primary />
              </div>
            </div>
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default Ethernet
