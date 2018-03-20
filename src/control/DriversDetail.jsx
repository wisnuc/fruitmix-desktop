import React, { PureComponent } from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import sanitize from 'sanitize-filename'
import { TextField, Checkbox, Divider } from 'material-ui'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:NewDriveDialog')

class DrivesDetail extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      label: this.props.detailDrive.label,
      writelist: this.props.detailDrive.writelist,
      errorText: '',
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
      console.log('this.fire', args, this.props.detailDrive.uuid)
      apis.request('adminUpdateDrive', args, (err) => {
        if (!err) {
          this.currentLabel = this.state.label ? this.state.label : this.props.detailDrive.label
          this.setState({ changed: false })
          this.props.refreshDrives({ uuid: this.props.detailDrive.uuid, noloading: true })
          this.props.openSnackBar(i18n.__('Modify Drive Success'))
        } else {
          debug('adminUpdateDrive error', err)
          this.props.openSnackBar(i18n.__('Modify Drive Failed'))
        }
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.detailDrive.uuid !== this.props.detailDrive.uuid) {
      this.currentLabel = nextProps.detailDrive.label
      this.setState({
        label: nextProps.detailDrive.label,
        modify: false,
        changed: false,
        writelist: nextProps.detailDrive.writelist
      })
    }
  }

  updateLabel (value) {
    const { drives, detailDrive } = this.props
    const newValue = sanitize(value)
    if ((drives.findIndex(drive => (drive.label === value)) > -1) && (value !== detailDrive.label)) {
      // debug('updateLabel', this.props)
      this.setState({ label: value, errorText: i18n.__('Drive Name Exist Error') })
    } else if (value !== newValue) {
      this.setState({ label: value, errorText: i18n.__('Drive Name Invalid Error') })
    } else {
      this.setState({ label: value, errorText: '' })
    }
  }

  togglecheckAll () {
    this.setState({ writelist: this.state.writelist === '*' ? [] : '*', changed: true })
  }

  handleCheck (userUUID) {
    const index = this.state.writelist.indexOf(userUUID)
    if (index === -1) {
      this.setState({ changed: true, writelist: [...this.state.writelist, userUUID].filter(u => u !== '*') })
    } else {
      this.setState({
        changed: true,
        writelist: [
          ...this.state.writelist.slice(0, index),
          ...this.state.writelist.slice(index + 1)
        ]
      })
    }
  }

  render () {
    const { users, detailDrive, primaryColor } = this.props
    // console.log('detailDrive', this.props)
    if (!users || !detailDrive) return <div style={{ height: 128, backgroundColor: primaryColor, filter: 'brightness(0.9)' }} />

    const showDivider = !this.state.modify && this.state.titleHover && detailDrive.tag !== 'built-in'
    return (
      <div style={{ height: '100%' }}>
        <div style={{ height: 128, backgroundColor: primaryColor, filter: 'brightness(0.9)' }}>
          <div style={{ height: 64 }} />
          {/* header */}
          <div
            style={{
              height: 64,
              marginLeft: 24,
              marginRight: 24
            }}
            onMouseMove={() => this.setState({ titleHover: true })}
            onMouseLeave={() => this.setState({ titleHover: false })}
          >
            <div style={{ height: 16 }} />
            {
              this.state.modify && (detailDrive.tag !== 'built-in')
                ? (
                  <div style={{ marginTop: -8 }}>
                    <TextField
                      name="shareDiskName"
                      fullWidth
                      onChange={e => this.updateLabel(e.target.value)}
                      value={this.state.modify ? this.state.label : detailDrive.label}
                      errorText={this.state.errorText}
                      onBlur={() => this.setState({ modify: false, changed: true })}
                      ref={(input) => { if (input && this.state.modify) { input.focus() } }}
                      inputStyle={{ fontSize: 20, fontWeight: 500, color: '#FFFFFF' }}
                      underlineFocusStyle={{ borderColor: '#FFFFFF' }}
                      underlineStyle={{ borderColor: primaryColor }}
                      errorStyle={{ marginTop: 16 }}
                    />
                  </div>
                )
                : (
                  <div
                    style={{
                      width: 312,
                      height: 32,
                      fontSize: 20,
                      fontWeight: 500,
                      marginTop: 2,
                      color: '#FFFFFF',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                    onTouchTap={() => this.setState({ modify: true })}
                  >
                    { this.state.label ? this.state.label : this.currentLabel }
                    {/* <ModeEdit color="FAFAFA" style={{ marginLeft: 24 }} /> */}
                  </div>
                )
            }
            {
              <Divider
                color="rgba(0, 0, 0, 0.87)"
                style={{ opacity: showDivider ? 1 : 0, width: 312, marginTop: -2 }}
              />
            }
          </div>
        </div>

        {/* content */}
        <div style={{ width: 312, height: 'calc(100% - 152px)', padding: 24 }}>
          {/* users */}
          <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)', marginTop: -2 }}>
            { i18n.__('People Shared') }
          </div>
          <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key="all" >
            <Checkbox
              label={i18n.__('All Users')}
              labelStyle={{ fontSize: 14 }}
              iconStyle={{ fill: this.state.writelist === '*' ? '#5E35B1' : 'rgba(0, 0, 0, 0.54)' }}
              checked={this.state.writelist === '*'}
              onCheck={() => this.togglecheckAll()}
              disabled={detailDrive.tag === 'built-in'}
            />
          </div>
          <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
          <div style={{ overflowY: 'auto', height: 'calc(100% - 126px)', width: 336 }}>
            {
              users.map(user => (
                <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key={user.username} >
                  <Checkbox
                    label={user.username}
                    labelStyle={{ fontSize: 14 }}
                    iconStyle={{ fill: (this.state.writelist === '*' ||
                      this.state.writelist.includes(user.uuid)) ? '#5E35B1' : 'rgba(0, 0, 0, 0.54)' }}
                    checked={this.state.writelist === '*' || this.state.writelist.includes(user.uuid)}
                    onCheck={() => this.handleCheck(user.uuid)}
                    disabled={detailDrive.tag === 'built-in'}
                  />
                </div>
              ))
            }
            <div style={{ height: 8 }} />
          </div>

          <div style={{ height: 16 }} />
          {/* button */}
          <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
          <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
            <FlatButton
              label={i18n.__('Apply')}
              primary
              disabled={!this.state.changed || !!this.state.errorText || this.state.modify || detailDrive.tag === 'built-in'}
              onTouchTap={this.fire}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default DrivesDetail
