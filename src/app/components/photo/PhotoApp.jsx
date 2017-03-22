import Debug from 'debug'
import React from 'react'
import { Menu, MenuItem, Divider } from 'material-ui'
import IconButton from 'material-ui/IconButton'
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
      <div
        style={{
          width: LEFTNAV_WIDTH,
          height: 'calc(100% - 56px)',
          backgroundColor: '#EEEEEE',
          position: 'absolute',
          left: this.state.leftNav ? 0 : -1 * LEFTNAV_WIDTH,
          top: 56,
          transition: sharpCurve('left'),
          zIndex: 1000
        }}
        transitionEnabled={false}
        rounded={false}
        zDepth={this.state.leftNav ? 3 : 0}
      >
        {debug('this.renderLeftNav', 'this.state.leftNav', this.state.leftNav)}
        {/* 导航条 */}

        {/* 左侧菜单 */}
        <Menu
          autoWidth={false}
          width={LEFTNAV_WIDTH}
        >
          <MenuItem
            primaryText="照片" leftIcon={<DeviceStorage />}
            innerDivStyle={{ fontSize: 14, fontWeight: 'medium', opacity: 0.87 }}
          />
          <Divider />
          <MenuItem
            primaryText="相册" leftIcon={<DeviceStorage />}
            innerDivStyle={{ fontSize: 14, fontWeight: 'medium', opacity: 0.87 }}
          />
          <Divider />
          <MenuItem
            primaryText="分享" leftIcon={<DeviceStorage />}
            innerDivStyle={{ fontSize: 14, fontWeight: 'medium', opacity: 0.87 }}
          />
        </Menu>
      </div>
    )
  }

  setPhotoInfo() {
    const mediaStore = window.store.getState().media.data
    const photoDates = []
    const photoMapDates = []
    const allPhotos = []

    mediaStore.forEach((item, index) => {
      if (!item.exifDateTime) { return }

      allPhotos.push(item)

      const formatExifDateTime = formatDate(item.exifDateTime)
      const isRepeat = photoDates.findIndex(item => item === formatExifDateTime) >= 0

      if (!isRepeat) {
        photoDates.push(formatExifDateTime)
        photoMapDates.push({
          date: formatExifDateTime,
          photos: [item]
        })
      } else {
        photoMapDates
          .find(item => item.date === formatExifDateTime)
          .photos
          .push(item)
      }
    })

    return {
      allPhotos,
      photoDates,
      photoMapDates: photoMapDates.sort((prev, next) => Date.parse(next.date) - Date.parse(prev.date))
    }
  }

  render() {
    debug('render photoapp state', this.state)
    return (
      <div>
        {/* 工具条 */}
        <PhotoToolBar
          action={this.toggleLeftNav}
          state={['照片']}
        />

        {/* 照片列表 */}
        <PhotoList
          style={{
            overflow: 'auto',
            position: 'absolute',
            top: 56,
            width: this.state.leftNav ? 'calc(100% - 210px)' : '100%',
            height: '100%',
            left: this.state.leftNav ? LEFTNAV_WIDTH : 0,
            backgroundColor: '#FFFFFF',
            transition: sharpCurve('left')
          }}
          {...this.setPhotoInfo()}
        />
        <this.renderLeftNav />
      </div>
    )
  }
}

export default PhotoApp
