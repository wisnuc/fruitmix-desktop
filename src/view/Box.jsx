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
        b.ltime = b.ctime
        b.lcomment = Array.from({ length: Math.random() * 10 })
          .map(() => String.fromCharCode(0x674e - Math.random() * 100))
      })
      return [...d].sort((a, b) => (b.ltime - a.ltime))
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
      const callback = (err, res, boxUUID) => {
        console.log('callback', count, boxUUID)
        count -= 1
        if (!err && res) {
          tweets.push(...res.filter(t => t.list).map(t => Object.assign({ boxUUID }, t)))
        }
        if (!count) {
          this.setState({ tweets: tweets.sort((a, b) => b.ctime - a.ctime) })
        }
      }
      for (let i = 0; i < boxes.length; i++) {
        this.ctx.props.apis.pureRequest('tweets', { boxUUID: boxes[i].uuid }, (err, res) => callback(err, res, boxes[i].uuid))
      }
    }

    this.refresh = () => {
      this.ctx.props.apis.pureRequest('boxes', null, (err, res) => {
        console.log('boxes', err, res)
        if (err && !res) this.setState({ error: 'refresh' })
        else this.getInboxes(res)
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
