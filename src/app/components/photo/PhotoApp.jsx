import Debug from 'debug'
import React from 'react'
import EventListener from 'react-event-listener'
import { Paper, Menu, MenuItem, Divider, IconButton } from 'material-ui'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import DeviceStorage from 'material-ui/svg-icons/device/storage'
import { blue500, red500, greenA200 } from 'material-ui/styles/colors'
import { sharpCurve, sharpCurveDuration, sharpCurveDelay } from '../common/motion'
import { formatDate } from '../../utils/datetime'

import PhotoToolBar from './PhotoToolBar'
import PhotoList from './PhotoList'

const debug = Debug('component:photoApp:')
const LEFTNAV_WIDTH = 210
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
      leftNav: false,
      media: window.store.getState().media.data
    }

    this.mediaStore = []
    this.photoDates = []
    this.photoMapDates = []
    this.allPhotos = []
    this.force = false

    this.toggleLeftNav = () => this.setState({ leftNav: !this.state.leftNav })

    this.renderLeftNav = () => (
      <Paper
        style={{
          width: LEFTNAV_WIDTH,
          height: 'calc(100% - 56px)',
          backgroundColor: '#EEEEEE',
          position: 'absolute',
          left: this.state.leftNav ? 0 : -1 * LEFTNAV_WIDTH,
          top: 56,
          transition: sharpCurve('left')
        }}
        transitionEnabled={false}
        rounded={false}
        zDepth={this.state.leftNav ? 1 : 0}
      >
        {/* debug('this.renderLeftNav', 'this.state.leftNav', this.state.leftNav)*/}
        {/* 导航条 */}

        {/* 左侧菜单 */}
        <Menu
          autoWidth={false}
          width={LEFTNAV_WIDTH}
        >
          <MenuItem
            primaryText="照片" leftIcon={<DeviceStorage />}
            innerDivStyle={{ fontSize: 14, fontWeight: 500, opacity: 0.87 }}
          />
          <Divider />
          <MenuItem
            primaryText="相册" leftIcon={<DeviceStorage />}
            innerDivStyle={{ fontSize: 14, fontWeight: 500, opacity: 0.87 }}
          />
          <Divider />
          <MenuItem
            primaryText="分享" leftIcon={<DeviceStorage />}
            innerDivStyle={{ fontSize: 14, fontWeight: 500, opacity: 0.87 }}
          />
        </Menu>
      </Paper>
    )

    this.setPhotoInfo = () => {
      const leftNav = !!this.state.leftNav
      if (!this.mediaStore.length || this.force) {
        this.mediaStore = window.store.getState().media.data
        this.photoDates = []
        this.photoMapDates = []
        this.allPhotos = []
        this.force = false
        const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
        const width = leftNav ? clientWidth - 210 - 60 : clientWidth - 60
        debug('start sort', this.mediaStore)
        this.mediaStore.sort((prev, next) => (parseDate(next.exifDateTime) - parseDate(prev.exifDateTime)) || (
          parseInt(`0x${next.digest}`, 16) - parseInt(`0x${prev.digest}`, 16)))
        debug('finish sort', this.mediaStore)
        let MaxItem = Math.floor(width / 216) - 1
        // debug('MaxItem', MaxItem)
        let lineIndex = 0
        const dateUnknown = []
        this.mediaStore.forEach((item) => {
          if (!item.exifDateTime) {
            dateUnknown.push(item)
            return
          }
          this.allPhotos.push(item)
          const formatExifDateTime = formatDate(item.exifDateTime)
          const isRepeat = this.photoDates.findIndex(Item => Item === formatExifDateTime) >= 0
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
            this.photoMapDates
              .find(Item => Item.index === (lineIndex - 1))
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
              this.photoMapDates
                .find(Item => Item.index === (lineIndex - 1))
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
    if (!window.store.getState().media.data.length) return true
    return (this.state !== nextState)
  }

  handleResize = () => {
    this.force = true // force update setPhotoInfo
    this.forceUpdate()
  }

  render() {
    debug('PhotoApp, this.photoMapDates', this.photoMapDates)
    return (
      <Paper>
        <EventListener
          target="window"
          onResize={this.handleResize}
        />
        <this.renderLeftNav />
        <PhotoList
          style={{
            position: 'fixed',
            paddingTop: 56,
            width: this.state.leftNav ? 'calc(100% - 210px)' : '100%',
            height: '100%',
            left: this.state.leftNav ? LEFTNAV_WIDTH : 0,
            backgroundColor: '#FFFFFF',
            transition: sharpCurve('left'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          {...this.setPhotoInfo()}
        />
        <PhotoToolBar
          action={this.toggleLeftNav}
          state={['照片']}
        />
      </Paper>
    )
  }
}

export default PhotoApp
