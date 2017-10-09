import React from 'react'
import Debug from 'debug'
import Base from './Base'
import AppsIcon from 'material-ui/svg-icons/navigation/apps'
import Apps from '../docker/Apps'

const debug = Debug('view:component:Docker:')

class InstalledApps extends Base {
  constructor(ctx) {
    super(ctx)

    this.state = {
      docker: null
    }
  }

  willReceiveProps(nextProps) {
    // console.log('media nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.docker) return
    const docker = nextProps.apis.docker
    if (docker.isPending() || docker.isRejected()) return

    const value = docker.value()

    if (value !== this.state.docker) {
      this.setState({ docker: value })
    }
  }

  navEnter() {
    this.ctx.props.apis.request('docker')
  }

  navGroup() {
    return 'docker'
  }

  menuName() {
    return '已安装应用'
  }

  menuIcon() {
    return AppsIcon
  }

  quickName() {
    return '已安装应用'
  }

  appBarStyle() {
    return 'colored'
  }

  renderContent({ openSnackBar }) {
    return (
      <Apps
        apis={this.ctx.props.apis}
        nav={this.ctx.props.nav}
        docker={this.state.docker}
        selectedDevice={this.ctx.props.selectedDevice}
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
      />
    )
  }
}

export default InstalledApps
