import React from 'react'
import Radium from 'radium'
import Debug from 'debug'
import { IconButton } from 'material-ui'
import { blue800, indigo700, indigo500, teal500 } from 'material-ui/styles/colors'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'

import Base from './Base'
import PhotoApp from '../photo/PhotoApp'

const debug = Debug('component:viewModel:Media: ')
const parseDate = (date) => {
  if (!date) return 0
  const a = date.replace(/:|\s/g, '')
  return parseInt(a, 10)
}

class Media extends Base {

  constructor(ctx) {
    super(ctx)
    this.state = {
      media: null
    }
  }

  setState(props) {
    this.state = Object.assign({}, this.state, props)
    this.emit('updated', this.state)
  }

  willReceiveProps(nextProps) {
    console.log('media nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.media) return
    const media = nextProps.apis.media
    if (media.isPending() || media.isRejected()) return

    // now it's fulfilled
    const value = media.value()

    /* sort photos by date */
    value.sort((prev, next) => (parseDate(next[1].metadata.exifDateTime) - parseDate(prev[1].metadata.exifDateTime)) || (
      parseInt(`0x${next[0]}`, 16) - parseInt(`0x${prev[0]}`, 16)))

    if (value !== this.state.media) {
      debug('media.value()', value)

      this.setState({ media: value })
    }
  }

  navEnter() {
    console.log('home enter')
  }

  navLeave() {
    console.log('home leave')
  }

  navGroup() {
    return 'media'
  }

  menuName() {
    return '我的照片'
  }

  menuIcon() {
    return PhotoIcon
  }

  quickName() {
    return '照片'
  }

  quickIcon() {
    return PhotoIcon
  }

  appBarStyle() {
    return 'colored'
  }

  appBarColor() {
    return teal500
  }

  primaryColor() {
    return teal500
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

  renderTitle({ style }) {
    return (
      <div style={style}>
        我的照片
      </div>
    )
  }

  renderToolBar({ style }) {
    return (
      <div style={style}>
        <IconButton></IconButton>
      </div>
    )
  }

  renderDetail({ style }) {
  }

  renderContent() {
    return <PhotoApp media={this.state.media} />
  }
}

export default Media
