import React from 'react'
import i18n from 'i18n'
import { IconButton, CircularProgress, RaisedButton, TextField } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error-outline'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import FlatButton from '../common/FlatButton'
import Row from './Row'

class Preview extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <div
        style={{
          width: 780,
          height: 520,
          padding: '0px 24px 0px 24px',
          transition: 'all 225ms',
          overflow: 'hidden'
        }}
      >
        <div style={{ height: 56, display: 'flex', alignItems: 'center' }} >
          <div style={{ fontSize: 20 }}> { i18n.__('Shared Files') } </div>
          <div style={{ flexGrow: 1 }} />
          <IconButton
            onTouchTap={() => this.props.onRequestClose()}
            style={{ width: 40, height: 40, padding: 10, marginRight: -10 }}
            iconStyle={{ width: 20, height: 20, color: 'rgba(0,0,0,0.54)' }}
          >
            <CloseIcon />
          </IconButton>
        </div>

        <div style={{ height: 24 }} />

        {/* list of errors */}
        <div style={{ width: '100%', height: 374, overflowY: 'auto', border: 'solid #ccc 1px' }} >
          {
            this.props.list.map((f, i) => <Row {...f} name={f.filename} />)
          }
        </div>

        <div style={{ height: 12 }} />
        {/* confirm button */}
        <div style={{ height: 52, display: 'flex', alignItems: 'center', marginRight: -24 }}>
          <div style={{ flexGrow: 1 }} />
          <FlatButton
            primary
            label={i18n.__('OK')}
            onTouchTap={this.props.onRequestClose}
          />
        </div>
      </div>
    )
  }
}

export default Preview
