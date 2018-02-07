import React from 'react'
import i18n from 'i18n'
import { TextField } from 'material-ui'
import FlatButton from '../common/FlatButton'

class NewName extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
      errorText: '',
      loading: false
    }

    this.handleChange = (value) => {
      this.setState({ value, errorText: '' })
    }

    this.fire = () => {
      this.setState({ loading: true })
      const { apis, onRequestClose, openSnackBar, refresh, boxUUID, stationId } = this.props
      const args = { name: this.state.value, boxUUID, stationId }
      apis.pureRequest('boxName', args, (err) => {
        if (err) {
          console.log('Change Group Name Error', err)
          this.setState({ errorText: i18n.__('Change Group Name Failed'), loading: false })
        } else {
          onRequestClose()
          openSnackBar(i18n.__('Change Group Name Success'))
          refresh()
        }
      })
    }

    this.onKeyDown = (e) => {
      if (e.which === 13 && !this.state.errorText && this.state.value.length !== 0) this.fire()
    }
  }

  render() {
    return (
      <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
          { i18n.__('Change Group Name') }
        </div>
        <div style={{ height: 20 }} />
        <div style={{ height: 60 }}>
          <TextField
            fullWidth
            hintText={i18n.__('Change Group Name Hint')}
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
            label={i18n.__('Change')}
            primary
            onTouchTap={this.fire}
            disabled={this.state.value.length === 0 || !!this.state.errorText || this.state.loading}
          />
        </div>
      </div>
    )
  }
}

export default NewName
