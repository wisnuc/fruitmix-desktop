import React from 'react'
import UUID from 'uuid'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import { IconButton } from 'material-ui'
import InboxIcon from 'material-ui/svg-icons/content/inbox'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

import Base from './Base'
import FlatButton from '../common/FlatButton'
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

    this.first = true

    this.getMsg = (t, box) => {
      if (t.type !== 'boxmessage') return ''
      let text = ''
      const getName = id => (box.users.find(u => u.id === id) || {}).nickName
      try {
        const data = JSON.parse(t.comment)
        const { op, value } = data
        switch (op) {
          case 'createBox':
            text = i18n.__('%s Create Box', getName(value[0]))
            break
          case 'deleteUser':
            text = ''
            break
          case 'addUser':
            if (getName(value[0])) text = i18n.__('User %s Entered Box', getName(value[0]))
            break
          case 'changeBoxName':
            text = i18n.__('Box Name Changed to %s', value[1])
            break
          default:
            text = ''
        }
      } catch (e) {
        console.log('parse msg error', e)
      }
      return text
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
            ? `[${i18n.__('%s Files', list.length)}]` : tweet.type === 'boxmessage'
            ? this.getMsg(tweet, b) : tweet.comment
          const user = b.users.find(u => u.id === tweet.tweeter)
          const nickName = user && user.nickName
          /* box message, nickName + content, '' */
          b.lcomment = tweet.type === 'boxmessage' ? comment : nickName ? `${nickName} : ${comment}` : ''
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
          const getAuthor = id => box.users.find(u => u.id === id) || { id, nickName: i18n.__('Leaved Member') }
          tweets.push(...res.filter(t => t.list && t.list.length)
            .map(t => Object.assign({ box, author: getAuthor(t.tweeter.id) }, t)))
        }
        if (!count) {
          this.setState({ tweets: tweets.sort((a, b) => b.ctime - a.ctime).slice(0, 10) })
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
        // console.log('boxes', err, res)
        if (err && !Array.isArray(res)) this.setState({ error: 'refresh' })
        else this.getInboxes(res)
      })
    }

    this.startMqtt = () => {
      const clientId = `client_pc_${this.guid}`
      const topic = `client/user/${this.guid}/box`
      const sess = UUID.v4()
      ipcRenderer.send('START_MQTT', { clientId, topic, session: sess })
      ipcRenderer.on('MQTT_MSG', (event, res) => {
        const { session, msg } = res
        if (session !== sess) return
        this.onMessage(msg)
      })
      this.onMqtt = true
    }

    this.onMessage = (msg) => {
      // console.log('this.onMessage', msg)
      this.refresh()
    }
  }

  willReceiveProps(nextProps) {
    if (!this.state.account) this.handleProps(nextProps.apis, ['account'])
    if (this.first && this.state.account) {
      this.navEnter()
      this.first = false
      // console.log('willReceiveProps', this.wxToken, this.guid, this.ctx)
      if (!this.wxToken || !this.guid) setImmediate(() => this.ctx.navToBound('home'))
    }
  }

  navEnter() {
    const apis = this.ctx.props.apis
    if (!apis || !apis.account || !apis.account.data) return
    // console.log('navEnter', apis)
    const { userUUID } = apis
    const userData = global.config.users.find(u => u.userUUID === userUUID)
    this.wxToken = userData && userData.wxToken
    this.guid = apis.account && apis.account.data && apis.account.data.global && apis.account.data.global.id
    const info = this.ctx.props.selectedDevice.info && this.ctx.props.selectedDevice.info.data
    /* logged station */
    this.station = info && info.connectState === 'CONNECTED' && info
    // console.log('this.wxToken && this.guid', this.wxToken, this.guid, this.station)
    if (this.wxToken && this.guid) {
      this.ctx.props.apis.update('wxToken', this.wxToken, this.refresh)
      if (!this.onMqtt) this.startMqtt()
    } else this.setState({ error: this.guid ? 'Token' : 'WeChat' })
  }

  navLeave() {
    this.onMqtt = false
  }

  navGroup() {
    return 'box'
  }

  menuName() {
    return i18n.__('Inbox Menu Name')
  }

  menuIcon() {
    return InboxIcon
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

  renderDefaultError() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#FAFAFA'
          }}
        >
          <ErrorIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} />
          <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.27)', width: 320, textAlign: 'center' }}>
            {
              this.state.error === 'WeChat' ? i18n.__('No WeChat Account Error in Box') :
              this.state.error === 'Token' ? i18n.__('Token Expired Error in Box') :
              i18n.__('Error in Base Text')
            }
          </div>
          {
            this.state.error === 'WeChat' &&
              <FlatButton
                label={i18n.__('Jump to Bind WeChat')}
                primary
                onTouchTap={() => this.ctx.navTo('account')}
              />
          }
        </div>
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
