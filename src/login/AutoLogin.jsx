import React from 'react'
import i18n from 'i18n'
import { CircularProgress } from 'material-ui'

import FlatButton from '../common/FlatButton'
import { sharpCurve } from '../common/motion'

class AutoLogin extends React.Component {
  constructor (props) {
    super(props)
    this.state = { open: false }
  }

  render () {
    const { user } = this.props.device
    return (
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: this.state.open ? 468 : 66, // 216 + 32 + 36 + 132 + 52
          backgroundColor: '#FFF',
          paddingLeft: 24,
          paddingRight: 24,
          overflow: 'hidden',
          transition: sharpCurve('height')
        }}
      >
        <div style={{ height: 24, fontSize: 13, color: 'rgba(0,0,0,0.38)', marginBottom: 8 }} > { i18n.__('User Login') } </div>
        <div style={{ height: 36, fontSize: 24, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }} >
          {user.username}
        </div>
        <div style={{ width: '100%', height: 132, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={48} thickness={3} />
        </div>
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton
            label={i18n.__('Cancel')}
            primary
            onTouchTap={this.cancel}
          />
        </div>
      </div>
    )
  }
}

export default AutoLogin
