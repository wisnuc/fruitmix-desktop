import React from 'react'
import Debug from 'debug'
import Base from './Base'
import AppsIcon from 'material-ui/svg-icons/navigation/apps'
import Market from '../docker/Market'
import { PPTIcon, DockerIcon } from '../common/Svg'

const debug = Debug('view:component:Docker:')

class Docker extends Base {

  constructor(ctx) {
    super(ctx)
  }

  willReceiveProps(nextProps) {
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

  /** renderers **/
  renderContent({ openSnackBar }) {
    return (
      <Market
        apis={this.ctx.props.apis}
        nav={this.ctx.props.nav}
        selectedDevice={this.ctx.props.selectedDevice}
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
      />
    )
  }
}

export default Docker
