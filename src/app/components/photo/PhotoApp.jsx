import Debug from 'debug'
import React from 'react'
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

class PhotoApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      login: null,
      leftNav: true,
      media: window.store.getState().media.data
    }

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
      this.mediaStore = window.store.getState().media.data
      const leftNav = !!this.state.leftNav
      const photoDates = []
      const photoMapDates = []
      const allPhotos = []
      const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
      const width = leftNav ? clientWidth - 210 : clientWidth
      // debug('start this.setPhotoInfo', this.mediaStore, this.mediaStore.length)
      this.mediaStore.sort((prev, next) => Date.parse(formatDate(next.exifDateTime)) - Date.parse(formatDate(prev.exifDateTime)))
      let MaxItem = Math.floor(width / 156) - 1
      let lineIndex = 0
      const dateUnknown = []
      this.mediaStore.forEach((item) => {
        allPhotos.push(item)
        if (!item.exifDateTime) {
          dateUnknown.push(item)
          return
        }
        const formatExifDateTime = formatDate(item.exifDateTime)
        const isRepeat = photoDates.findIndex(Item => Item === formatExifDateTime) >= 0
        if (!isRepeat || MaxItem === 0) {
          MaxItem = Math.floor(width / 156) - 1
          photoDates.push(formatExifDateTime)
          photoMapDates.push({
            first: !isRepeat,
            index: lineIndex,
            date: formatExifDateTime,
            photos: [item]
          })
          lineIndex += 1
        } else {
          MaxItem -= 1
          photoMapDates
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
          if (MaxItem === 0) {
            MaxItem = Math.floor(width / 156) - 1
            photoMapDates.push({
              first: !isRepeat,
              index: lineIndex,
              date: '神秘时间',
              photos: [item]
            })
            lineIndex += 1
            isRepeat = true
          } else {
            MaxItem -= 1
            photoMapDates
              .find(Item => Item.index === (lineIndex - 1))
              .photos
              .push(item)
          }
        })
      }
      for (let i = 1; i <= 0; i++) {
        photoMapDates.push(...photoMapDates)
      }
      return {
        leftNav,
        allPhotos,
        photoDates,
        photoMapDates
      }
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    debug('In shouldComponentUpdate', window.store.getState().media.data !== this.mediaStore, this.state !== nextState, this.mediaStore)
    if (window.store.getState().media.data !== this.mediaStore) return true
    return (this.state !== nextState)
  }

  render() {
    debug('render photoapp state, props', this.state, this.props)
    return (
      <Paper>
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
