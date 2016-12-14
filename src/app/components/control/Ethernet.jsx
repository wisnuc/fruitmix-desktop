import Debug from 'debug'

const debug = Debug('view:control:ethernet')

import request from 'superagent'
import validator from 'validator'

import React from 'react'
import { TextField, FlatButton, IconButton, Paper } from 'material-ui'
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import NavigationClose from 'material-ui/svg-icons/navigation/close'

import { header1Style } from './styles'

class NetFace extends React.Component {

  constructor(props) {

    super(props)

    this.state = {
      editing: false,
      alias: props.data.alias || '',
      busy: false
    }

    this.renderLine = (key, value) => (
      <div style={{height: 40, color: 'rgba(0, 0, 0, 0.87)', fontSize: 14, 
        display: 'flex', alignItems: 'center'}}>
        <div style={{flex: '0 0 160px'}}>{key}</div>
        <div>{value}</div>
      </div>
    )

    this.validateAlias = () => {
      if (this.state && this.state.alias && typeof this.state.alias === 'string' && validator.isIP(this.state.alias, 4))
        return true
      return false
    }

    this.aliasRequest = () => {

      this.setState(Object.assign({}, this.state, { busy: true }))

      let url = `http://${this.props.address}:${this.props.systemPort}/system/ipaliasing`
      let body = {
        mac: this.props.data.mac,
        ipv4: this.state.alias
      }

      request
        .post(url)
        .set('Accept', 'application/json')
        .send(body)
        .end((err, res) => {

          debug('alias request', url, body, err || !res.ok || res.body)

          if (err || !res.ok) {

            if (!err) {
              err = new Error('bad response')
              err.code = 'EBADRESPONSE'
            }

            this.setState(Object.assign({}, this.state, { err, busy: false }))
            return
          }

          // FIXME snackbar message
          this.props.refresh()
          setTimeout(() => {

            debug('final timeout')            
            this.setState((state, props) => ({ editing: false, alias: props.data.alias || '', busy: false}))
          }, 1000)
        })
    }

    this.deleteAlias = () => {

      let url = `http://${this.props.address}:${this.props.systemPort}/system/ipaliasing`
      let body = {
        mac: this.props.data.mac,
        ipv4: this.props.data.alias
      }
     
      request
        .del(url)
        .set('Accept', 'application/json')
        .send(body)
        .end((err, res) => {

          debug('alias delete', url, body, err || !res.ok || res.body)

          if (err || !res.ok) {
            // FIXME
            return
          }

          this.props.refresh() 
        })
    }
  }

  render() {

    debug('render', this.state)

    return (
      <div style={this.props.style}>
        <div style={Object.assign({}, header1Style, { color: this.props.themeColor || 'grey'})}>
          {this.props.data.name}
        </div>
        { this.renderLine('地址类型', this.props.data.family) }
        { this.renderLine('网络地址', this.props.data.address) }
        <div style={{height: 40, color: 'rgba(0, 0, 0, 0.87)', fontSize: 14, display: 'flex', alignItems: 'center'}}>
          <div style={{flex: '0 0 160px'}}>固定地址</div>
          <div style={{height: '100%', width:'100%', position: 'relative'}}>
            <div style={{height: '100%', display: 'flex', alignItems: 'center'}}>

              { !this.props.data.alias && 
                <div style={{color:'rgba(0,0,0,0.38)'}}
                  onTouchTap={() => this.setState(Object.assign({}, this.state, { editing: true, alias: '', busy: false }))}
                >点我设置</div> }

              { this.props.data.alias && <div>{this.props.data.alias}</div>}

              { this.props.data.alias &&
              <IconButton 
                style={{width: 32, height: 32, padding:7, marginLeft: 24}}
                iconStyle={{width: 18, height: 18, opacity:0.54}} 
                onTouchTap={() => this.setState(Object.assign({}, this.state, { editing: true }))}
              >
                <EditorModeEdit />
              </IconButton> }

              { this.props.data.alias &&
              <IconButton
                style={{width: 32, height: 32, padding:7}}
                iconStyle={{width: 18, height: 18, opacity:0.54}}
                onTouchTap={this.deleteAlias}
              >
                <NavigationClose />
              </IconButton> }
            </div>
            { this.state.editing &&
            <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999}} 
              onTouchTap={() => this.setState(Object.assign({}, this.state, { editing: false }))}
            /> }
            { this.state.editing &&
              <Paper style={{position: 'absolute', top: 0,  width:280, backgroundColor: '#FFF', zIndex: 1000 }} zDepth={2}>
                <div style={{marginTop: 24, marginLeft: 24, marginBottom: 20, fontSize: 20, color: 'rgba(0,0,0,0.87)'}}>设置固定IP地址</div>
                <TextField style={{marginLeft: 24, marginRight: 24, width: 232}} fullWidth={true} 
                  disabled={this.state.busy}
                  defaultValue={this.state.alias}
                  ref={input => input && input.focus()}
                  onChange={e => this.setState(Object.assign({}, this.state, { alias: e.target.value }))}
                />
                <div style={{height:52, marginTop:24, display:'flex', alignItems:'center', justifyContent:'flex-end'}}>
                  <FlatButton style={{marginRight: 8}} primary={true} disabled={this.state.busy} label='取消' 
                    onTouchTap={() => {
                      this.setState(Object.assign({}, this.state, {
                        editing: false,
                        aliasing: this.props.data.alias || '',
                        busy: false
                      }))
                    }}
                  />
                  <FlatButton style={{marginRight: 8}} primary={true} disabled={!this.validateAlias() || this.state.busy} label='确定' 
                    onTouchTap={this.aliasRequest}
                  />
                </div>
            </Paper> }
          </div>
        </div>
        { this.renderLine('子网掩码', this.props.data.netmask) }
        { this.renderLine('MAC地址', this.props.data.mac.toUpperCase()) }
      </div>
    )
  }
}

class Ethernet extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}

    this.refresh = () => {
      request.get(`http://${this.props.address}:3000/system/net`)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err || !res.ok) return
          this.setState(Object.assign({}, this.state, { data: res.body }))
        })
    }
  }

  componentDidMount() {

    if (!this.props.address) return
    this.refresh()
  }

  extract(itfs) {

    let arr = []
    for (let name in itfs) {
      let ipv4 = itfs[name].find(addr => addr.internal === false && addr.family === 'IPv4')
      if (ipv4) arr.push(Object.assign(ipv4, { name }))
    } 

    debug('interfaces extracted', arr)

    let reduced = arr.reduce((acc, curr, index, array) => {

      if (curr.name.endsWith(':app')) return acc

      let alias = array.find(item => item.name === curr.name + ':app')
      if (!alias) 
        acc.push(curr)
      else 
        acc.push(Object.assign({}, curr, { alias: alias.address }))

      return acc
    }, [])

    debug('interfaces reduced', reduced)
    return reduced
  }

  render() {
    if (!this.state.data) return <div />
    return (
      <div style={this.props.style}>
        <div style={{paddingLeft: 72}}>
        { this.extract(this.state.data.os).map(itf => 
            <NetFace data={itf} 
              themeColor={this.props.themeColor} 
              address={this.props.address} 
              systemPort={this.props.systemPort} 
              refresh={this.refresh}
            />
        )}
        </div>
      </div>
    )
  } 
}

export default Ethernet
