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
      leftNav: true
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

    this.reduce = (target_array, num) => {
      const temp = []
      return target_array.reduce((pre, cur, index) => {
        const ar = Math.floor(index / num)
        if (!temp[ar]) {
          temp[ar] = []
        }
        temp[ar].push(cur)
        return temp
      }, 0)
    }

    this.setPhotoInfo = () => {
      const leftNav = !!this.state.leftNav
      const mediaStore = window.store.getState().media.data
      const photoDates = []
      const photoMapDates = []
      const allPhotos = []
      const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
      const width = leftNav ? clientWidth - 210 : clientWidth
      mediaStore.sort((prev, next) => Date.parse(next.date) - Date.parse(prev.date))
      let MaxItem = Math.floor(width / 156) - 1
      let lineIndex = 0
      mediaStore.forEach((item, index) => {
        if (!item.exifDateTime) return null
        allPhotos.push(item)
        const formatExifDateTime = formatDate(item.exifDateTime)
        const isRepeat = photoDates.findIndex(Item => Item === formatExifDateTime) >= 0
        if (!isRepeat || MaxItem === 0) {
          MaxItem = Math.floor(width / 156) - 1
          photoDates.push(formatExifDateTime)
          photoMapDates.push({
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
        /*
      mediaStore.forEach((item, index) => {
        if (!item.exifDateTime) { return }
        allPhotos.push(item)
        const formatExifDateTime = formatDate(item.exifDateTime)
        const isRepeat = photoDates.findIndex(Item => Item === formatExifDateTime) >= 0
        if (!isRepeat || MaxItem === 0) {
          MaxItem = Math.floor(width / 156)
          photoDates.push(formatExifDateTime)
          photoMapDates.push({
            date: formatExifDateTime,
            photos: [item]
          })
        } else {
          MaxItem -= 1
          debug('MaxItem', MaxItem)
          photoMapDates
          .find(Item => Item.date === formatExifDateTime)
          .photos
          .push(item)
        }
      })
        */
      for (let i = 1; i <= 0; i++) {
        photoMapDates.push(...photoMapDates)
      }
      debug('render photoapp mediaStore, allPhotos, photoMapDates', mediaStore, allPhotos, photoMapDates, MaxItem)
      return {
        leftNav,
        allPhotos,
        photoDates,
        // photoMapDates
        photoMapDates: photoMapDates.sort((prev, next) => Date.parse(next.date) - Date.parse(prev.date))
      }
    }
  }

  render() {
    // debug('render photoapp state, props', this.state, this.props)
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
            transition: sharpCurve('left')
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
