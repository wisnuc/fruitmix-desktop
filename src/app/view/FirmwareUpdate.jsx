import React from 'react'
import Debug from 'debug'
import UpdateIcon from 'material-ui/svg-icons/action/system-update-alt'
import ListIcon from 'material-ui/svg-icons/action/list'
import Base from './Base'
import FirmwareUpdateApp from '../control/FirmwareUpdateApp'
import FirmDetail from '../control/FirmDetail'

const debug = Debug('view:component:update')

class FirmwareUpdate extends Base {

  constructor(ctx) {
    super(ctx)

    this.state = {
      firm: null,
      showRel: null,
      latest: null,
      installed: null
    }

    this.selectRel = (showRel) => {
      debug('this.selectRel', showRel)
      this.setState({ showRel })
    }
  }

  willReceiveProps(nextProps) {
    debug('FirmwareUpdate in view model', nextProps)
    if (!nextProps.selectedDevice || !nextProps.selectedDevice.firm) return

    const firm = nextProps.selectedDevice.firm
    if (firm.isPending() || firm.isRejected()) return

    const value = firm.value()

    if (value && value !== this.state.firm) {
      const rels = value.locals
      const installed = rels.findIndex(rel => rel.release.id === value.current.id)
      const latest = rels.findIndex(rel => !rel.release.prerelease)
      /*
      const rels = value.remotes
      const installed = rels.findIndex(rel => rel.id === value.current.id)
      const latest = rels.findIndex(rel => !rel.prerelease)
      */
      let showRel
      if (latest < installed) {
        showRel = rels[latest].release
      } else {
        showRel = rels[installed].release
      }
      this.setState({ firm: value, showRel, latest: rels[latest].release, installed: rels[installed].release })
    }
  }

  navEnter() {
    this.ctx.props.selectedDevice.request('firm')
  }

  navGroup() {
    return 'device'
  }

  menuName() {
    return '固件升级'
  }

  menuIcon() {
    return UpdateIcon
  }

  quickName() {
    return '固件升级'
  }

  appBarStyle() {
    return 'colored'
  }

  hasDetail() {
    return true
  }

  detailEnabled() {
    return true
  }

  detailIcon() {
    return ListIcon 
  }

  renderDetail({ style, openSnackBar }) {
    return (
      <div style={style}>
        <FirmDetail
          firm={this.state.firm}
          showRel={this.state.showRel}
          latest={this.state.latest}
          installed={this.state.installed}
          primaryColor={this.groupPrimaryColor()}
          selectRel={this.selectRel}
        />
      </div>
    )
  }

  /** renderers **/
  renderContent({ openSnackBar, toggleDetail }) {
    return (
      <FirmwareUpdateApp
        firm={this.state.firm}
        showRel={this.state.showRel}
        latest={this.state.latest}
        installed={this.state.installed}
        toggleDetail={toggleDetail}
        apis={this.ctx.props.apis}
        nav={this.ctx.props.nav}
        selectedDevice={this.ctx.props.selectedDevice}
        primaryColor={this.groupPrimaryColor()}
        openSnackBar={openSnackBar}
      />
    )
  }
}

export default FirmwareUpdate
