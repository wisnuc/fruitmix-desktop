import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { CircularProgress, Divider, Toggle, RaisedButton, Menu, MenuItem, Popover } from 'material-ui'
import LanguageIcon from 'material-ui/svg-icons/action/language'
import i18n from 'i18n'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:LanguageApp:')

class LanguageApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false
    }

    this.handleChange = (type) => {
      if (this.state.type !== type) {
        this.props.ipcRenderer.send('SETCONFIG', { locales: type })
        this.setState({ open: false })
      } else {
        this.setState({ open: false })
      }
    }

    this.toggleMenu = (event) => {
      if (!this.state.open && event && event.preventDefault) event.preventDefault()
      this.setState({ open: event !== 'clickAway' && !this.state.open, anchorEl: event.currentTarget })
    }
  }

  render() {
    if (!global.config) return (<div />)

    const lan = global.config.global && global.config.global.locales || (navigator.language === 'zh-CN' ? 'zh-CN' : 'en-US')
    return (
      <div style={{ height: '100%', marginTop: 16 }}>
        <div style={{ height: 16 }} />
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginLeft: 24 }}>
          <div style={{ width: 40, display: 'flex', alignItems: 'center', marginRight: 8 }}>
            <LanguageIcon color={this.props.primaryColor} />
          </div>
          <div style={{ width: 360, display: 'flex', alignItems: 'center' }}>
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
      </div>
    )
  }
}

export default LanguageApp
