import React from 'react'
import i18n from 'i18n'
import AppsIcon from 'material-ui/svg-icons/navigation/apps'
import Base from './Base'
import Apps from '../docker/Apps'

class InstalledApps extends Base {
  constructor (ctx) {
    super(ctx)

    this.state = {
      docker: null
    }
  }

  willReceiveProps (nextProps) {
    // console.log('media nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.docker) return
    const docker = nextProps.apis.docker
    if (docker.isPending() || docker.isRejected()) return

    const value = docker.value()

    if (value !== this.state.docker) {
      this.setState({ docker: value })
    }
  }

  navEnter () {
    this.ctx.props.apis.request('docker')
  }

  navGroup () {
    return 'docker'
  }

  menuName () {
    return i18n.__('InstalledApps Menu Name')
  }

  menuIcon () {
    return AppsIcon
  }

  appBarStyle () {
    return 'colored'
  }

  renderContent ({ openSnackBar }) {
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
