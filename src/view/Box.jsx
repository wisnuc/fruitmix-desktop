import React from 'react'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import { IconButton } from 'material-ui'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

import Base from './Base'
import FlatButton from '../common/FlatButton'
import { combineElement, removeElement } from '../common/array'
import Inbox from '../box/Inbox'

/* increase limit of listeners of EventEmitter */
ipcRenderer.setMaxListeners(1000)

class Box extends Base {
  constructor(ctx) {
    super(ctx)
    this.state = {
      boxes: null,
      tweets: null
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
        b.wxToken = this.wxToken
      })
      d.sort((a, b) => (b.ltime - a.ltime))
      return d
    }

    this.setAnimation = (component, status) => {
      if (component === 'NavigationMenu') {
        /* add animation to NavigationMenu */
        const transformItem = this.refNavigationMenu
        const time = 0.4
        const ease = global.Power4.easeOut
        if (status === 'In') {
          TweenMax.to(transformItem, time, { rotation: 180, opacity: 1, ease })
        }
        if (status === 'Out') {
          TweenMax.to(transformItem, time, { rotation: -180, opacity: 0, ease })
        }
      }
    }

    this.getInboxes = (boxes) => {
      this.setState({ tweets: boxes.length ? null : [], boxes: this.processBox(boxes) })
      let count = boxes.length
      const tweets = []
      const callback = (err, res, box) => {
        count -= 1
        if (!err && res) {
          const getAuthor = id => box.users.find(u => u.id === id) || { id, nickName: '已退群' }
          tweets.push(...res.filter(t => t.list && t.list.length)
            .map(t => Object.assign({ box, author: getAuthor(t.tweeter.id) }, t)))
        }
        if (!count) {
          this.setState({ tweets: tweets.sort((a, b) => b.ctime - a.ctime) })
        }
      }
      for (let i = 0; i < boxes.length; i++) {
        this.ctx.props.apis.pureRequest(
          'tweets',
          { boxUUID: boxes[i].uuid, stationId: boxes[i].stationId },
          (err, res) => callback(err, res, boxes[i])
        )
      }
    }

    this.refresh = () => {
      this.ctx.props.apis.pureRequest('boxes', null, (err, res) => {
        console.log('boxes', err, res)
        if (err && !res) this.setState({ error: 'refresh' })
        else this.getInboxes(res.filter(b => b && b.station && !!b.station.isOnline))
      })
    }
  }

  willReceiveProps(nextProps) {
  }

  navEnter() {
    const apis = this.ctx.props.apis
    console.log('navEnter', apis)
    const { userUUID } = apis
    const userData = global.config.users.find(u => u.userUUID === userUUID)
    this.wxToken = userData && userData.wxToken
    this.guid = apis.account && apis.account.data && apis.account.data.global.id
    if (this.wxToken && this.guid) this.ctx.props.apis.update('wxToken', this.wxToken, this.refresh)
    else alert('no wxToken')
  }

  navLeave() {
  }

  navGroup() {
    return 'box'
  }

  menuName() {
    return i18n.__('Inbox Menu Name')
  }

  menuIcon() {
    return PhotoIcon
  }

  quickName() {
    return i18n.__('Inbox Quick Name')
  }

  appBarStyle() {
    return 'light'
  }

  prominent() {
    return false
  }

  hasDetail() {
    return false
  }

  detailEnabled() {
    return true
  }

  detailWidth() {
    return 400
  }

  renderNavigationMenu({ style, onTouchTap }) {
    const CustomStyle = Object.assign(style, { opacity: 1 })
    return (
      <div style={CustomStyle} ref={ref => (this.refNavigationMenu = ref)}>
        <IconButton onTouchTap={onTouchTap}>
          <NavigationMenu color="rgba(0,0,0,0.54)" />
        </IconButton>
      </div>
    )
  }

  renderTitle({ style }) {
    const newStyle = Object.assign(style, { color: 'rgba(0,0,0,0.54)' })
    return (
      <div style={newStyle}>
        { i18n.__('Inbox Title') }
        { !!this.data && ` (${this.data.length})` }
      </div>
    )
  }

  renderContent() {
    return (<Inbox
      boxes={this.state.boxes}
      tweets={this.state.tweets}
      ipcRenderer={ipcRenderer}
      apis={this.ctx.props.apis}
      setAnimation={this.setAnimation}
      memoize={this.memoize}
      primaryColor={this.groupPrimaryColor()}
    />)
  }
}

export default Box
