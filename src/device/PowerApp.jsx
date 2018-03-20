import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { CircularProgress, Divider } from 'material-ui'
import { ipcRenderer } from 'electron'
import PowerSetting from 'material-ui/svg-icons/action/power-settings-new'
import Build from 'material-ui/svg-icons/action/build'
import FlatButton from '../common/FlatButton'
import Checkmark from '../common/Checkmark'
import DialogOverlay from '../common/DialogOverlay'

const debug = Debug('component:control:power:')

class Power extends React.Component {
  constructor (props) {
    super(props)
    this.address = this.props.selectedDevice.mdev.address
    this.host = this.props.selectedDevice.mdev.host

    /*
     * operation: '', 'confirm', 'progress', done'
     * choice: '', 'POWEROFF', 'REBOOT', 'REBOOTMAINTENANCE'
     */
    this.state = {
      operation: '', // '', progress, done
      choice: ''
    }

    this.boot = (op) => {
      debug('this.boot', op)
      this.props.selectedDevice.request('power', op, (err) => {
        if (!err) {
          this.scanMdns()
          this.setState({ operation: 'progress' })
        } else {
          this.props.openSnackBar(i18n.__('Operation Failed'))
          this.setState({ operation: '' })
        }
      })
    }

    this.handleOpen = (CHOICE) => {
      setTimeout(() =>
        this.setState({
          choice: CHOICE,
          operation: 'confirm'
        }), 10)
    }

    this.handleClose = () => {
      this.setState({
        operation: ''
      })
    }

    this.handleStartProgress = (operation) => {
      ipcRenderer.send('LOGOUT')
      setImmediate(() => this.boot(operation))
    }

    this.handleEndProgress = () => {
      this.setState({
        operation: ''
      })
      if (this.state.choice === 'POWEROFF') {
        ipcRenderer.send('POWEROFF')
      } else {
        this.props.nav('login')
      }
    }

    this.handleExit = () => {
      clearInterval(this.interval)
      this.setState({ operation: '' })
      this.props.nav('login')
    }

    this.scanMdns = () => {
      let hasBeenShutDown = false
      this.interval = setInterval(() => {
        global.mdns.scan()
        setTimeout(() => {
          const store = [...global.mdns.store]
          debug('this.scanMdns', store)
          switch (this.state.choice) {
            case 'POWEROFF':
              if (store.every(d => d.host !== this.host)) {
                clearInterval(this.interval)
                this.setState({ operation: 'done' })
              }
              break
            case 'REBOOT':
            case 'REBOOTMAINTENANCE':
              if (hasBeenShutDown) {
                if (store.find(d => d.host === this.host) ||
                store.find(d => d.address === this.address)) {
                  clearInterval(this.interval)
                  debug('reboot success')
                  this.setState({ operation: 'done' })
                }
              } else if (store.every(d => d.host !== this.host)) {
                hasBeenShutDown = true
              }
              break
            default:
              break
          }
        }, 500)
      }, 1000)
    }
  }

  renderActions () {
    let operation = null
    switch (this.state.choice) {
      case 'POWEROFF':
        operation = { state: 'poweroff' }
        break
      case 'REBOOT':
        operation = { state: 'reboot' }
        break
      case 'REBOOTMAINTENANCE':
        operation = { state: 'reboot', mode: 'maintenance' }
        break
      default:
        break
    }

    return (
      <div>
        <FlatButton label={i18n.__('Cancel')} primary onTouchTap={this.handleClose} />
        <FlatButton label={i18n.__('Confirm')} primary onTouchTap={() => this.handleStartProgress(operation)} />
      </div>
    )
  }

