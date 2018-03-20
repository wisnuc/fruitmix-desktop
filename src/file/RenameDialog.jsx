import React from 'react'
import i18n from 'i18n'
import { TextField } from 'material-ui'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'

class RenameDialog extends React.PureComponent {
  constructor (props) {
    super(props)

    this.value = this.props.entries[this.props.select.selected[0]].name

    this.state = {
      value: this.value,
      errorText: undefined
    }

    this.handleChange = (e) => {
      const value = e.target.value
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
      const { apis, path, entries, select } = this.props
      const curr = path[path.length - 1]
      const args = {
        driveUUID: path[0].uuid,
        dirUUID: curr.uuid,
        entryUUID: entries[select.selected[0]].uuid,
        newName: this.state.value,
        oldName: entries[select.selected[0]].name
      }
      apis.request('renameDirOrFile', args, (err) => {
        if (err) {
          this.setState({ errorText: i18n.__('Rename Failed') })
        } else {
          this.props.onRequestClose(true)
          this.props.openSnackBar(i18n.__('Rename Success'))
          this.props.refresh()
        }
      })
    }

    this.onKeyDown = (e) => {
      if (e.which === 13 && !this.state.errorText && this.state.value.length !== 0 && this.state.value !== this.value) this.fire()
    }
  }

  render () {
    const disabled = !!this.state.errorText || this.state.value.length === 0 || this.state.value === this.value
    return (
      <div style={{ width: 280, padding: '24px 24px 0px 24px' }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
          { this.props.title ? this.props.title : i18n.__('Rename Title') }
        </div>
        <div style={{ height: 20 }} />
        <div style={{ height: 60 }}>
          <TextField
            fullWidth
            name="rename"
            value={this.state.value}
            errorText={this.state.errorText}
            onChange={this.handleChange}
            ref={(tf) => { // forcus on TextField and autoselect file name without extension
              if (tf && tf.input && !this.notFirst) {
                const input = tf.input
                input.focus()
                const end = input.value.lastIndexOf('.')
                input.selectionStart = 0
                input.selectionEnd = end > -1 ? end : input.value.length
                this.notFirst = true
              }
            }}
            onKeyDown={this.onKeyDown}
          />
        </div>
        <div style={{ height: 24 }} />
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton label={i18n.__('Cancel')} primary onTouchTap={this.props.onRequestClose} />
          <FlatButton label={i18n.__('Confirm')} primary disabled={disabled} onTouchTap={this.fire} />
        </div>
      </div>
    )
  }
}

export default RenameDialog
