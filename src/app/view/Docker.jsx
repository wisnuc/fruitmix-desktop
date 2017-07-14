import React from 'react'
import Debug from 'debug'
import Base from './Base'
import Market from '../docker/Market'
import { DockerIcon } from '../common/Svg'

const debug = Debug('view:component:Docker:')

class Docker extends Base {

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
    return '应用市场'
  }

  menuIcon() {
    return DockerIcon
  }

  quickName() {
    return '应用市场'
  }

  appBarStyle() {
    return 'colored'
  }

  /** renderers **/
  renderContent({ openSnackBar }) {
    return (
      <Market
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

export default Docker
