import React from 'react'
import Debug from 'debug'
import ActionSettingsEthernet from 'material-ui/svg-icons/action/settings-ethernet'

const debug = Debug('component:control:ethernet')

class Ethernet extends React.Component {

  renderList(Icon, titles, values) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        {
          titles.map((title, index) => (
            <div style={{ height: 72, display: 'flex', alignItems: 'center', width: '100%' }} >
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
    if (!net) return <div />
    let NIC
    for (const name in net.os) {
      const ipv4 = net.os[name].find(addr => addr.internal === false && addr.family === 'IPv4')
      if (ipv4) NIC = name
    }
    const data = net.os[NIC].find(item => item.family === 'IPv4')

    const Icon = ActionSettingsEthernet

    const Titles = [
      '网卡名称',
      '地址类型',
      '网络地址',
      '子网掩码',
      'MAC地址'
    ]

    const Values = [
      NIC,
      data.family,
      data.address,
      data.netmask,
      data.mac.toUpperCase()
    ]

    // debug('this.props', this.props, NIC)
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{ height: 16 }} />
        { this.renderList(Icon, Titles, Values) }
      </div>
    )
  }
}

export default Ethernet
