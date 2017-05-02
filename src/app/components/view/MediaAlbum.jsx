import React, { Component, PureComponent } from 'react'
import Radium from 'radium'
import { ipcRenderer } from 'electron'

import ImagePhotoAlbum from 'material-ui/svg-icons/image/photo-album'

import Base from './Base'
import AlbumApp from '../album/AlbumApp'

class MediaAlbum extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = {}
  }

  willReceiveProps(nextProps) { 
    // console.log('media nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.media) return
    const media = nextProps.apis.media
    if (media.isPending() || media.isRejected()) return

    /* now it's fulfilled */
    const value = media.value()
    this.apis = nextProps.apis
    // debug('media before sort', media.value())

    if (value !== this.state.media) {
      // debug('media.value()', value)
      this.setState({ media: value })
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
      media={this.state.media}
      ipcRenderer={ipcRenderer}
      apis={this.apis}
      {...this.props}
    />)
  }
}

export default MediaAlbum

