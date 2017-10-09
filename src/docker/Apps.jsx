import React from 'react'
import Debug from 'debug'
import { shell, clipboard } from 'electron'
import { Paper, IconButton, Toggle } from 'material-ui'
import Star from 'material-ui/svg-icons/toggle/star'
import FileDownload from 'material-ui/svg-icons/file/file-download'

import Detail from './Detail'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/PureDialog'

const debug = Debug('component:control:deviceinfo')

class Market extends React.PureComponent {
  constructor(props) {
    super(props)
    /* CId, id of container; CState, state of container */
    this.state = {
      appDetail: '',
      openURL: '',
      CId: '',
      CState: false
    }
    this.imgURL = 'https://raw.githubusercontent.com/wisnuc/appifi-recipes/release/images/'

    this.toggleState = (op) => {
      this.setState({ [op]: !this.state[op] })
    }

    this.openDialog = (id, CState) => {
      this.setState({ CId: id, CState })
    }

    this.closeDialog = (op) => {
      this.setState({ [op]: '' })
    }

    this.copyText = () => {
      clipboard.writeText(this.state.openURL)
      this.props.openSnackBar('复制成功')
      // this.closeDialog('openURL')
    }

    this.startUnistall = () => {
      debug('this.startUnistall')
      this.setState({ uninstall: this.state.appDetail, appDetail: '' })
    }
  }

  renderCard(app, appstore, containers) {
    const container = containers.find(c => c.Id === app.containerIds[0]) // more than one container ? TODO
    // debug('renderCard', container, this.props)
    const CState = container.State === 'running'
    const repo = appstore.result.find(a => a.appname === app.recipe.appname).components[0].repo

    const detail = {
      appname: app.recipe.appname,
      imageLink: `${this.imgURL}${app.recipe.components[0].imageLink}`,
      repo,
      installed: app
    }

    return (
      <Paper
        key={app.uuid}
        style={{ float: 'left', margin: 16, height: 232, width: 176 }}
      >
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton
            iconStyle={{ width: 128, height: 128, filter: CState ? '' : 'grayscale(100%)' }}
            style={{ width: 160, height: 160, padding: 16 }}
            onTouchTap={() => { this.setState({ appDetail: detail }) }}
          >
            <img
              height={128}
              width={128}
              src={`${this.imgURL}${app.recipe.components[0].imageLink}`}
              alt={app.recipe.appname}
            />
          </IconButton>
        </div>
        <div style={{ height: 34, display: 'flex', marginLeft: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: CState ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.54)'
            }}
          >
            { app.recipe.appname }
          </div>
          <div style={{ flexGrow: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
            <Toggle
              toggled={CState}
              onToggle={() => { this.openDialog(container.Id, CState) }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '-4px 0px 8px 8px' }}>
          {
            CState ?
              <FlatButton
                style={{ color: this.props.primaryColor }}
                label="进入应用"
                onTouchTap={() => this.setState({ openURL: `http://10.10.9.86:${container.Ports[0].PublicPort}/` })}
              />
            : <div style={{ height: 36, display: 'flex', alignItems: 'center', marginLeft: 8, fontSize: 15 }}>应用未启动</div>
          }
        </div>
      </Paper>
    )
  }

  render() {
    if (!this.props.docker || !this.props.docker.appstore) {
      return (
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          载入中...
        </div>
      )
    }

    // debug('this.props.docker', this.props.docker)
    const docker = this.props.docker
    const appstore = docker.appstore
    const { installeds, containers } = docker.docker

    // debug('this.props.docker', installeds)
    // return <div>Loading...</div>
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
        <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 56px)', overflow: 'auto' }}>
          { installeds.map(app => (this.renderCard(app, appstore, containers))) }
        </div>

        {/* detail dialog */}
        <DialogOverlay
          open={!!this.state.appDetail || !!this.state.uninstall}
          onRequestClose={() => { this.closeDialog('appDetail'); this.closeDialog('uninstall') }}
        >
          <div
            style={{
              height: this.state.appDetail ? 280 : 173,
              width: this.state.appDetail ? 680 : 368,
              transition: 'all .2s cubic-bezier(0.4, 0.0, 0.2, 1) 0ms',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {
              !!this.state.appDetail &&
                <Detail
                  detail={this.state.appDetail}
                  primaryColor={this.props.primaryColor}
                  uninstall={this.startUnistall}
                />
            }
            {
              !!this.state.uninstall &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { this.state.uninstall.installed ? '卸载应用' : '安装应用' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.87)' }}>
                    { this.state.uninstall.installed ? '确定卸载该应用吗？' : '确定安装该应用吗？' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton
                      label="取消"
                      primary
                      onTouchTap={() => { this.setState({ appDetail: this.state.uninstall }); this.closeDialog('uninstall') }}
                    />
                    <FlatButton
                      label={this.state.uninstall.installed ? '卸载' : '安装'}
                      primary
                      onTouchTap={() => {}}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>

        {/* toggle start/stop dialog */}
        <DialogOverlay open={!!this.state.CId}>
          <div>
            {
              !!this.state.CId &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { this.state.CState ? '关闭后，该应用不可使用。您可随时开启。' : '您确定开启该应用吗？'}
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.closeDialog('CId')} keyboardFocused />
                    <FlatButton
                      label="确定"
                      primary
                      onTouchTap={() => this.closeDialog('CId')}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>

        {/* URL dialog */}
        <DialogOverlay open={!!this.state.openURL} onRequestClose={() => this.closeDialog('openURL')}>
          {
            !!this.state.openURL &&
            <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
              <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}> 打开应用 </div>
              <div style={{ height: 20 }} />
              <div style={{ color: 'rgba(0,0,0,0.87)' }}>
                { this.state.openURL }
              </div>
              <div style={{ height: 24 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <div style={{ marginLeft: -24 }}>
                  <FlatButton label="复制到剪贴板" primary onTouchTap={this.copyText} />
                </div>
                <div style={{ width: 108 }} />
                <FlatButton
                  label="默认浏览器打开"
                  primary
                  onTouchTap={() => {
                    shell.openExternal(this.state.openURL)
                    this.closeDialog('openURL')
                  }}
                />
              </div>
            </div>
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default Market
