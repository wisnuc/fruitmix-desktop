import React from 'react'
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

  renderCheckUpdate() {
    const rel = this.state.rel
    const date = rel.published_at.split('T')[0].split('-')
    return (
      <div>
        <div>
          { `发现新版本： ${rel.name}` }
          <FlatButton style={{ marginLeft: 8 }} label="安装" onTouchTap={() => this.toggleDialog('confirm')} primary />
        </div>
        <div style={{ height: 16 }} />
        <div> { `发布日期：${date[0]}年${date[1]}月${date[2]}日` } </div>
        <div style={{ height: 16 }} />
        <div> { '更新内容：' } </div>
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
            { '修复bugs' }
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
          { `当前版本: ${currentVersion}` }
        </div>
        <div style={{ height: 16 }} />
        <Divider />
        <div style={{ height: 16 }} />
        {
          platform !== 'darwin' && platform !== 'win32'
            ? <div> { '当前版本不支持自动更新！' } </div>
            : this.state.status === 'checking'
            ? <div>
              <div>{ '检查更新中...' } </div>
              <div style={{ margin: 48 }}>
                <CircularProgress size={64} />
              </div>
            </div>
            : this.state.status === 'latest'
            ? <div style={{ display: 'flex', alignItems: 'center', height: 48 }}>
              { '已是最新稳定版' }
            </div>
            : this.state.status === 'needUpdate'
            ? this.renderCheckUpdate()
            : <div style={{ display: 'flex', alignItems: 'center', height: 48 }}>
              { '检查更新失败，请检查网络设置或重试！' }
            </div>
        }
        <div style={{ height: 16 }} />
        <Divider />
        <div style={{ height: 16 }} />
        <FlatButton
          icon={<GithubIcon style={{ marginTop: 4 }} />}
          style={{ marginLeft: -8 }}
          primary
          label="查看更多版本"
          onTouchTap={this.moreVersion}
        />

        {/* dialog */}
        <DialogOverlay open={this.state.confirm} >
          {
            this.state.confirm &&
              <div style={{ width: 560, padding: '24px 24px 0px 24px' }}>
                <div style={{ fontSize: 21, fontWeight: 500 }}>
                  { '客户端升级' }
                </div>
                <div style={{ height: 20 }} />
                <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }}>
                  { `将要为您安装版本号为 ${this.state.rel.name} 的程序。` }
                </div>
                <div style={{ height: 8 }} />
                <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }} >
                  { '建议配合最新的WISNUC系统固件使用' }
                </div>
                <div style={{ height: 24 }} />
                <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                  <FlatButton
                    label="取消"
                    primary
                    onTouchTap={() => this.toggleDialog('confirm')}
                  />
                  <FlatButton
                    label="安装"
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
