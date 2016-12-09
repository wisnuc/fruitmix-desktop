import request from 'superagent'

import React from 'react'



const NetFace = (props) => {

  const renderLine = (key, value) => (
    <div style={{height: 40, color: 'rgba(0, 0, 0, 0.87)', fontSize: 14, 
      display: 'flex', alignItems: 'center'}}>
      <div style={{flex: '0 0 160px'}}>{key}</div>
      <div>{value}</div>
    </div>
  )

  return (
    <div style={props.style}>
      <div style={{
        fontSize: 24,
        fontWeight: 400,
        color: props.themeColor || 'grey',
        marginTop: 32,
        marginBottom: 32
      }}>
        {props.data.name}
      </div>
      { renderLine('地址类型', props.data.family) }
      { renderLine('网络地址', props.data.address) }
      { renderLine('子网掩码', props.data.netmask) }
      { renderLine('MAC地址', props.data.mac.toUpperCase()) }
    </div>
  )
}

class Ethernet extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {

    if (!this.props.address) return

    request.get(`http://${this.props.address}:3000/system/net`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) return
        this.setState(Object.assign({}, this.state, { data: res.body }))
      })
  }

  extract(itfs) {

    let arr = []
    for (let name in itfs) {
      let ipv4 = itfs[name].find(addr => addr.internal === false && addr.family === 'IPv4')
      if (ipv4) arr.push(Object.assign(ipv4, { name }))
    } 
    return arr
  }

  render() {
    if (!this.state.data) return <div />
    return (
      <div style={this.props.style}>
        { this.extract(this.state.data.os).map(itf => 
            <NetFace data={itf} themeColor={this.props.themeColor}/>) }
      </div>
    )
  } 
}

export default Ethernet
