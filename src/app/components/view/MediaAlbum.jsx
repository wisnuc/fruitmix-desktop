import React, { Component, PureComponent } from 'react'
import Radium from 'radium'

import ImagePhotoAlbum from 'material-ui/svg-icons/image/photo-album'

import Base from './Base'

class MediaAlbum extends Base {

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
    return 'media'
  }

  menuName() {
    return '相册'
  }

  menuIcon() {
    return ImagePhotoAlbum
  }

  appBarStyle() {
    return 'colored'
  }

  prominent() {
    return false
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

export default MediaAlbum