  renderDiaContent () {
    /* confirm dialog */
    if (this.state.operation === 'confirm') {
      return (
        <div>
          {/* title */}
          <div style={{ fontSize: 16, color: 'rgba(0,0,0,0.54)' }}>
            {
              this.state.choice === 'POWEROFF'
                ? i18n.__('Confirm Shut Down Text') : this.state.choice === 'REBOOT'
                  ? i18n.__('Confirm Reboot Text') : i18n.__('Confirm Reboot to Maintenance Text')
            }
          </div>
          <div style={{ height: 24 }} />
          {/* button */}
          <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
            { this.renderActions() }
          </div>
        </div>
      )
    }

    /* progress dialog */
    if (this.state.operation === 'progress') {
      let hintText = ''
      switch (this.state.choice) {
        case 'POWEROFF':
          hintText = i18n.__('Shutting Down')
          break
        case 'REBOOT':
          hintText = i18n.__('Rebooting')
          break
        case 'REBOOTMAINTENANCE':
          hintText = i18n.__('Rebooting To Maintenance')
          break
        default:
          break
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <CircularProgress style={{ marginTop: 48, marginLeft: 148 }} />
          <div style={{ textAlign: 'center', marginTop: 24 }}>{hintText} </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <FlatButton label={i18n.__('Exit')} primary onTouchTap={this.handleExit} />
          </div>
        </div>
      )
    }

    /* done dialog */
    if (this.state.operation === 'done') {
      debug('renderDiaContent this.state.operation === done')
      let hintText = ''
      let linkText = ''
      switch (this.state.choice) {
        case 'POWEROFF':
          hintText = i18n.__('Shut Down Finish Hint')
          linkText = i18n.__('Shut Down Finish Link')
          break
        case 'REBOOT':
          hintText = i18n.__('Reboot Finish Hint')
          linkText = i18n.__('Reboot Finish Link')
          break
        case 'REBOOTMAINTENANCE':
          hintText = i18n.__('Reboot To Maintenance Finish Hint')
          linkText = i18n.__('Reboot To Maintenance Finish Link')
          break
        default:
          break
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginTop: 48, marginLeft: 120 }}>
            <Checkmark delay={300} color={this.props.primaryColor} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            {hintText}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <FlatButton label={linkText} primary onTouchTap={this.handleEndProgress} />
          </div>
        </div>
      )
    }

    return (<div />)
  }

  render () {
    // debug('power', this.props)
    return (
      <div style={{ paddingLeft: 24, paddingTop: 32 }}>
        {/* poweroff and reboot */}
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ flex: '0 0 56px', height: 36 }} >
            <div style={{ height: 8 }} />
            <PowerSetting color={this.props.primaryColor} />
          </div>
          <div style={{ flex: '0 0 560px', fontSize: 20, color: 'rgba(0, 0, 0, 0.87)' }}>
            { i18n.__('Power Settings Title') }
          </div>
        </div>
        <div style={{ height: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ flex: '0 0 56px' }} />
          <div style={{ flex: '0 0 560px' }}>
            <FlatButton
              label={i18n.__('Shut Down')}
              primary
              style={{ marginLeft: i18n.getLocale() === 'zh-CN' ? -16 : -8 }}
              onTouchTap={() => this.handleOpen('POWEROFF')}
            />
            <FlatButton
              label={i18n.__('Reboot')}
              primary
              style={{ marginLeft: 0 }}
              onTouchTap={() => this.handleOpen('REBOOT')}
            />
          </div>
        </div>

        {/* divider */}
        <div style={{ height: 16 }} />
        <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
        <div style={{ height: 32 }} />

        {/* enter maintenance */}
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ flex: '0 0 56px', height: 36 }} >
            <div style={{ height: 8 }} />
            <Build color={this.props.primaryColor} />
          </div>
          <div style={{ flex: '0 0 560px', fontSize: 20, color: 'rgba(0, 0, 0, 0.87)' }}>
            { i18n.__('Maintenance Title') }
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ flex: '0 0 56px' }} />
          <div style={{ flex: '0 0 800px' }}>
            <div style={{ fontSize: 14, lineHeight: '26px', color: 'rgba(0, 0, 0, 0.87)' }}>
              { i18n.__('Maintenance Text')}
            </div>
            <div style={{ height: 16 }} />
            <FlatButton
              label={i18n.__('Reboot To Maintenance')}
              primary
              style={{ marginLeft: -8 }}
              onTouchTap={() => this.handleOpen('REBOOTMAINTENANCE')}
            />
          </div>
        </div>

        <DialogOverlay open={!!this.state.operation} >
          {
            !!this.state.operation &&
              <div style={{ width: 336, height: this.state.operation === 'confirm' ? '' : 240, padding: '24px 24px 0px 24px' }}>
                { this.renderDiaContent()}
              </div>
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default Power
