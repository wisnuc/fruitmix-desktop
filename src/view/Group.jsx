import React from 'react'
import UUID from 'uuid'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import { IconButton } from 'material-ui'
import GroupIcon from 'material-ui/svg-icons/social/group'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh'

import Box from './Box'
import FlatButton from '../common/FlatButton'
import { combineElement, removeElement } from '../common/array'
import Groups from '../box/Groups'
import BoxDetail from '../box/BoxDetail'

class Group extends Box {
  constructor(ctx) {
    super(ctx)
    this.state = {
      boxes: null,
      currentBox: null
    }

    this.selectBox = (index) => {
      console.log('this.selectBox', index, this.state)
      if (!this.state.boxes) return
      this.setState({ currentBox: this.state.boxes[index] })
    }

    this.refresh = (op) => {
      this.ctx.props.apis.pureRequest('boxes', null, (err, res) => {
        const boxes = Array.isArray(res) && res.filter(b => b && b.station)
        console.log('boxes', err, boxes)
        if (!err && boxes) {
          this.setState({ boxes: this.processBox(boxes) })
          let currentBox = boxes.find(b => this.state.currentBox && (b.uuid === this.state.currentBox.uuid)) || boxes[0]
          if (op && Number.isInteger(op.index)) currentBox = boxes[op.index]
          if (currentBox) {
            this.setState({ currentBox })
          } else this.setState({ currentBox: null })
        }
      })
    }

    this.getUsers = next => this.ctx.props.apis.pureRequest('friends', { userId: this.guid }, next)
  }

   /*
  willReceiveProps(nextProps) {
    // console.log('Group willReceiveProps', nextProps, this.state)
    // if (!this.state.account) this.handleProps(nextProps.apis, ['account'])
  }
  */

  navGroup() {
    return 'group'
  }

  menuName() {
    return i18n.__('Group Menu Name')
  }

  menuIcon() {
    return GroupIcon
  }

  quickName() {
    return i18n.__('Group Quick Name')
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

  renderTitle({ style }) {
    return <div style={style}>{this.menuName()}</div>
  }

  renderNavigationMenu({ style, onTouchTap }) {
    return (
      <div style={style}>
        <IconButton onTouchTap={onTouchTap}>
          <NavigationMenu color="#FFF" />
        </IconButton>
      </div>
    )
  }

  /*
  renderToolBar({ style }) {
    return (
      <div style={style}>
        <IconButton onTouchTap={() => this.refresh()} tooltip={i18n.__('Refresh')} >
          <RefreshIcon color="#FFF" />
        </IconButton>
      </div>
    )
  }
  */

  renderDetail({ style }) {
    return (
      <div
        style={style}
        key={this.state.currentBox && (this.state.currentBox.users.length + this.state.currentBox.users.name)}
      >
        <BoxDetail
          guid={this.guid}
          refresh={this.refresh}
          box={this.state.currentBox}
          apis={this.ctx.props.apis}
          primaryColor={this.groupPrimaryColor()}
          openSnackBar={msg => this.ctx.openSnackBar(msg)}
          getUsers={this.getUsers}
        />
      </div>
    )
  }

  renderContent({ openSnackBar }) {
    return (<Groups
      {...this.state}
      getMsg={this.getMsg}
      selectBox={this.selectBox}
      ipcRenderer={ipcRenderer}
      apis={this.ctx.props.apis}
      primaryColor={this.groupPrimaryColor()}
      updateFakeTweet={this.updateFakeTweet}
      openSnackBar={openSnackBar}
      refresh={this.refresh}
      getUsers={this.getUsers}
      guid={this.guid}
      station={this.station}
    />)
  }
}

export default Group
