import React from 'react'

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
    return 'BT下载'
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
    return <div style={Object.assign({}, style, { marginLeft: 184 })}>BT下载</div>
  }

  renderContent({ navToDrive, openSnackBar }) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
        <FinishedList
          navToDrive={navToDrive}
          tasks={this.state.tasks}
          apis={this.ctx.props.apis}
        />
      </div>
    )
  }
}

export default Download
