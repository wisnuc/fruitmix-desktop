import React, { PureComponent } from 'react'
import Debug from 'debug'
import { TextField, Checkbox, Divider } from 'material-ui'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:NewDriveDialog')

class DrivesDetail extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      label: '',
      writelist: this.props.detailDrive.writelist,
      errorText: '',
      message: '',
      modify: false,
      changed: false
    }

    this.currentLabel = this.props.detailDrive.label

    this.fire = () => {
      const apis = this.props.apis
      const args = {
        uuid: this.props.detailDrive.uuid,
        label: this.state.label ? this.state.label : undefined,
        writelist: this.state.writelist
      }
      apis.request('adminUpdateDrive', args, (err) => {
        if (!err) {
          this.currentLabel = this.state.label
          this.setState({ changed: false })
          this.props.refreshDrives()
          this.setState({ message: '修改成功' })
        } else {
          debug('err!!!!!!!!!!!!!!', err)
          this.setState({ message: `修改失败 ${err.message}` })
        }
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.detailDrive.uuid !== this.props.detailDrive.uuid) {
      this.currentLabel = nextProps.detailDrive.label
      this.setState({
        label: '',
        modify: false,
        changed: false,
        writelist: nextProps.detailDrive.writelist
      })
    }
  }

  updateLabel(value) {
    const { drives, detailDrive } = this.props
    if ((drives.findIndex(drive => (drive.label === value)) > -1) && (value !== detailDrive.label)) {
      // debug('updateLabel', this.props)
      this.setState({ label: value, errorText: '文件名已存在' })
    } else {
      this.setState({ label: value, errorText: '' })
    }
  }

  togglecheckAll() {
  
  }

  handleCheck(userUUID) {
    const index = this.state.writelist.indexOf(userUUID)
    if (index === -1) {
      this.setState({ changed: true, message: '', writelist: [...this.state.writelist, userUUID] })
    } else {
      this.setState({
        changed: true,
        message: '',
        writelist: [
          ...this.state.writelist.slice(0, index),
          ...this.state.writelist.slice(index + 1)
        ]
      })
    }
  }

  render() {
    const { users, detailDrive, primaryColor, toggleDetail, primary } = this.props
    if (!users || !detailDrive) return <div />
    return (
      <div>
        <div style={{ height: 128, backgroundColor: '#5E35B1' }}>
          <div style={{ height: 64 }} />

          {/* header */}
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              fontSize: 20,
              fontWeight: 500,
              marginLeft: 24,
              color: '#FAFAFA'
            }}
          >
            { this.currentLabel }
          </div>
        </div>

        {/* error message this.state.message */}

        {/* content */}
        <div style={{ width: 352, padding: '24px 24px 0px 24px' }}>
          {/* label */}
          <div
            style={{
              height: 32,
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(0,0,0,0.54)',
              display: 'flex',
              alignItems: 'center'
            }}
          >名称</div>
          <div style={{ height: 60 }} >
            {
              this.state.modify ?
                <TextField
                  name="shareDiskName"
                  fullWidth
                  onChange={e => this.updateLabel(e.target.value)}
                  value={(this.state.label || this.state.modify) ? this.state.label : detailDrive.label}
                  errorText={this.state.errorText}
                  onBlur={() => this.setState({ modify: false, changed: true })}
                  ref={(input) => { if (input && this.state.modify) { input.focus() } }}
                /> :
                <div
                  style={{ display: 'flex', alignItems: 'center', height: 48 }}
                  onTouchTap={() => this.setState({ modify: true, message: '' })}
                >
                  { this.state.label ? this.state.label : this.currentLabel }
                  <ModeEdit color={primaryColor} style={{ marginLeft: 8 }} />
                </div>
            }
          </div>

          {/* users */}
          <div
            style={{
              height: 32,
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(0,0,0,0.54)',
              display: 'flex',
              alignItems: 'center'
            }}
          > 共享用户 </div>
          <div style={{ maxHeight: 40 * 8, overflow: 'auto' }}>
            <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key="all" >
              <Checkbox
                label="所有人"
                checked={this.state.checkAll}
                onCheck={this.togglecheckAll}
              />
            </div>
            {
              users.map(user =>
                <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key={user.username} >
                  <Checkbox
                    label={user.username}
                    checked={this.state.writelist.includes(user.uuid)}
                    onCheck={() => this.handleCheck(user.uuid)}
                  />
                </div>
              )
            }
            <div style={{ height: 8 }} />
          </div>

          {/* button */}
          <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <FlatButton
              label="返回" primary={primary}
              onTouchTap={toggleDetail}
            />
            <FlatButton
              label="应用" primary={primary}
              disabled={(!this.state.changed && this.state.label.length === 0) || this.state.errorText || this.state.modify}
              onTouchTap={this.fire}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default DrivesDetail
