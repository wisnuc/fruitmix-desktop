import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import SocialShare from 'material-ui/svg-icons/social/share'

import Base from './Base'

class FileSharedWithOthers extends Base {

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
    return '我分享的文件'
  }

  menuIcon() {
    return SocialShare
  }

  quickName() {
    return '我的分享'
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

export default FileSharedWithOthers

