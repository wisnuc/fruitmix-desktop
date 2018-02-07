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
      this.setState({ tweets: null })
      const getAuthor = id => box.users.find(u => u.id === id) || { id, nickName: '已退群' }
      this.ctx.props.apis.pureRequest('tweets', { boxUUID: box.uuid, stationId: box.stationId }, (err, tweets) => {
        if (!err && tweets) {
          this.setState({ tweets: tweets.map(t => Object.assign({ author: getAuthor(t.tweeter.id) }, t)), currentBox: box })
        } else console.log('get tweets error', err, tweets)
      })
    }

    this.processBox = (d) => {
      if (!d || !d[0]) return []

      d.forEach((b) => {
        const { tweet, ctime } = b
        if (tweet) {
          b.ltime = tweet.ctime
          const list = tweet.list
          const isMedia = list && list.length && list.every(l => l.metadata)
          const comment = isMedia ? `[${i18n.__('%s Photos', list.length)}]` : list && list.length
            ? `[${i18n.__('%s Files', list.length)}]` : tweet.comment
          const nickName = b.users.find(u => u.id === tweet.tweeter).nickName
          b.lcomment = `${nickName} : ${comment}`
        } else {
          b.ltime = ctime
          b.lcomment = i18n.__('New Group Text')
        }
      })
      d.sort((a, b) => (b.ltime - a.ltime))
      return d
    }

    this.refresh = () => {
      this.ctx.props.apis.pureRequest('boxes', null, (err, boxes) => {
        console.log('boxes', err, boxes)
        if (!err && boxes) {
          this.setState({ boxes: this.processBox(boxes) })
          const currentBox = boxes.find(b => this.state.currentBox && (b.uuid === this.state.currentBox.uuid)) || boxes[0]
          if (currentBox) {
            this.setState({ currentBox })
            this.getTweets(currentBox)
          } else this.setState({ currentBox: null, tweets: [] })
        }
      })
    }

    this.getUsers = next => this.ctx.props.apis.pureRequest('friends', { userId: this.guid }, next)
  }

  willReceiveProps(nextProps) {
  }

  navEnter() {
    const apis = this.ctx.props.apis
    console.log('navEnter', apis)
    const { userUUID } = apis
    const userData = global.config.users.find(u => u.userUUID === userUUID)
    const wxToken = userData && userData.wxToken
    this.guid = apis.account && apis.account.data && apis.account.data.global.id
    const info = this.ctx.props.selectedDevice.info && this.ctx.props.selectedDevice.info.data
    this.station = info && info.connectState === 'CONNECTED' && info
    if (wxToken && this.guid) this.ctx.props.apis.update('wxToken', wxToken, this.refresh)
    else alert('no wxToken')
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
      ipcRenderer={ipcRenderer}
      apis={this.ctx.props.apis}
      primaryColor={this.groupPrimaryColor()}
      getTweets={this.getTweets}
      openSnackBar={openSnackBar}
      refresh={this.refresh}
      getUsers={this.getUsers}
      guid={this.guid}
      station={this.station}
    />)
  }
}

export default Group
