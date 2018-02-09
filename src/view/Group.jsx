import React from 'react'
import UUID from 'uuid'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import { IconButton } from 'material-ui'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

import Box from './Box'
import FlatButton from '../common/FlatButton'
import { combineElement, removeElement } from '../common/array'
import Groups from '../box/Groups'
import BoxDetail from '../box/BoxDetail'

class Group extends Box {
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
      console.log('this.getTweets', box)
      this.ctx.props.apis.pureRequest('tweets', { boxUUID: box.uuid, stationId: box.stationId }, (err, tweets) => {
        console.log('tweets', tweets)
        if (!err) {
          this.setState({ tweets: (tweets || []).map(t => Object.assign({ author: getAuthor(t.tweeter.id), box }, t)), currentBox: box })
        } else console.log('get tweets error', err, tweets)
      })
    }

    this.refresh = () => {
      this.ctx.props.apis.pureRequest('boxes', null, (err, res) => {
        const boxes = Array.isArray(res) && res.filter(b => b && b.station && !!b.station.isOnline)
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

    this.updateFakeTweet = ({ fakeList, boxUUID }) => {
      if (!this.state.currentBox || this.state.currentBox.uuid !== boxUUID || !this.state.tweets) return
      console.log('this.updateFakeTweet', fakeList, boxUUID, this.state.currentBox, this.state, this.props)
      const author = this.state.currentBox.users.find(u => u.id === this.guid) || { id: this.guid }
      const tweet = {
        author,
        box: this.state.currentBox,
        comment: '',
        ctime: (new Date()).getTime(),
        index: this.state.tweets.length,
        list: fakeList,
        type: 'list',
        uuid: (new Date()).getTime()
      }
      this.setState({ tweets: [...this.state.tweets, tweet] })
    }
  }

  willReceiveProps(nextProps) {
    // console.log('Group willReceiveProps', nextProps, this.state)
    // if (!this.state.account) this.handleProps(nextProps.apis, ['account'])
  }

  navGroup() {
    return 'group'
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
