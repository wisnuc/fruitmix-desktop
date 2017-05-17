import React, { PureComponent } from 'react'
import Debug from 'debug'
import { TextField, Checkbox, Divider } from 'material-ui'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:NewDriveDialog')

class NewDriveDialog extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      focusOnce: false,
      label: '',
      writelist: '',
      errorText: '',
      mode: ''
    }

    this.fire = () => {
      const apis = this.props.apis
      const args = {
        label: this.state.label,
        writelist: this.state.writelist
      }
      apis.request('adminCreateDrive', args, (err) => {
        if (!err) {
          this.props.onRequestClose()
          this.props.refreshDrives()
        }
      })
    }
  }

  updateLabel(value) {
    const drives = this.props.drives
    if (drives.findIndex(drive => drive.label === value) > -1) {
      this.setState({ label: value, errorText: '文件名已存在' })
    } else {
      this.setState({ label: value, errorText: '' })
    }
  }

  handleCheck(userUUID) {
    // debug('handleCheck', this.state)
    const index = this.state.writelist.indexOf(userUUID)
    if (index === -1) { this.setState({ writelist: [...this.state.writelist, userUUID] }) } else {
      this.setState({
        writelist: [
          ...this.state.writelist.slice(0, index),
          ...this.state.writelist.slice(index + 1)
        ]
      })
    }
  }

  render() {
    const users = this.props.users
    return (
      <div style={{ width: 336, padding: '24px 24px 0px 24px' }}>

        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>新建共享文件夹</div>
        <div style={{ height: 20 }} />
        <div
          style={{ height: 32,
            fontSize: 14,
            fontWeight: 500,
            color: 'rgba(0,0,0,0.54)',
            display: 'flex',
            alignItems: 'center' }}
        >名称</div>

        <div style={{ height: 60 }}>
          <TextField
            name="shareDiskName"
            fullWidth
            onChange={e => this.updateLabel(e.target.value)}
            value={this.state.label}
            errorText={this.state.errorText}
          />
        </div>

        <div
          style={{
            height: 32,
            fontSize: 14,
            fontWeight: 500,
            color: 'rgba(0,0,0,0.54)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          选择用户
        </div>
        <RadioButtonGroup
          name="usersToshare"
          onChange={(e, value) => {
            if (value === 'all') {
              this.setState({ mode: value, writelist: this.props.users.map(user => user.uuid) })
            } else {
              this.setState({ mode: value, writelist: '' })
            }
          }}
        >
          <RadioButton
            value="all"
            label="所有人"
            style={{ marginBottom: 16 }}
          />
          <RadioButton
            value="custom"
            label="自定义"
            style={{ marginBottom: 8 }}
          />
        </RadioButtonGroup>
        <div style={{ maxHeight: 40 * 8, overflow: 'auto', marginLeft: 42 }}>
          {
            users.map(user =>
              <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key={user.username} >
                <Checkbox
                  disabled={this.state.mode !== 'custom'}
                  label={user.username}
                  checked={this.state.writelist.includes(user.uuid)}
                  onCheck={() => this.handleCheck(user.uuid)}
                />
              </div>
            )
          }
          <div style={{ height: 8 }} />
        </div>

        <div style={{ height: 16 }} />

        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <FlatButton
            label="取消" primary={this.props.primary} secondary={this.props.accent}
            onTouchTap={this.props.onRequestClose}
          />
          <FlatButton
            label="创建" primary={this.props.primary} secondary={this.props.accent}
            disabled={this.state.label.length === 0 || this.state.errorText}
            onTouchTap={this.fire}
          />
        </div>
      </div>
    )
  }
}

export default NewDriveDialog
