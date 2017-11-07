import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { CircularProgress, Divider, Toggle, RaisedButton } from 'material-ui'
import InfoIcon from 'material-ui/svg-icons/action/info-outline'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:SettingsApp:')

class SettingsApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      cacheSize: -1
    }

    this.toggle = (op) => {
      this.props.ipcRenderer.send('SETCONFIG', { [op]: !global.config.global[op] })
    }

    this.cleanCache = () => {
      this.setState({ loading: true })
      this.props.ipcRenderer.send('CleanCache')
    }

    this.getCacheSize = (event, result) => {
      console.log('this.getCacheSize', result)
      this.setState({ cacheSize: prettysize(result.size) })
    }

    this.getCleanCacheResult = (event, error) => {
      console.log('CleanCacheResult error', error)
      this.setState({ loading: false })
      this.props.ipcRenderer.send('GetCacheSize')
      if (!error) this.props.openSnackBar('清理成功')
      else this.props.openSnackBar('清理失败')
    }
  }

  componentDidMount() {
    this.props.ipcRenderer.send('GetCacheSize')
    this.props.ipcRenderer.on('CacheSize', this.getCacheSize)
    this.props.ipcRenderer.on('CleanCacheResult', this.getCleanCacheResult)
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
          style={{ width: 480 }}
          toggled={enabled}
          onToggle={func}
        />
      </div>
    )
  }

  renderCacheClean() {
    return (
      <div style={{ height: 56, width: '100%', display: 'flex', alignItems: 'center', marginLeft: 24 }}>
        <div style={{ width: 40, display: 'flex', alignItems: 'center', marginRight: 8 }}>
          <InfoIcon color="rgba(0,0,0,0.54)" />
        </div>
        <div style={{ width: 480, display: 'flex', alignItems: 'center' }}>
          缓存大小
          <div style={{ width: 8 }} />
          {
            this.state.cacheSize === -1 ? <CircularProgress size={16} thickness={1.5} />
              : <div style={{ marginTop: 2 }}> { this.state.cacheSize } </div>
          }
        </div>
        <div style={{ width: 480, display: 'flex', alignItems: 'center' }}>
          <RaisedButton primary label="清理" onTouchTap={this.cleanCache} disabled={this.state.loading} />
        </div>
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
        { this.renderCacheClean() }
      </div>
    )
  }
}

export default SettingsApp
