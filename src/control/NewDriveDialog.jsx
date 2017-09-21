import React, { PureComponent } from 'react'
import Debug from 'debug'
import { TextField, Checkbox, Divider } from 'material-ui'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:NewDriveDialog')

class NewDriveDialog extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      focusOnce: true,
      label: '',
      writelist: '',
      errorText: ''
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
          this.props.openSnackBar('创建成功')
        } else {
          debug('adminCreateDrive failed', err)
          // this.props.openSnackBar(`创建失败: ${err.message}`)
          this.props.openSnackBar(`创建失败`)
        }
      })
    }
  }

  updateLabel(value) {
    const drives = this.props.drives
    const newValue = sanitize(value)
    if (drives.findIndex(drive => drive.label === value) > -1) {
      this.setState({ label: value, errorText: '文件名已存在' })
    } else if (value !== newValue) {
      this.setState({ label: value, errorText: '文件名不合法' })
    } else {
      this.setState({ label: value, errorText: '' })
    }
  }

  togglecheckAll() {
    const users = this.props.users
    if (this.state.writelist.length === users.length) {
      this.setState({ writelist: [] })
    } else {
      const allUsers = users.map(user => user.uuid)
      this.setState({ writelist: allUsers })
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
      <div style={{ width: 336, padding: '24px 24px 0px 24px', zIndex: 2000 }}>

        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>新建共享盘</div>
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
            ref={(input) => {
              if (input && this.state.focusOnce) {
                input.focus()
                this.setState({ focusOnce: false })
              }
            }}
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

        <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key="all" >
          <Checkbox
            label="所有人"
            labelStyle={{ fontSize: 14 }}
            iconStyle={{ fill: this.state.writelist.length === users.length ? '#5E35B1' : 'rgba(0, 0, 0, 0.54)' }}
            checked={this.state.writelist.length === users.length}
            onCheck={() => this.togglecheckAll()}
          />
        </div>
        <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
        <div style={{ maxHeight: 40 * 8, overflow: 'auto' }}>
          {
            users.map(user =>
              <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key={user.username} >
                <Checkbox
                  label={user.username}
                  iconStyle={{ fill: this.state.writelist.includes(user.uuid) ? '#5E35B1' : 'rgba(0, 0, 0, 0.54)' }}
                  labelStyle={{ fontSize: 14 }}
                  checked={this.state.writelist.includes(user.uuid)}
                  onCheck={() => this.handleCheck(user.uuid)}
                />
              </div>
            )
          }
          <div style={{ height: 8 }} />
        </div>

        {/* button */}
        <div style={{ height: 16 }} />
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton
            label="取消" primary={this.props.primary} secondary={this.props.accent}
            onTouchTap={this.props.onRequestClose}
          />
          <FlatButton
            label="创建" primary={this.props.primary} secondary={this.props.accent}
            disabled={this.state.label.length === 0 || !!this.state.errorText}
            onTouchTap={this.fire}
          />
        </div>
      </div>
    )
  }
}

export default NewDriveDialog
