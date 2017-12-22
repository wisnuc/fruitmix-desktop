import React from 'react'
import i18n from 'i18n'
import { TextField } from 'material-ui'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'

class NewFolderDialog extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
      errorText: '',
      loading: false
    }

    this.handleChange = (value) => {
      const newValue = sanitize(value)
      const entries = this.props.entries
      if (entries.findIndex(entry => entry.name === value) > -1) {
        this.setState({ value, errorText: i18n.__('Name Exist Error') })
      } else if (value !== newValue) {
        this.setState({ value, errorText: i18n.__('Name Invalid Error') })
      } else {
        this.setState({ value, errorText: '' })
      }
    }

    this.fire = () => {
      this.setState({ loading: true })
      const { apis, path } = this.props
      const curr = path[path.length - 1]
      const args = {
        driveUUID: path[0].uuid,
        dirUUID: curr.uuid,
        dirname: this.state.value
      }
      apis.request('mkdir', args, (err) => {
        if (err) {
          console.log('mkdir error', err.code)
          this.setState({ errorText: i18n.__('Mkdir Failed'), loading: false })
        } else {
          this.props.onRequestClose(true)
          this.props.openSnackBar(i18n.__('Mkdir Success'))
          this.props.refresh({ fileName: this.state.value })
        }
      })
    }

    this.onKeyDown = (e) => {
      if (e.which === 13 && !this.state.errorText && this.state.value.length !== 0) this.fire()
    }
  }

  render() {
    return (
      <div style={{ width: 280, padding: '24px 24px 0px 24px' }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
          { this.props.title ? this.props.title : i18n.__('Create New Folder') }
        </div>
        <div style={{ height: 20 }} />
        <div style={{ height: 60 }}>
          <TextField
            fullWidth
            hintText={this.props.hintText ? this.props.hintText : i18n.__('Mkdir Hint')}
            errorText={this.state.errorText}
            onChange={e => this.handleChange(e.target.value)}
            ref={input => input && input.focus()}
            onKeyDown={this.onKeyDown}
            disabled={this.state.loading}
          />
        </div>
        <div style={{ height: 24 }} />
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton label={i18n.__('Cancel')} primary onTouchTap={this.props.onRequestClose} />
          <FlatButton
            label={i18n.__('Confirm')}
            primary
            onTouchTap={this.fire}
            disabled={this.state.value.length === 0 || !!this.state.errorText || this.state.loading}
          />
        </div>
      </div>
    )
  }
}

export default NewFolderDialog
