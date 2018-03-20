import React from 'react'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import { IconButton } from 'material-ui'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

import Base from './Base'
import PhotoApp from '../photo/PhotoApp'
import FlatButton from '../common/FlatButton'
import { combineElement, removeElement } from '../common/array'

const getName = (photo) => {
  if (!photo.date && !photo.datetime) {
    return `IMG_UnkownDate-${photo.hash.slice(0, 5).toUpperCase()}-PC.${photo.m}`
  }
  const date = photo.date || photo.datetime
  return `IMG-${date.split(/\s+/g)[0].replace(/[:\s]+/g, '')}-${photo.hash.slice(0, 5).toUpperCase()}-PC.${photo.m}`
}

/* increase limit of listeners of EventEmitter */
ipcRenderer.setMaxListeners(1000)

class Media extends Base {
  constructor (ctx) {
    super(ctx)
    this.state = {
      media: null,
      blacklist: null,
      selectedItems: [],
      shiftHoverItems: [],
      uploadMedia: false,
      shift: false
    }

    this.preMedia = null
    this.preBL = null
    this.value = null

    this.processMedia = (media, blacklist) => {
      // console.log('processMedia start', (new Date()).getTime() - this.timeFlag)
      /* no data */
      if (!Array.isArray(media) || !Array.isArray(blacklist)) return null

      /* data not change */
      if (media === this.preMedia && blacklist === this.preBL && this.value) return this.value

      /* store data */
      this.preMedia = media
      this.preBL = blacklist

      const removeBlacklist = (m, l) => {
        if (!m.length || !l.length) return m
        const map = new Map()
        m.filter(item => !!item.hash).forEach(d => map.set(d.hash, d))
        l.forEach(b => map.delete(b))
        return [...map.values()]
      }

      /* remove photos without hash and filter media by blacklist */
      this.value = removeBlacklist(media, blacklist)

      /* formate date */
      this.value.forEach((v) => {
        let date = v.date || v.datetime
        if (!date || date.search(/:/g) !== 4 || date.search(/^0/) > -1) date = ''
        v.date = date
      })

      /* sort photos by date */
      this.value.sort((prev, next) => next.date.localeCompare(prev.date))

      console.log('processMedia finished', (new Date()).getTime() - this.timeFlag)
      return this.value
    }

    this.memoizeValue = { currentDigest: '', currentScrollTop: 0 }
    this.firstSelect = true

    this.setAnimation = (component, status) => {
      if (component === 'NavigationMenu') {
        /* add animation to NavigationMenu */
        const transformItem = this.refNavigationMenu
        const time = 0.4
        const ease = global.Power4.easeOut
        if (status === 'In') {
          TweenMax.to(transformItem, time, { rotation: 180, opacity: 1, ease })
        }
        if (status === 'Out') {
          TweenMax.to(transformItem, time, { rotation: -180, opacity: 0, ease })
        }
      }
    }

    this.memoize = (newValue) => {
      this.memoizeValue = Object.assign(this.memoizeValue, newValue)
      return this.memoizeValue
    }

    this.requestData = eq => this.ctx.props.apis.request(eq)

    this.addListToSelection = (digests) => {
      if (this.firstSelect) {
        this.ctx.openSnackBar(i18n.__('Shift Tips'))
        this.firstSelect = false
      }
      this.setState({ selectedItems: combineElement(digests, this.state.selectedItems).sort() })
      this.lastSelect = digests.length === 1 ? digests[0] : null
    }

    this.removeListToSelection = (digests) => {
      this.setState({ selectedItems: removeElement(digests, this.state.selectedItems).sort() })
      this.lastSelect = null
    }

    this.clearSelect = () => {
      this.lastSelect = null
      this.setState({ selectedItems: [] })
    }

    this.getHoverPhoto = (digest) => {
      if (!this.state.selectedItems.length || !this.state.shift || !this.lastSelect) return
      const lastSelectIndex = this.media.findIndex(photo => photo.hash === this.lastSelect)
      const hoverIndex = this.media.findIndex(photo => photo.hash === digest)
      let shiftHoverPhotos = this.media.slice(lastSelectIndex, hoverIndex + 1)

      if (hoverIndex < lastSelectIndex) shiftHoverPhotos = this.media.slice(hoverIndex, lastSelectIndex + 1)
      this.setState({ shiftHoverItems: shiftHoverPhotos.map(photo => photo.hash) })
    }

    this.getShiftStatus = (event) => {
      if (event.shiftKey === this.state.shift) return
      this.setState({ shift: event.shiftKey })
      if (!event.shiftKey) this.setState({ shiftHoverItems: [] })
    }

    this.startDownload = () => {
      const list = this.state.selectedItems.length
        ? this.state.selectedItems
        : [this.memoizeValue.downloadDigest]

      const photos = list.map(digest => this.media.find(photo => photo.hash === digest))
        .map(photo => ({
          name: getName(photo),
          size: photo.size,
          type: 'file',
          uuid: photo.hash
        }))

      ipcRenderer.send('DOWNLOAD', { entries: photos, dirUUID: 'media' })
      this.setState({ selectedItems: [] })
    }

    this.removeMedia = () => {
      if (this.state.selectedItems.length > 0) {
        this.ctx.openSnackBar(i18n.__('Remove Media Success %s', this.state.selectedItems.length))
        this.setState({ selectedItems: [] })
      } else {
        this.ctx.openSnackBar(i18n.__('Remove Media Failed'))
      }
    }

    this.hideMedia = (show) => { // show === true ? show media : hide media
      const list = this.state.selectedItems.length
        ? this.state.selectedItems
        : [this.media.find(item => item.hash === this.memoizeValue.downloadDigest).hash]

      this.ctx.props.apis.request(show ? 'subtractBlacklist' : 'addBlacklist', list, (error) => {
        if (error) {
          this.ctx.openSnackBar(show ? i18n.__('Retrieve Media Failed') : i18n.__('Hide Media Failed'))
        } else {
          this.ctx.openSnackBar(show ? i18n.__('Retrieve Media Success %s', list.length)
            : i18n.__('Hide Media Success %s', list.length))
          this.navEnter()
          this.setState({ selectedItems: [] })
        }
      })
    }

    this.uploadMediaAsync = async () => {
      const driveUUID = this.ctx.props.apis.drives.data.find(d => d.tag === 'home').uuid
      const stationID = this.ctx.props.selectedDevice.token.data.stationID
      const data = await this.ctx.props.apis.requestAsync('mkdir', {
        driveUUID,
        dirUUID: driveUUID,
        dirname: i18n.__('Media Folder Name')
      })
      const dirUUID = stationID ? data.uuid : data[0].data.uuid
      const newData = await this.ctx.props.apis.requestAsync('mkdir', { driveUUID, dirUUID, dirname: i18n.__('Media Folder From PC') })
      const targetUUID = stationID ? newData.uuid : newData[0].data.uuid
      ipcRenderer.send('UPLOADMEDIA', { driveUUID, dirUUID: targetUUID })
    }

    this.uploadMedia = () => {
      if (!window.navigator.onLine) this.ctx.openSnackBar(i18n.__('Offline Text'))
      else {
        this.uploadMediaAsync().catch((e) => {
          console.log('uploadMedia failed', e)
          if (e && e.response && e.response.body && e.response.body.code === 'EEXIST') {
            this.ctx.openSnackBar(i18n.__('Upload Media Folder EEXIST Text'))
          } else {
            this.ctx.openSnackBar(i18n.__('Upload Media Failed'))
          }
        })
      }
    }
  }

