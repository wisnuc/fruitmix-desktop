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

/* increase limit of listeners of EventEmitter */
ipcRenderer.setMaxListeners(1000)

class Group extends Base {
  constructor(ctx) {
    super(ctx)
    this.state = {
      tweets: [],
      boxes: null
    }

    this.getTweets = (args) => {
      this.ctx.props.apis.pureRequest('tweets', { boxUUID: args.boxUUID }, (err, res) => {
        if (!err && res && res.body) this.setState({ tweets: res.body })
        else console.log('get tweets error', err, res && res.body)
      })
    }

    this.localUpload = (args) => {
      const { type, comment, boxUUID } = args
      const session = UUID.v4()
      this.ctx.props.ipcRenderer.send('BOX_UPLOAD', { session, type, comment, boxUUID, bToken: this.state.boxToken.token })
    }
  }

  willReceiveProps(nextProps) {
    this.handleProps(nextProps.apis, ['boxToken'])
  }

  navEnter() {
    const a = this.ctx.props.apis.account
    const guid = a && a.data && a.data.global && a.data.global.id
    this.ctx.props.apis.request('boxToken', { guid }, () => {
      this.ctx.props.apis.pureRequest('boxes', null, (err, res) => {
        console.log('boxes', err, res && res.body)
        if (!err && res && res.body) this.setState({ boxes: res.body })
        if (!err && res && res.body && res.body[0]) this.getTweets({ boxUUID: res.body[0].uuid })
      })
    })
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

  renderContent() {
    return (<Groups
      {...this.state}
      localUpload={this.localUpload}
      ipcRenderer={ipcRenderer}
      apis={this.ctx.props.apis}
      primaryColor={this.groupPrimaryColor()}
      getTweets={this.getTweets}
    />)
  }
}

export default Group
