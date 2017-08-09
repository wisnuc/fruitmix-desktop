import React from 'react'
import Debug from 'debug'
import { clipboard, shell } from 'electron'
import { CircularProgress, Divider } from 'material-ui'
import { cyan600, grey200 } from 'material-ui/styles/colors'
import FlatButton from '../common/FlatButton'
import Checkmark from '../common/Checkmark'
import DialogOverlay from '../common/DialogOverlay'

const debug = Debug('component:control:ClientUpdate:')

class Update extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      confirm: false
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

    this.download = () => {
      const asset = this.rel.assets.find((item) => {
        const extension = item.name.replace(/.*\./, '')
        return (extension === 'exe' || extension === 'dmg')
      })
      debug(asset.browser_download_url)
      this.props.ipcRenderer.send('CHECK_UPDATE', asset.browser_download_url)
    }

    this.getPath = (event, path) => {
      debug('this.getPath', path)
      shell.openItem(path)
    }
  }

  renderLoading() {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </div>
    )
  }


  componentDidMount() {
    this.props.ipcRenderer.on('RELEASE_PATH', this.getPath)
  }

  render() {
    const { rels, toggleDetail } = this.props
    debug('render client', this.props, global.config)
    if (!rels) return this.renderLoading()
    const currentVersion = global.config.appVersion
    const showRel = rels.filter(rel => !rel.prerelease)[0]
    const date = showRel.published_at.split('T')[0].split('-')

    this.rel = showRel
    return (
      <div style={{ height: '100%', margin: 16 }}>
        <div style={{ width: '100%', height: 72, display: 'flex', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 34, color: cyan600 }}>
              { showRel.name.replace(/\./g, ' . ') }
              <div style={{ width: 8 }} />
              { showRel.prerelease && '(beta)' }
              <div style={{ width: 8 }} />
              <div style={{ fontSize: 14, height: 40 }}>
                <div style={{ height: 16 }} />
                { '最新稳定版' }
              </div>
            </div>
            <div style={{ height: 8 }} />
            <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }}>
              { `发布日期：${date[0]}年${date[1]}月${date[2]}日` }
            </div>
          </div>
          <div style={{ flexGrow: 1 }} />
          <div
            style={{
              height: 56,
              width: 96,
              marginRight: 16,
              backgroundColor: grey200,
              borderRadius: '8px',
              fontSize: 14
            }}
            onTouchTap={toggleDetail}
          >
            <div style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              { currentVersion }
            </div>
            <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -6 }}>
              { '当前版本' }
            </div>
          </div>
        </div>

        <div style={{ height: 24 }} />
        <div style={{ color: 'rgba(0,0,0,0.54)', height: 36, display: 'flex', alignItems: 'center' }}>
          {
            showRel.id === currentVersion ? '已是最新稳定版'
            : <FlatButton
              style={{ marginLeft: -8 }}
              label="下载并安装"
              onTouchTap={() => this.toggleDialog('confirm')}
              primary
            />
          }
        </div>
        <div style={{ height: 48 }} />
        <div style={{ fontWeight: 500, height: 56, display: 'flex', alignItems: 'center' }}>
          { '更新内容：' }
        </div>
        {
          showRel.body ? showRel.body.split(/[1-9]\./).map(list => list && (
            <div style={{ marginLeft: 24, height: 40, display: 'flex', alignItems: 'center' }} key={list}>
              { '*' }
              <div style={{ width: 16 }} />
              { list }
            </div>
          ))
            : (
              <div style={{ marginLeft: 24, height: 40, display: 'flex', alignItems: 'center' }}>
                { '*' }
                <div style={{ width: 16 }} />
                { '修复bugs' }
              </div>
            )
        }
        <div style={{ height: 48 }} />
        <Divider />
        <div style={{ height: 8 }} />
        <FlatButton
          primary
          label="更多版本"
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
                  { `将要为您安装版本号为 ${this.rel.name} 的程序。` }
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
                    label={'安装'}
                    primary
                    onTouchTap={this.download}
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
