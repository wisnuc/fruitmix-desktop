import React from 'react'
import i18n from 'i18n'

import ActionSwapVerticalCircle from 'material-ui/svg-icons/action/swap-vertical-circle'
import FinishedList from '../download/FinishedList'
import Base from './Base'

class Download extends Base {
  constructor(ctx) {
    super(ctx)
    this.state = {
      tasks: null
    }
  }

  willReceiveProps(nextProps) {
    console.log('Download nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.BTList) return
    const BTList = nextProps.apis.BTList
    if (BTList.isPending() || BTList.isRejected()) return

    /* now it's fulfilled */
    const tasks = BTList.value()

    if (tasks !== this.state.tasks) {
      this.setState({ tasks })
    }
  }

  navEnter() {
    this.ctx.props.apis.request('BTList')
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
    return ActionSwapVerticalCircle
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
        { i18n.__('FinishedList Title %s', (this.state.tasks && this.state.tasks.length) || 0)}
      </div>
    )
  }

  renderContent({ navToDrive, openSnackBar }) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FinishedList
          navToDrive={navToDrive}
          tasks={[]}
          apis={this.ctx.props.apis}
          openSnackBar={openSnackBar}
          primaryColor={this.groupPrimaryColor()}
        />
      </div>
    )
  }
}

export default Download
