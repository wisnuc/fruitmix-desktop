import React from 'react'
import i18n from 'i18n'
import { Paper, CircularProgress, LinearProgress, IconButton } from 'material-ui'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import WarningIcon from 'material-ui/svg-icons/alert/warning'
import FolderSvg from 'material-ui/svg-icons/file/folder'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'
import MultiSvg from 'material-ui/svg-icons/content/content-copy'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import ClearAllIcon from 'material-ui/svg-icons/communication/clear-all'
import UpIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import ErrorBox from '../common/ErrorBox'

class Notifications extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      settings: false
    }

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  renderNoNts() {
    return (
      <div
        style={{
          fontSize: 14,
          width: '100%',
          height: '100%',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0,0,0,0.38)'
        }}
      >
        { i18n.__('No Notifications') }
      </div>
    )
  }

  renderNts(nt, key) {
    return (
      <div
        style={{ height: 60, width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: 6 }}
        key={key}
      >
        somethings
      </div>
    )
  }

  render() {
    return (
      <div
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 200 }}
        onTouchTap={() => this.props.onRequestClose()}
      >
        <Paper
          style={{
            position: 'absolute',
            top: 72,
            right: this.props.showDetail ? 376 : 16,
            boxSizing: 'border-box',
            width: 376,
            height: 380,
            overflowY: 'hidden',
            backgroundColor: '#EEEEEE'
          }}
          onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          {/* render Headers */}
          <div style={{ height: 56, width: 376, display: 'flex', alignItems: 'center' }}>
            {/* settings */}
            <div style={{ width: 4 }} />
            <IconButton
              iconStyle={{ color: '#9E9E9E' }}
              onTouchTap={() => this.toggleDialog('settings')}
              tooltip={this.state.settings ? i18n.__('Back') : i18n.__('Settings')}
            >
              { this.state.settings ? <BackIcon /> : <SettingsIcon /> }
            </IconButton>
            <div style={{ flexGrow: 1 }} />

            {/* title */}
            <div style={{ fontSize: 21, fontWeight: 500, color: 'rgba(0,0,0,0.38)' }}>
              { i18n.__('Notifications') }
            </div>

            <div style={{ flexGrow: 1 }} />
            {/* clear notifications */}
            <div style={{ width: 48 }}>
              {
                !!this.props.nts.length &&
                <IconButton
                  iconStyle={{ color: '#9E9E9E' }}
                  onTouchTap={() => {}}
                  tooltip={i18n.__('Clear All Notifications')}
                >
                  <ClearAllIcon />
                </IconButton>
              }
            </div>
            <div style={{ width: 4 }} />
          </div>
          {/* render Content */}
          <div style={{ height: 298 }}>
            { this.props.nts.length ? this.renderNts() : this.renderNoNts() }
          </div>
          {/* render Tails (filter) */}
          <div style={{ height: 80, backgroundColor: '#F3F3F3' }}>
            <div style={{ height: 26, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UpIcon style={{ color: 'rgba(0,0,0,0.38)' }} />
            </div>
          </div>
        </Paper>
      </div>
    )
  }
}

export default Notifications
