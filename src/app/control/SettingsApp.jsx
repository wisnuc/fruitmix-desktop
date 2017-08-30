import React from 'react'
import Debug from 'debug'
import { CircularProgress, Divider, Toggle } from 'material-ui'
import InfoIcon from 'material-ui/svg-icons/action/info-outline'

const debug = Debug('component:control:SettingsApp:')

class SettingsApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false
    }

    this.toggle = (op) => {
      this.props.ipcRenderer.send('SETCONFIG', { [op]: !global.config.global[op] })
    }
  }

  renderRow({ type, enabled, func }) {
    return (
      <div style={{ height: 56, width: '100%', display: 'flex', alignItems: 'center', marginLeft: 24 }}>
        <div style={{ width: 40, display: 'flex', alignItems: 'center', marginRight: 8 }}>
          <InfoIcon color="rgba(0,0,0,0.54)" />
        </div>
        <div style={{ width: 480, display: 'flex', alignItems: 'center' }}>
          { type }
        </div>
        <Toggle
          toggled={enabled}
          onToggle={func}
        />
      </div>
    )
  }

  render() {
    debug('render client', this.props, global.config)
    if (!global.config) return <div />
    const { noCloseConfirm, enableSleep } = global.config.global
    const settings = [
      {
        type: '有传输任务时，阻止电脑进入休眠',
        enabled: !enableSleep,
        func: () => this.toggle('enableSleep')
      },
      {
        type: '客户端关闭提示',
        enabled: !noCloseConfirm,
        func: () => this.toggle('noCloseConfirm')
      }
    ]
    return (
      <div style={{ height: '100%', margin: 16 }}>
        <div style={{ fontSize: 20 }}>
          { '全局设置' }
        </div>
        <div style={{ height: 16 }} />
        { settings.map(op => this.renderRow(op)) }
      </div>
    )
  }
}

export default SettingsApp
