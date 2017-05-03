import React, { Component, PureComponent } from 'react'
import Radium from 'radium'
import { ipcRenderer } from 'electron'

import ImagePhotoAlbum from 'material-ui/svg-icons/image/photo-album'

import Base from './Base'
import AlbumApp from '../photo/AlbumApp'

class MediaAlbum extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = {}
  }

  willReceiveProps(nextProps) { 
    // console.log('media nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.mediaShare) return
    const mediaShare = nextProps.apis.mediaShare
    if (mediaShare.isPending() || mediaShare.isRejected()) return

    /* now it's fulfilled */
    const value = mediaShare.value()
    this.apis = nextProps.apis
    // debug('media before sort', media.value())

    if (value !== this.state.mediaShare) {
      // debug('media.value()', value)
      this.setState({ mediaShare: value })
    }
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
    return (<AlbumApp
      mediaShare={this.state.mediaShare}
      ipcRenderer={ipcRenderer}
      apis={this.apis}
    />)
  }
}

export default MediaAlbum

