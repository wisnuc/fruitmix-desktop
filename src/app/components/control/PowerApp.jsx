import React from 'react'
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

  constructor(props) {
    super(props)
    this.address = this.props.selectedDevice.mdev.address
    this.serial = this.props.selectedDevice.mdev.serial

    /*
     * operation: '', 'confirm', 'progress', done'
     * choice: '', 'POWEROFF', 'REBOOT', 'REBOOTMAINTENANCE'
     */
    this.state = {
      operation: '',
      choice: '',
    }

    this.boot = (op) => {
      this.props.selectedDevice.request('power', { op }, (err) => {
        if (!err) {
          this.scanMdns()
          this.setState({
            operation: 'progress'
          })
        } else {
          this.props.openSnackBar(`操作失败：${err.message}`)
          this.setState({
            operation: ''
          })
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
      ipcRenderer.send('LOGIN_OFF')
      setTimeout(() => this.boot(operation), 100)
    }

    this.handleEndProgress = () => {
      this.setState({
        operation: ''
      })
      switch (this.state.choice) {
        case 'POWEROFF':
      // go to login page
          this.props.nav('login')
          break
        case 'REBOOT':
      // go to login page & select target device
          this.props.nav('login')
          break
        case 'REBOOTMAINTENANCE':
      // go to login page & select target device
          this.props.nav('maintenance')
          break
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
          switch (this.state.choice) {
            case 'POWEROFF':
              if (global.mdns.devices.every(d => d.serial !== this.serial)) {
                clearInterval(this.interval)
                this.setState({ operation: 'done' })
              }
              break
            case 'REBOOT':
            case 'REBOOTMAINTENANCE':
              if (hasBeenShutDown) {
                if (global.mdns.devices.find(d => d.serial === this.serial)
                || global.mdns.devices.find(d => d.address === this.address)) {
                  clearInterval(this.interval)
                  this.setState({ operation: 'done' })
                }
              } else if (global.mdns.devices.every(d => d.serial !== this.serial)) {
                hasBeenShutDown = true
              }
              break
          }
        }, 500)
      }, 1000)
    }
  }

  renderActions() {
    let operation = ''
    switch (this.state.choice) {
      case 'POWEROFF':
        operation = 'poweroff'
        break
      case 'REBOOT':
        operation = 'reboot'
        break
      case 'REBOOTMAINTENANCE':
        operation = 'rebootMaintenance'
        break
    }

    return (
      <div>
        <FlatButton label="取消" primary onTouchTap={this.handleClose} />
        <FlatButton
          label="确定"
          primary
          onTouchTap={() => this.handleStartProgress(operation)}
        />
      </div>
    )
  }

  renderDiaContent() {
    if (this.state.operation === 'done') {
      let hintText = ''
      let linkText = ''
      switch (this.state.choice) {
        case 'POWEROFF':
          hintText = '设备已关机，去'
          linkText = '登陆'
          break
        case 'REBOOT':
          hintText = '设备已重启完毕，去'
          linkText = '登陆'
          break
        case 'REBOOTMAINTENANCE':
          hintText = '设备已重启至维护模式，去'
          linkText = '维护页面'
          break
      }

      return (
        <div style={{ dispaly: 'flex', flexDirection: 'column' }}>
          <div style={{ marginTop: 48, marginLeft: 136 }}>
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
    let hintText = ''
    switch (this.state.choice) {
      case 'POWEROFF':
        hintText = '设备正在关机...'
        break
      case 'REBOOT':
        hintText = '设备正在重启...'
        break
      case 'REBOOTMAINTENANCE':
        hintText = '设备正在重启至维护模式 ...'
        break
    }
    return (
      <div style={{ dispaly: 'flex', flexDirection: 'column' }}>
        <CircularProgress style={{ marginTop: 48, marginLeft: 160 }} />
        <div style={{ textAlign: 'center', marginTop: 24 }}>{hintText} </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <FlatButton label="退出" primary onTouchTap={this.handleExit} />
        </div>
      </div>
    )
  }

  render() {
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
              重启和关机
            </div>
        </div>
        <div style={{ height: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ flex: '0 0 56px' }} />
          <div style={{ flex: '0 0 560px' }}>
            <FlatButton
              label="关机" primary style={{ marginLeft: -16 }}
              onTouchTap={() => this.handleOpen('POWEROFF')}
            />
            <FlatButton
              label="重启" primary style={{ marginLeft: 0 }}
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
              进入维护模式
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }} >
          <div style={{ flex: '0 0 56px' }} />
          <div style={{ flex: '0 0 560px' }}>
            <div style={{ fontSize: 14, lineHeight: '26px', color: 'rgba(0, 0, 0, 0.87)' }}>
              重启后进入维护模式，可以在维护模式下执行磁盘操作或系统维护任务。
            </div>
            <div style={{ height: 16 }} />
            <FlatButton
              label="重启进入维护模式" primary style={{ marginLeft: -8 }}
              onTouchTap={(e) => {
                this.handleOpen('REBOOTMAINTENANCE')
              }}
            />
          </div>
        </div>

        {/* confirm dialog */}
        <DialogOverlay open={this.state.operation === 'confirm'}>
          {
            this.state.operation === 'confirm' &&
            <div style={{ width: 336, padding: '24px 24px 0px 24px' }}>
              {/* title */}
              <div style={{ fontSize: 16, color: 'rgba(0,0,0,0.54)' }}>
                {
                  this.state.choice === 'POWEROFF' ?
                  '确定关机？' : this.state.choice === 'REBOOT' ?
                  '确定重启？' : '确定重启并进入维护模式？'
                }
              </div>
              <div style={{ height: 24 }} />
              {/* button */}
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                { this.renderActions() }
              </div>
            </div>
          }
        </DialogOverlay>

        {/* progress dialog */}
        <DialogOverlay open={this.state.operation === 'progress'} >
          {
            this.state.operation === 'progress' &&
              <div
                style={{
                  position: 'absolute',
                  width: 360,
                  height: 240,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'white'
                }}
              >
                { this.renderDiaContent()}
              </div>
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default Power
