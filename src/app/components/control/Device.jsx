import Debug from 'debug'

const debug = Debug('view:control:device')

import React from 'react'
import request from 'superagent'
import { header1Style, header2Style, header2StyleNotFirst, contentStyle } from './styles'

class Device extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      err: null,
      data: null
    }
  }

  componentDidMount() {

    request
      .get(`http://${this.props.address}:3000/system/device`)
      .set('Accept', 'application/json')
      .end((err, res) => {

        debug('request', err || !res.ok || res.body)

        if (err) {
          this.setState(Object.assign({}, this.state, { err, data: null }))
        }
        else if (!res.ok) {
          this.setState(Object.assign({}, this.state, { err: new Error('response not ok'), data: null }))
        }
        else 
          this.setState(Object.assign({}, this.state, { err: null, data: res.body }))
      })
  }

  renderWS215i(ws215i) {
    return [
      <div style={Object.assign({}, header1Style, { color: this.props.themeColor })}>硬件</div>,
      <div style={header2Style}>闻上家用私有云</div>,
      <div style={contentStyle}>型号: WS215i</div>, 
      <div style={contentStyle}>硬件序列号: {ws215i.serial}</div>,
      <div style={contentStyle}>MAC地址: {ws215i.mac.toUpperCase()}</div>
    ]
  }

  renderDmiDecode(dmidecode) {
    return []
  }

  renderCpuInfo(cpuInfo) {
    return [
      <div style={header2StyleNotFirst}>CPU</div>,
      <div style={contentStyle}>CPU核心数: {cpuInfo.length}</div>,
      <div style={contentStyle}>CPU类型: {cpuInfo[0].modelName}</div>,
      <div style={contentStyle}>Cache: {cpuInfo[0].cacheSize}</div>
    ]
  }

  renderMemInfo(memInfo) {
    return [
      <div style={header2StyleNotFirst}>内存</div>,
      <div style={contentStyle}>总内存: {memInfo.memTotal}</div>,
      <div style={contentStyle}>未使用内存: {memInfo.memFree}</div>,
      <div style={contentStyle}>可用内存: {memInfo.memAvailable}</div>
    ]
  } 

  renderRelease(release, commit) {
    let rel = [
      <div style={Object.assign({}, header1Style, { color: this.props.themeColor })}>软件</div>
    ]
    
    if (!release)
      rel.push(<div style={contentStyle}>未能获得软件版本信息，您可能在使用开发版本软件。</div>)
    else {
      rel.push(<div style={contentStyle}>版本: {release.tag_name + (release.prerelease ? ' beta' : '')}</div>)
      rel.push(<div style={contentStyle}>版本类型: {release.prerelease ? '测试版' : '正式版'}</div>)
      rel.push(<div style={contentStyle}>发布时间: {new Date(release.published_at).toLocaleDateString('zh-CN')}</div>)
      rel.push(<div style={contentStyle}>源码版本: {commit ? commit.slice(0,12) : '未知'}</div>)
    }

    return rel
  }

  render() {

    let children = []

    if (this.state.data) {

      let { cpuInfo, memInfo, ws215i, dmidecode, release, commit } = this.state.data

      debug('release commit', release, commit)

      if (ws215i)
        children = children.concat(this.renderWS215i(ws215i))
      if (dmidecode)
        children = children.concat(this.renderDmiDecode(dmidecode))

      children = children.concat(this.renderCpuInfo(cpuInfo))
      children = children.concat(this.renderMemInfo(memInfo))

      if (release)
        children = children.concat(this.renderRelease(release, commit))
      
      children.push(<div style={{height:30}} />)
    }

    return (
      <div style={this.props.style}>
        <div style={{paddingLeft: 72}}>
          { children }
        </div>
      </div>
    ) 
  }
}

export default Device
