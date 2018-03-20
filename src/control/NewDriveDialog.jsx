import React, { PureComponent } from 'react'
import i18n from 'i18n'
import { TextField, Checkbox, Divider } from 'material-ui'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'

class NewDriveDialog extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      focusOnce: true,
      label: '',
      writelist: '',
      errorText: ''
    }

    this.fire = () => {
      this.setState({ loading: true })
      const apis = this.props.apis
      const args = {
        label: this.state.label,
        writelist: this.state.writelist
      }
      apis.request('adminCreateDrive', args, (err) => {
        if (!err) {
          this.props.refreshDrives()
          this.props.onRequestClose()
          this.props.openSnackBar(i18n.__('Create Drive Success'))
        } else {
          this.setState({ loading: false })
          console.log('adminCreateDrive failed', err)
          this.props.openSnackBar(i18n.__('Create Drive Failed'))
        }
      })
    }
  }

  updateLabel (value) {
    const drives = this.props.drives
    const newValue = sanitize(value)
    if (drives.findIndex(drive => drive.label === value) > -1) {
      this.setState({ label: value, errorText: i18n.__('Drive Name Exist Error') })
    } else if (value !== newValue) {
      this.setState({ label: value, errorText: i18n.__('Drive Name Invalid Error') })
    } else {
      this.setState({ label: value, errorText: '' })
    }
  }

  togglecheckAll () {
    this.setState({ writelist: this.state.writelist === '*' ? [] : '*' })
  }

  handleCheck (userUUID) {
    const wl = this.state.writelist
    const index = wl.indexOf(userUUID)
    if (wl === '*') this.setState({ writelist: [userUUID] })
    else if (index === -1) this.setState({ writelist: [...wl, userUUID] })
    else this.setState({ writelist: [...wl.slice(0, index), ...wl.slice(index + 1)] })
  }

  render () {
    const users = this.props.users
    return (
      <div style={{ width: 336, padding: '24px 24px 0px 24px', zIndex: 2000 }}>

        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>{ i18n.__('Create New Public Drive') }</div>
        <div style={{ height: 20 }} />
        <div style={{ height: 32, fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)', display: 'flex', alignItems: 'center' }} >
          { i18n.__('Name') }
        </div>

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
          { i18n.__('People Shared') }
        </div>

        <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key="all" >
          <Checkbox
            label={i18n.__('All Users')}
            labelStyle={{ fontSize: 14 }}
            iconStyle={{ fill: this.state.writelist === '*' ? this.props.primaryColor : 'rgba(0, 0, 0, 0.54)' }}
            checked={this.state.writelist === '*'}
            onCheck={() => this.togglecheckAll()}
          />
        </div>
        <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
        <div style={{ maxHeight: 40 * 8, overflow: 'auto' }}>
          {
            users.map(user => (
              <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key={user.username} >
                <Checkbox
                  label={user.username}
                  iconStyle={{ fill: this.state.writelist === '*' || this.state.writelist.includes(user.uuid) ? this.props.primaryColor : 'rgba(0, 0, 0, 0.54)' }}
                  labelStyle={{ fontSize: 14 }}
                  checked={this.state.writelist === '*' || this.state.writelist.includes(user.uuid)}
                  onCheck={() => this.handleCheck(user.uuid)}
                />
              </div>
            ))
          }
          <div style={{ height: 8 }} />
        </div>

        {/* button */}
        <div style={{ height: 16 }} />
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton
            primary
            label={i18n.__('Cancel')}
            onTouchTap={this.props.onRequestClose}
          />
          <FlatButton
            primary
            label={i18n.__('Create')}
            disabled={this.state.label.length === 0 || !!this.state.errorText || this.state.loading}
            onTouchTap={this.fire}
          />
        </div>
      </div>
    )
  }
}

export default NewDriveDialog
