import React from 'react'
import Debug from 'debug'
import { Paper, IconButton } from 'material-ui'
import AddCirle from 'material-ui/svg-icons/content/add-circle'
import Detail from './Detail'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/PureDialog'

const debug = Debug('component:control:deviceinfo')

class Market extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      appDetail: '',
      uninstall: ''
    }

    this.imgURL = 'https://raw.githubusercontent.com/wisnuc/appifi-recipes/release/images/'

    this.closeDialog = (op) => {
      this.setState({ [op]: '' })
    }

    this.startUnistall = () => {
      debug('this.startUnistall')
      this.setState({ uninstall: this.state.appDetail, appDetail: '' })
    }
  }

  renderCard (app, installeds, containers) {
    // debug('renderCard', app, installeds, containers)
    const installed = installeds.find(i => i.recipe.appname === app.appname)
    let container = null
    if (installed) {
      container = containers.find(c => c.Id === installed.containerIds[0]) // more than one container ? TODO
    }

    const repo = app.components[0].repo
    const detail = {
      appname: app.appname,
      imageLink: `${this.imgURL}${app.components[0].imageLink}`,
      repo,
      installed,
      container
    }

    // debug('renderCard', detail)
    return (
      <Paper
        key={app.key}
        style={{ float: 'left', margin: 16, height: 232, width: 176 }}
      >
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton
            iconStyle={{ width: 128, height: 128 }}
            style={{ width: 160, height: 160, padding: 16 }}
            onTouchTap={() => { this.setState({ appDetail: detail }) }}
          >
            <img
              height={128}
              width={128}
              src={`${this.imgURL}${app.components[0].imageLink}`}
              alt={app.appname}
            />
          </IconButton>
        </div>

        <div style={{ height: 34, display: 'flex', alignItems: 'center', marginLeft: 16, color: 'rgba(0,0,0,0.87)' }}>
          { app.appname }
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '-4px 0px 8px 8px' }}>
          {
            installed
              ? <div style={{ height: 18, width: 91, fontSize: 15, margin: '8px 0px 0px 8px' }}>已安装</div>
              : <FlatButton
                primary
                label="下载并安装"
                onTouchTap={() => this.setState({ uninstall: detail })}
              />
          }
        </div>
      </Paper>
    )
  }

  render () {
    if (!this.props.docker || !this.props.docker.appstore) {
      return (
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          载入中...
        </div>
      )
    }
    const appstore = this.props.docker.appstore.result
    const { docker } = this.props
    const { installeds, containers } = docker.docker
    // debug('this.props.device', appstore)
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
        <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 56px)', overflow: 'auto' }}>
          {/* app card */}
          {
            appstore.map(app => this.renderCard(app, installeds, containers))
          }

          {/* add app */}
          <Paper
            style={{ float: 'left', margin: 16, height: 232, width: 176 }}
          >
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconButton
                iconStyle={{ width: 80, height: 80 }}
                style={{ width: 160, height: 160, padding: 40 }}
              >
                <AddCirle color="rgba(0,0,0,0.87)" />
              </IconButton>
            </div>
          </Paper>
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
            {/* app detail */}
            {
              !!this.state.appDetail &&
                <Detail
                  detail={this.state.appDetail}
                  primaryColor={this.props.primaryColor}
                  uninstall={this.startUnistall}
                />
            }

            {/* install or uninstall app */}
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
                      onTouchTap={() => this.closeDialog('uninstall')}
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
      </div>
    )
  }
}

export default Market
