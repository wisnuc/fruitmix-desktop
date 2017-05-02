import React, { PureComponent } from 'react'

import { TextField, Checkbox, Divider } from 'material-ui'
import FlatButton from '../common/FlatButton'

class NewDriveDialog extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      focusOnce: false,
      label: '',
      writelist: []
    }
  }

  componentDidMount() {

    let apis = this.props.apis    
    apis.request('adminUsers')
    apis.request('adminDrives')
  }

  updateLabel(value) {
    this.setState({ label: value })
  }

  handleCheck(userUUID) {
    let index = this.state.writelist.indexOf(userUUID)
    if (index === -1)
      this.setState({ writelist: [...this.state.writelist, userUUID] })
    else 
      this.setState({
        writelist: [
          ...this.state.writelist.slice(0, index),
          ...this.state.writelist.slice(index + 1)
        ]
      })
  }

  fire() {
    let apis = this.props.apis
    let args = {
      label: this.state.label,
      writelist: this.state.writelist
    }
    apis.request('adminCreateDrive', args, err => {
      if (!err) this.props.onRequestClose()
    })
  }

  renderUser(user) {
    return (
      <div style={{width: '100%', height: 40, display: 'flex', alignItems: 'center'}}>
        <Checkbox 
          label={user.username} 
          checked={this.state.writelist.includes(user.uuid)}
          onCheck={() => this.handleCheck(user.uuid)} 
        />
      </div>
    )
  }

  render() {

    let users, drives, apis = this.props.apis

    if (apis.adminDrives.isFulfilled())
      drives = apis.adminDrives.value().drives

    if (apis.adminUsers.isFulfilled()) 
      users = apis.adminUsers.value().users

    return (
      <div style={{width: 336, padding: '24px 24px 0px 24px'}}>

        <div style={{fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)'}}>新建共享文件夹</div>
        <div style={{height: 20}} /> 
        <div style={{height: 32, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)',
          display: 'flex', alignItems: 'center'}}>名称</div>

        <TextField 
          fullWidth={true} 
          onChange={e => this.updateLabel(e.target.value)} 
          value={this.state.label}
        />

        <div style={{height: 8}} />
        <div style={{height: 32, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)',
          display: 'flex', alignItems: 'center'}}>选择用户</div>
        <div style={{maxHeight: 40 * 8, overflowY: 'scroll'}}>
          { users.map(user => this.renderUser(user)) }   
        </div>

        <div style={{height: 24}} />

        <div style={{height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
          <FlatButton label='取消' primary={this.props.primary} secondary={this.props.accent}
            onTouchTap={this.props.onRequestClose} />
          <FlatButton label='创建' primary={this.props.primary} secondary={this.props.accent}
            disabled={this.state.label.length === 0}
            onTouchTap={this.fire.bind(this)} />
        </div>
      </div>
    )
  }
}

export default NewDriveDialog

