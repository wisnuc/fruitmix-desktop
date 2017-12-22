import React from 'react'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'

import ActionSwapVerticalCircle from 'material-ui/svg-icons/action/swap-vertical-circle'
import BTDownload from '../control/BTDownload'
import { BTFinishedIcon } from '../common/Svg'
import Base from './Base'

class Download extends Base {
  constructor(ctx) {
    super(ctx)
    this.state = {
      error: null,
      tasks: null
    }
  }

  willReceiveProps(nextProps) {
    if (!nextProps.apis || !nextProps.apis.BTList || !nextProps.apis.bt) return
    const bt = nextProps.apis.bt
    if (bt.isRejected() && bt.reason() !== this.state.error) return this.setState({ error: bt.reason() })
    if (bt.isPending() || bt.isRejected()) return

    const BT = bt.value()
    if (!BT.switch && this.state.error !== BT) return this.setState({ error: BT, tasks: null })
    if (!BT.switch) return

    const BTList = nextProps.apis.BTList
    if (BTList.isPending() || BTList.isRejected()) return

    /* now it's fulfilled */
    const tasks = BTList.value()

    if (tasks !== this.state.tasks) {
      this.setState({ tasks, error: null })
    }
  }

  navEnter() {
    this.ctx.props.apis.request('BTList')
    this.ctx.props.apis.request('bt')
  }

  navLeave() {
  }

  navGroup() {
    return 'download'
  }

  menuName() {
    return i18n.__('FinishedList Menu Name')
  }

  menuIcon() {
    return BTFinishedIcon
  }

  appBarStyle() {
    return 'colored'
  }

  prominent() {
    return true
  }

  hasDetail() {
    return false
  }

  detailEnabled() {
    return false
  }

  renderTitle({ style }) {
    return (
      <div style={Object.assign({}, style, { marginLeft: 184 })}>
        { i18n.__('FinishedList Title %s', (this.state.tasks && this.state.tasks.finish.length) || 0)}
      </div>
    )
  }

  renderContent({ navToDrive, openSnackBar }) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <BTDownload
          ipcRenderer={ipcRenderer}
          navToDrive={navToDrive}
          tasks={this.state.tasks ? this.state.tasks.finish : []}
          apis={this.ctx.props.apis}
          openSnackBar={openSnackBar}
          primaryColor={this.groupPrimaryColor()}
          selectedDevice={this.ctx.props.selectedDevice}
          alt={true}
          error={this.state.error}
        />
      </div>
    )
  }
}

export default Download
