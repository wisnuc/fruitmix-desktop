import Debug from 'debug'
import React from 'react'
import EventListener from 'react-event-listener'
import { Paper, Menu, MenuItem, Divider, IconButton, CircularProgress } from 'material-ui'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import DeviceStorage from 'material-ui/svg-icons/device/storage'
import { blue500, red500, greenA200 } from 'material-ui/styles/colors'
import { sharpCurve, sharpCurveDuration, sharpCurveDelay } from '../common/motion'
import { formatDate } from '../../utils/datetime'

import PhotoToolBar from './PhotoToolBar'
import PhotoList from './PhotoList'

const debug = Debug('component:photoApp:')
const LEFTNAV_WIDTH = 72
const parseDate = (date) => {
  if (!date) return 0
  const b = date.split(/\D/)
  const c = (`${b[0]}${b[1]}${b[2]}${b[3]}${b[4]}${b[5]}`)
  return parseInt(c, 10)
}

class PhotoApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      login: null,
      leftNav: true,
      media: this.props.media
    }

    this.mediaStore = []
    this.photoDates = []
    this.photoMapDates = []
    this.allPhotos = []
    this.force = false

    this.setPhotoInfo = () => {
      // debug('start this.setPhotoInfo', (!this.mediaStore.length || this.force))
      const leftNav = !!this.state.leftNav
      if (!this.mediaStore.length || this.force) {
        /* mediaStore were sorted by date in Node */
        this.mediaStore = this.props.media
        this.photoDates = []
        this.photoMapDates = []
        this.allPhotos = []
        this.force = false
        const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
        const width = leftNav ? clientWidth - 210 - 60 : clientWidth - 60
        let MaxItem = Math.floor(width / 216) - 1
        let lineIndex = 0
        const dateUnknown = []
        this.mediaStore.forEach((item) => {
          if (!item[1].metadata.exifDateTime) {
            dateUnknown.push(item)
            return
          }
          this.allPhotos.push(item)
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
            this.allPhotos.push(item)
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
        leftNav,
        allPhotos: this.allPhotos,
        photoDates: this.photoDates,
        photoMapDates: this.photoMapDates
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.mediaStore.length) return true
    return (this.state !== nextState)
  }

  handleResize = () => {
    this.force = true // force update setPhotoInfo
    this.forceUpdate()
  }

  render() {
    debug('PhotoApp, store.media.data', this.props)
    return (
      <Paper>
        <EventListener
          target="window"
          onResize={this.handleResize}
        />
        {
          this.props.media ?
            <PhotoList
              style={{
                position: 'fixed',
                width: 'calc(100% - 72px)',
                height: 'calc(100% - 64px)',
                left: LEFTNAV_WIDTH,
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              {...this.setPhotoInfo()}
            /> :
            <div
              style={{
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'calc(100% - 72px)',
                height: 'calc(100% - 64px)'
              }}
            >
              <CircularProgress />
            </div>
        }
      </Paper>
    )
  }
}

export default PhotoApp