  willReceiveProps (nextProps) {
    this.handleProps(nextProps.apis, ['blacklist', 'media'])
    this.media = this.processMedia(this.state.media, this.state.blacklist)
  }

  navEnter () {
    this.timeFlag = (new Date()).getTime()
    this.ctx.props.apis.request('blacklist')
    this.ctx.props.apis.request('media')
  }

  navLeave () {
  }

  navGroup () {
    return 'media'
  }

  menuName () {
    return i18n.__('Media Menu Name')
  }

  menuIcon () {
    return PhotoIcon
  }

  quickName () {
    return i18n.__('Media Quick Name')
  }

  appBarStyle () {
    return 'light'
  }

  prominent () {
    return false
  }

  hasDetail () {
    return false
  }

  detailEnabled () {
    return true
  }

  detailWidth () {
    return 400
  }

  hasQuickNav () {
    return !this.state.selectedItems.length
  }

  renderNavigationMenu ({ style, onTouchTap }) {
    const CustomStyle = Object.assign(style, { opacity: 1 })
    return (
      <div style={CustomStyle} ref={ref => (this.refNavigationMenu = ref)}>
        <IconButton onTouchTap={onTouchTap}>
          <NavigationMenu color="rgba(0,0,0,0.54)" />
        </IconButton>
      </div>
    )
  }

  renderTitle ({ style }) {
    const newStyle = Object.assign(style, { color: 'rgba(0,0,0,0.54)' })
    return (
      <div style={newStyle}>
        { i18n.__n('Media Title and Count %s', this.media ? this.media.length : 0) }
      </div>
    )
  }

  renderToolBar ({ style }) {
    return (
      <div style={style}>
        <FlatButton label={i18n.__('Upload')} onTouchTap={this.uploadMedia} primary />
      </div>
    )
  }

  renderContent () {
    return (<PhotoApp
      media={this.media}
      ipcRenderer={ipcRenderer}
      apis={this.ctx.props.apis}
      requestData={this.requestData}
      setAnimation={this.setAnimation}
      memoize={this.memoize}
      removeListToSelection={this.removeListToSelection}
      addListToSelection={this.addListToSelection}
      selectedItems={this.state.selectedItems}
      clearSelect={this.clearSelect}
      primaryColor={this.groupPrimaryColor()}
      startDownload={this.startDownload}
      removeMedia={this.removeMedia}
      hideMedia={this.hideMedia}
      getHoverPhoto={this.getHoverPhoto}
      getShiftStatus={this.getShiftStatus}
      shiftStatus={{ shift: this.state.shift, items: this.state.shiftHoverItems }}
    />)
  }
}

export default Media
