import React from 'react'
import Radium from 'radium'
import Debug from 'debug'
import { IconButton } from 'material-ui'
import { blue800, indigo700, indigo500, teal500 } from 'material-ui/styles/colors'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'

import Base from './Base'
import PhotoApp from '../photo/PhotoApp'
import { formatDate } from '../../utils/datetime'

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
    this.allPhotos = []
    this.photoDates = []
    this.photoMapDates = []
    this.setPhotoInfo = this.photoInfo.bind(this)
  }

  photoInfo(height, width, media) {
    debug('height, width, media', height, width, media, this)
    /* mediaStore were sorted by date in Node */
    if (this.allPhotos !== media) {
      this.allPhotos = media
      this.photoDates = []
      this.photoMapDates = []
      let MaxItem = Math.floor(width / 216) - 1
      let lineIndex = 0
      const dateUnknown = []
      this.allPhotos.forEach((item) => {
        if (!item[1].metadata.exifDateTime) {
          dateUnknown.push(item)
          return
        }
        const formatExifDateTime = formatDate(item[1].metadata.exifDateTime)
        const isRepeat = this.photoDates[this.photoDates.length - 1] === formatExifDateTime
        if (!isRepeat || MaxItem === 0) {
          MaxItem = Math.floor(width / 216) - 1
          this.photoDates.push(formatExifDateTime)
          this.photoMapDates.push({
            first: !isRepeat,
            index: lineIndex,
            date: formatExifDateTime,
            photos: [item]
          })
          lineIndex += 1
        } else {
          MaxItem -= 1
          this.photoMapDates[this.photoMapDates.length - 1]
            .photos
            .push(item)
        }
      })
      if (dateUnknown.length > 0) {
        MaxItem = 0
        lineIndex += 1
        let isRepeat = false
        dateUnknown.forEach((item) => {
          if (MaxItem === 0) {
            MaxItem = Math.floor(width / 216) - 1
            this.photoDates.push(0)
            this.photoMapDates.push({
              first: !isRepeat,
              index: lineIndex,
              date: '神秘时间',
              photos: [item]
            })
            lineIndex += 1
            isRepeat = true
          } else {
            MaxItem -= 1
            this.photoMapDates[this.photoMapDates.length - 1]
              .photos
              .push(item)
          }
        })
      }
      /* simulate large list */
      for (let i = 1; i <= 0; i++) {
        this.photoMapDates.push(...this.photoMapDates)
      }
    }
    return {
      allPhotos: this.allPhotos,
      photoDates: this.photoDates,
      photoMapDates: this.photoMapDates
    }
  }

  setState(props) {
    this.state = Object.assign({}, this.state, props)
    this.emit('updated', this.state)
  }

  willReceiveProps(nextProps) {
    // console.log('media nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.media) return
    const media = nextProps.apis.media
    if (media.isPending() || media.isRejected()) return

    /* now it's fulfilled */
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

  appBarStyle() {
    return 'colored'
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
    return <PhotoApp media={this.state.media} setPhotoInfo={this.setPhotoInfo} />
  }
}

export default Media
