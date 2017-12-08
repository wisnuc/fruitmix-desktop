import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { CircularProgress, Divider, Toggle, RaisedButton, Menu, MenuItem, Popover } from 'material-ui'
import InfoIcon from 'material-ui/svg-icons/action/info-outline'
import i18n from 'i18n'
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

    this.handleChange = (type) => {
      if (this.state.type !== type) {
        this.props.ipcRenderer.send('SETCONFIG', { locales: type })
        this.setState({ open: false })
      } else {
        this.setState({ open: false })
      }
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
      if (!error) this.props.openSnackBar(i18n.__('Clean Cache Success'))
      else this.props.openSnackBar(i18n.__('Clean Cache Failed'))
    }

    this.toggleMenu = (event) => {
      if (!this.state.open && event && event.preventDefault) event.preventDefault()
      this.setState({ open: event !== 'clickAway' && !this.state.open, anchorEl: event.currentTarget })
    }
  }

  componentDidMount() {
    this.props.ipcRenderer.send('GetCacheSize')
    this.props.ipcRenderer.on('CacheSize', this.getCacheSize)
    this.props.ipcRenderer.on('CleanCacheResult', this.getCleanCacheResult)
  }

  componentWillUnmount() {
    this.props.ipcRenderer.removeListener('CacheSize', this.getCacheSize)
    this.props.ipcRenderer.removeListener('CleanCacheResult', this.getCleanCacheResult)
  }

  renderRow({ type, enabled, func }) {
    return (
      <div style={{ height: 56, width: '100%', display: 'flex', alignItems: 'center', marginLeft: 24 }} key={type}>
        <div style={{ width: 40, display: 'flex', alignItems: 'center', marginRight: 8 }}>
          <InfoIcon color="rgba(0,0,0,0.54)" />
        </div>
        <div style={{ width: 560, display: 'flex', alignItems: 'center' }}>
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

  renderLocales() {
    const lan = global.config.global && global.config.global.locales || (navigator.language === 'zh-CN' ? 'zh-CN' : 'en-US')
    console.log('lan', lan, i18n.__(lan))
    return (
      <div style={{ height: 56, width: '100%', display: 'flex', alignItems: 'center', marginLeft: 24 }}>
        <div style={{ width: 40, display: 'flex', alignItems: 'center', marginRight: 8 }}>
          <InfoIcon color="rgba(0,0,0,0.54)" />
        </div>
        <div style={{ width: 560, display: 'flex', alignItems: 'center' }}>
          { i18n.__('Language Setting') }
          <div style={{ width: 8 }} />
        </div>
        <div style={{ width: 480, display: 'flex', alignItems: 'center', marginLeft: -8 }}>
          <div style={{ display: 'flex', alignItems: 'center ', marginRight: 84 }}>
            <FlatButton
              primary
              label={i18n.__(lan)}
              onTouchTap={this.toggleMenu}
            />
            {/* menu */}
            <Popover
              open={this.state.open}
              anchorEl={this.state.anchorEl}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              targetOrigin={{ horizontal: 'right', vertical: 'top' }}
              onRequestClose={this.toggleMenu}
            >
              <Menu style={{ minWidth: 240 }}>
                <MenuItem
                  style={{ fontSize: 13 }}
                  primaryText="简体中文"
                  onTouchTap={() => this.handleChange('zh-CN')}
                />
                <MenuItem
                  style={{ fontSize: 13 }}
                  primaryText="English"
                  onTouchTap={() => this.handleChange('en-US')}
                />
              </Menu>
            </Popover>
          </div>
        </div>
      </div>
    )
  }

  renderCacheClean() {
    return (
      <div style={{ height: 56, width: '100%', display: 'flex', alignItems: 'center', marginLeft: 24 }}>
        <div style={{ width: 40, display: 'flex', alignItems: 'center', marginRight: 8 }}>
          <InfoIcon color="rgba(0,0,0,0.54)" />
        </div>
        <div style={{ width: 560, display: 'flex', alignItems: 'center' }}>
          { i18n.__('Cache Size') }
          <div style={{ width: 8 }} />
          {
            this.state.cacheSize === -1 ? <CircularProgress size={16} thickness={1.5} />
              : <div style={{ marginTop: 2 }}> { this.state.cacheSize } </div>
          }
        </div>
        <div style={{ width: 480, display: 'flex', alignItems: 'center', marginLeft: -8 }}>
          <FlatButton primary label={i18n.__('Clean')} onTouchTap={this.cleanCache} disabled={this.state.loading} />
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
        type: i18n.__('Prevent Sleep Text'),
        enabled: !enableSleep,
        func: () => this.toggle('enableSleep')
      },
      {
        type: i18n.__('Client Close Text'),
        enabled: !noCloseConfirm,
        func: () => this.toggle('noCloseConfirm')
      }
    ]
    return (
      <div style={{ height: '100%', margin: 16 }}>
        <div style={{ fontSize: 20 }}>
          { i18n.__('Global Settings') }
        </div>
        <div style={{ height: 16 }} />
        { settings.map(op => this.renderRow(op)) }
        { this.renderLocales() }
        { this.renderCacheClean() }
      </div>
    )
  }
}

export default SettingsApp
