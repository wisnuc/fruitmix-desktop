import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import SocialPeople from 'material-ui/svg-icons/social/people'

import Base from './Base'

class FileSharedWithMe extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = {}
  }

  willReceiveProps(nextProps) { 
  }

  navEnter() {
  }

  navLeave() {
  }

  navGroup() {
    return 'file'
  }

  menuName() {
    return '分享给我的文件'
  }

  menuIcon() {
    return SocialPeople
  }

  quickName() {
    return '分享给我'
  }

  appBarStyle() {
    return 'colored'
  }

  prominent() {
    return true
  }

  hasDetail() {
    return true
  }

  detailEnabled() {
    return true
  }


  /** renderers **/
  renderContent() {

    return (
      <div style={{width: '100%', height: '100%'}}>
        hello
      </div>
    )
  }
}

export default FileSharedWithMe

