import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { shell } from 'electron'
import { CircularProgress, Divider } from 'material-ui'
import { cyan600 } from 'material-ui/styles/colors'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/DialogOverlay'
import { GithubIcon } from '../common/Svg'

const debug = Debug('component:control:ClientUpdate:')

class Update extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      status: 'checking',
      confirm: false,
      rel: null
    }

    this.toggleDialog = (op) => {
      this.setState({ [op]: !this.state[op] })
    }

    this.moreVersion = () => {
      const platform = global.config.platform
      const type = platform === 'win32'
        ? 'wisnuc-desktop-windows/releases'
        : platform === 'darwin'
          ? 'wisnuc-desktop-mac/releases'
          : 'fruitmix-desktop'
      shell.openExternal(`https://github.com/wisnuc/${type}`)
    }

    this.install = () => {
      console.log('this.state.filePath')
      this.props.ipcRenderer.send('INSTALL_NEW_VERSION', this.state.filePath)
    }

    this.newRelease = (event, result) => {
      debug('this.getPath', result)
      const { rel, filePath, error } = result
      if (!rel || error) return this.setState({ status: 'error' })
      let status = 'needUpdate'
      if (global.config.appVersion.localeCompare(rel.name) >= 0 || !filePath) status = 'latest'
      return this.setState({ rel, filePath, status })
    }
  }

  componentDidMount() {
    this.props.ipcRenderer.send('CHECK_UPDATE')
    this.props.ipcRenderer.on('NEW_RELEASE', this.newRelease)
  }

  componentWillUnmount() {
    this.props.ipcRenderer.removeListener('NEW_RELEASE', this.newRelease)
  }

  renderCheckUpdate() {
    const rel = this.state.rel
    const date = rel.published_at.split('T')[0]
    return (
      <div>
        <div>
          { i18n.__('New Version Detected %s', rel.name) }
          <FlatButton style={{ marginLeft: 8 }} label={i18n.__('Install')} onTouchTap={() => this.toggleDialog('confirm')} primary />
        </div>
        <div style={{ height: 16 }} />
        <div> { i18n.__('Publish Date %s', date) } </div>
        <div style={{ height: 16 }} />
        <div> { i18n.__('Updates') } </div>
        <div style={{ height: 8 }} />
        {
          rel.body ? rel.body.split(/[1-9]\./).map(list => list && (
            <div style={{ marginLeft: 24, height: 40, display: 'flex', alignItems: 'center' }} key={list}>
              { '*' }
              <div style={{ width: 16 }} />
              { list }
            </div>
          ))
            :
          <div style={{ marginLeft: 24, height: 40, display: 'flex', alignItems: 'center' }}>
            { '*' }
            <div style={{ width: 16 }} />
            { i18n.__('Bug Fixes') }
          </div>
        }
      </div>
    )
  }

  render() {
    debug('render client', this.props, global.config)
    const currentVersion = global.config.appVersion
    const platform = global.config.platform
    return (
      <div style={{ height: '100%', margin: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 20, color: cyan600 }}>
          { i18n.__('Current Version %s', currentVersion) }
        </div>
        <div style={{ height: 16 }} />
        <Divider />
        <div style={{ height: 16 }} />
        {
          platform !== 'darwin' && platform !== 'win32'
            ? <div> { i18n.__('Unsupported to Update') } </div>
            : this.state.status === 'checking'
            ? <div>
              <div>{ i18n.__('Checking Update') } </div>
              <div style={{ margin: 48 }}>
                <CircularProgress size={64} />
              </div>
            </div>
            : this.state.status === 'latest'
            ? <div style={{ display: 'flex', alignItems: 'center', height: 48 }}>
              { i18n.__('Already LTS Text') }
            </div>
            : this.state.status === 'needUpdate'
            ? this.renderCheckUpdate()
            : <div style={{ display: 'flex', alignItems: 'center', height: 48 }}>
              { i18n.__('Check Update Failed Text') }
            </div>
        }
        <div style={{ height: 16 }} />
        <Divider />
        <div style={{ height: 16 }} />
        <FlatButton
          icon={<GithubIcon style={{ marginTop: 4 }} />}
          style={{ marginLeft: -8 }}
          primary
          label={i18n.__('Check More Version')}
          onTouchTap={this.moreVersion}
        />

        {/* dialog */}
        <DialogOverlay open={this.state.confirm} >
          {
            this.state.confirm &&
              <div style={{ width: 560, padding: '24px 24px 0px 24px' }}>
                <div style={{ fontSize: 21, fontWeight: 500 }}>
                  { i18n.__('Client Update') }
                </div>
                <div style={{ height: 20 }} />
                <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }}>
                  { i18n.__('Install New Version Text 1 %s', this.state.rel.name) }
                </div>
                <div style={{ height: 8 }} />
                <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }} >
                  { i18n.__('Install New Version Text 2') }
                </div>
                <div style={{ height: 24 }} />
                <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                  <FlatButton
                    label={i18n.__('Cancel')}
                    primary
                    onTouchTap={() => this.toggleDialog('confirm')}
                  />
                  <FlatButton
                    label={i18n.__('Confirm')}
                    primary
                    onTouchTap={this.install}
                  />
                </div>
              </div>
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default Update
