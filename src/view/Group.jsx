import React from 'react'
import UUID from 'uuid'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import { IconButton } from 'material-ui'
import GroupIcon from 'material-ui/svg-icons/social/group'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh'

import Base from './Base'
import FlatButton from '../common/FlatButton'
import Groups from '../box/Groups'
import BoxDetail from '../box/BoxDetail'
import Adapter from '../common/adapter'

class Group extends Base {
  constructor (ctx) {
    super(ctx)
    this.state = {
      boxes: null,
      currentBox: null
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
            text = i18n.__('%s Create Box', getName(box.owner))
            break
          case 'deleteUser':
            text = ''
            break
          case 'addUser':
            if (getName(value[0])) text = i18n.__('User %s Entered Box', value.map(v => getName(v)).filter(v => !!v).join('", "'))
            break
          case 'changeBoxName':
            text = i18n.__('Box Name Changed to %s', value[1])
            break
          default:
            text = ''
        }
      } catch (e) {
        console.error('parse msg error', e)
      }
      return text
    }

    this.processBox = (d) => {
      if (!d || !d[0]) return []

      d.forEach((b) => {
        const { ltsst, ctime, owner, users } = b
        if (ltsst) { // the latest stored tweet's index
          b.ltime = ltsst.ctime
          const list = ltsst.list
          const isMedia = list && list.length && list.every(l => l.metadata)
          const comment = isMedia ? `[${i18n.__('%s Photos', list.length)}]` : list && list.length
            ? `[${i18n.__('%s Files', list.length)}]` : ltsst.type === 'boxmessage'
              ? this.getMsg(ltsst, b) : ltsst.comment
          const user = b.users.find(u => u.id === (ltsst.tweeter && ltsst.tweeter.id))
          const nickName = user && user.nickName
          /* box message, nickName + content, '' */
          b.lcomment = ltsst.type === 'boxmessage' ? comment : nickName ? `${nickName} : ${comment}` : ''
        } else {
          b.ltime = ctime
          b.lcomment = i18n.__('New Group Text')
        }
        b.wxToken = this.wxToken
        b.guid = this.guid

        /* move owner to the first pos */
        const i = users.findIndex(u => u.id === owner)
        if (i > -1) b.users = [users[i], ...users.slice(0, i), ...users.slice(i + 1)]
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

    this.reqData = () => {}

    this.initDB = () => {
      const props = { guid: this.guid, reqAsync: this.ctx.props.apis.pureRequestAsync, boxDir: this.boxDir }
      this.ada = new Adapter(props)
      this.ada.init()
      this.ada.on('boxes', this.updateBoxes) // req success and boxes changed
      this.ada.on('reqBoxSuccess', this.onReqBoxSuccess) // req success and boxes do not change
    }

    this.selectBox = (index) => {
      const currentBox = this.state.boxes && this.state.boxes[index]
      if (currentBox) this.setState({ currentBox })
      else this.setState({ currentBox: null })
    }

    this.onReqBoxSuccess = () => {
      this.setState({ boxLoading: false, boxError: null })
    }

    this.updateBoxes = (prev, curr) => {
      // console.log('this.updateBoxes', curr, this.op)
      const boxes = curr.boxes
      this.setState({ boxes: this.processBox(boxes), boxError: null, boxLoading: false })
      const boxUUID = this.op && this.op.boxUUID
      const delBox = this.op && this.op.delBox
      if (boxUUID) {
        const currentBox = boxes.find(b => b.uuid === boxUUID)
        this.op = null
        this.setState({ currentBox })
      } else if (delBox) {
        this.setState({ currentBox: null })
      } else if (this.state.currentBox) {
        const currentBox = boxes.find(b => b.uuid === this.state.currentBox.uuid) || null
        this.setState({ currentBox })
      }
    }

    /* handle req box failed */
    this.handleBoxesError = (e) => {
      console.error('reqBoxes error', e)
      this.setState({ boxError: e, boxLoading: false })
    }

    this.refresh = (op) => {
      // console.log('this.refresh op', op)
      if (op) this.op = op
      this.setState({ boxLoading: true })
      this.ada.reqBoxes().catch(this.handleBoxesError)
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
      if (Array.isArray(msg) && msg.length === 1) this.ada.updateSingleBoxes(msg[0]).catch(this.handleBoxesError)
      else this.refresh()
    }

    this.getUsers = next => this.ctx.props.apis.pureRequest('friends', { userId: this.guid }, next)
  }

  willReceiveProps (nextProps) {
    if (!this.state.account) this.handleProps(nextProps.apis, ['account'])
    else if (this.first) {
      this.first = false
      this.navEnter()
      if (!this.wxToken || !this.guid) setImmediate(() => this.ctx.navToBound('home'))
    }
  }

  navEnter () {
    const apis = this.ctx.props.apis
    if (!apis || !apis.account || !apis.account.data || !this.state.account) return
    const { userUUID } = apis
    const userData = global.config.users.find(u => u.userUUID === userUUID)
    this.boxDir = global.config.boxPath
    this.wxToken = userData && userData.wxToken
    this.guid = apis.account && apis.account.data && apis.account.data.global && apis.account.data.global.id
    const info = this.ctx.props.selectedDevice.info && this.ctx.props.selectedDevice.info.data

    /* logged station */
    this.station = info && info.connectState === 'CONNECTED' && info
    if (this.wxToken && this.guid) {
      if (this.state.error) this.setState({ error: null })
      this.initDB()
      this.ctx.props.apis.update('wxToken', this.wxToken, this.refresh)
      if (!this.onMqtt) this.startMqtt()
    } else this.setState({ error: this.guid ? 'Token' : 'WeChat' })
  }

  navLeave () {
    this.first = true
    this.onMqtt = false
    if (this.ada) {
      this.ada.removeAllListeners('boxes')
      this.ada.removeAllListeners('onReqBoxSuccess')
    }
    this.ada = null
    ipcRenderer.removeAllListeners('MQTT_MSG')
  }

  navGroup () {
    return 'group'
  }

  menuName () {
    return i18n.__('Group Menu Name')
  }

  menuIcon () {
    return GroupIcon
  }

  quickName () {
    return i18n.__('Group Quick Name')
  }

  appBarStyle () {
    return 'colored'
  }

  hasDetail () {
    return true
  }

  detailEnabled () {
    return true
  }

  renderTitle ({ style }) {
    return <div style={style}>{this.menuName()}</div>
  }

  renderNavigationMenu ({ style, onTouchTap }) {
    return (
      <div style={style}>
        <IconButton onTouchTap={onTouchTap}>
          <NavigationMenu color="#FFF" />
        </IconButton>
      </div>
    )
  }

  renderToolBar ({ style }) {
    return (
      <div style={style}>
        <IconButton onTouchTap={() => this.refresh()} tooltip={i18n.__('Refresh')} >
          <RefreshIcon color="#FFF" />
        </IconButton>
      </div>
    )
  }

  renderDetail ({ style }) {
    return (
      <div
        style={style}
        key={this.state.currentBox && (this.state.currentBox.users.length + this.state.currentBox.users.name)}
      >
        <BoxDetail
          ada={this.ada}
          guid={this.guid}
          refresh={this.refresh}
          selectBox={this.selectBox}
          box={this.state.currentBox}
          apis={this.ctx.props.apis}
          primaryColor={this.groupPrimaryColor()}
          openSnackBar={msg => this.ctx.openSnackBar(msg)}
          getUsers={this.getUsers}
        />
      </div>
    )
  }

  renderDefaultError () {
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
              this.state.error === 'WeChat' ? i18n.__('No WeChat Account Error in Box')
                : this.state.error === 'Token' ? i18n.__('Token Expired Error in Box')
                  : i18n.__('Error in Base Text')
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

  renderContent ({ openSnackBar }) {
    return (<Groups
      {...this.state}
      ada={this.ada}
      getMsg={this.getMsg}
      selectBox={this.selectBox}
      ipcRenderer={ipcRenderer}
      apis={this.ctx.props.apis}
      primaryColor={this.groupPrimaryColor()}
      openSnackBar={openSnackBar}
      refresh={this.refresh}
      getUsers={this.getUsers}
      guid={this.guid}
      station={this.station}
    />)
  }
}

export default Group
