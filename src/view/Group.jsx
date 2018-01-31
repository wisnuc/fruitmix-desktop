import React from 'react'
import UUID from 'uuid'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import { IconButton } from 'material-ui'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

import Base from './Base'
import FlatButton from '../common/FlatButton'
import { combineElement, removeElement } from '../common/array'
import Groups from '../box/Groups'
import BoxDetail from '../box/BoxDetail'

/* increase limit of listeners of EventEmitter */
ipcRenderer.setMaxListeners(1000)

class Group extends Base {
  constructor(ctx) {
    super(ctx)
    this.state = {
      tweets: [],
      boxes: null,
      currentBox: null
    }

    this.getTweets = (box) => {
      this.setState({ currentBox: null })
      this.ctx.props.apis.pureRequest('tweets', { boxUUID: box.uuid }, (err, tweets) => {
        if (!err && tweets) this.setState({ tweets, currentBox: box })
        else console.log('get tweets error', err, tweets)
      })
    }

    this.processBox = (d) => {
      if (!d || !d[0]) return []
      d.forEach((b) => {
        b.ltime = b.ctime
        b.lcomment = Array.from({ length: Math.random() * 10 })
          .map(() => String.fromCharCode(0x674e - Math.random() * 100))
      })
      d.sort((a, b) => (b.ltime - a.ltime))
      return d
    }

    this.refresh = () => {
      this.ctx.props.apis.pureRequest('boxes', null, (err, boxes) => {
        console.log('boxes', err, boxes)
        if (!err && boxes) this.setState({ boxes: this.processBox(boxes) })
        if (!err && boxes && boxes[0]) this.getTweets(boxes[0])
      })
    }
  }

  willReceiveProps(nextProps) {
    this.handleProps(nextProps.apis, ['boxToken'])
  }

  navEnter() {
    const a = this.ctx.props.apis.account
    this.guid = a && a.data && a.data.global && a.data.global.id

    this.ctx.props.apis.request('boxToken', { guid: this.guid }, this.refresh)
  }

  navLeave() {
  }

  navGroup() {
    return 'box'
  }

  menuName() {
    return i18n.__('Group Menu Name')
  }

  menuIcon() {
    return PhotoIcon
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

  renderDetail({ style }) {
    return (
      <div style={style}>
        <BoxDetail
          guid={this.guid}
          refresh={this.refresh}
          box={this.state.currentBox}
          apis={this.ctx.props.apis}
          primaryColor={this.groupPrimaryColor()}
          openSnackBar={msg => this.ctx.openSnackBar(msg)}
          friends={this.ctx.props.apis.users.data.filter(u => !!u.global) || []}
        />
      </div>
    )
  }

  renderContent({ openSnackBar }) {
    return (<Groups
      {...this.state}
      ipcRenderer={ipcRenderer}
      apis={this.ctx.props.apis}
      primaryColor={this.groupPrimaryColor()}
      getTweets={this.getTweets}
      openSnackBar={openSnackBar}
      refresh={this.refresh}
      guid={this.guid}
      friends={this.ctx.props.apis.users.data.filter(u => !!u.global) || []}
    />)
  }
}

export default Group
