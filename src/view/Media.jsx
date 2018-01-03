import React from 'react'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import { IconButton } from 'material-ui'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

import Base from './Base'
import PhotoApp from '../photo/PhotoApp'
import { formatDate } from '../common/datetime'
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
  constructor(ctx) {
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

    this.height = 0
    this.width = 0
    this.size = 218
    this.allPhotos = []
    this.photoDates = []
    this.photoMapDates = []
    this.photoListWithSameDate = []
    this.allHeight = []
    this.rowHeightSum = 0
    this.indexHeightSum = []
    this.maxScrollTop = 0
    this.previousIndex = 1

    this.setPhotoInfo = (height, width, media) => {
      const size = Math.floor((width - 60) / Math.floor((width - 60) / 218 + 0.5))

      /* mediaStore were sorted by date in Node */
      if ((this.allPhotos !== media || this.width !== width) && width) {
        /* init */
        this.width = width
        this.allPhotos = media
        this.photoDates = []
        this.photoMapDates = []
        this.photoListWithSameDate = []
        this.allHeight = []
        this.rowHeightSum = 0
        this.indexHeightSum = []
        this.maxScrollTop = 0
        this.previousIndex = 1

        /* calculate photoMapDates and photoDates */
        const MAX = Math.floor((width - 60) / size) - 1
        let MaxItem = MAX
        let lineIndex = 0
        const dateUnknown = []
        this.allPhotos.forEach((item) => {
          const date = item.date || item.datetime
          if (!date || date.search(/:/g) !== 4 || date.search(/^0/) > -1) { // only allow format: "2017:06:17 17:31:18"
            dateUnknown.push(item)
            return
          }
          const formatExifDateTime = formatDate(date)
          const isRepeat = this.photoDates[this.photoDates.length - 1] === formatExifDateTime
          if (!isRepeat || MaxItem === 0) {
            MaxItem = MAX
            this.photoDates.push(formatExifDateTime)
            this.photoMapDates.push({
              first: !isRepeat,
              index: lineIndex,
              date: formatExifDateTime,
              photos: [item]
            })
            if (!isRepeat) {
              this.photoListWithSameDate.push({
                date: formatExifDateTime,
                photos: [item]
              })
            } else {
              this.photoListWithSameDate[this.photoListWithSameDate.length - 1].photos.push(item)
            }
            lineIndex += 1
          } else {
            MaxItem -= 1
            this.photoMapDates[this.photoMapDates.length - 1].photos.push(item)
            this.photoListWithSameDate[this.photoListWithSameDate.length - 1].photos.push(item)
          }
        })
        const dateUnknownText = i18n.__('Date Unknown Text')
        if (dateUnknown.length > 0) {
          this.photoListWithSameDate.push({ date: dateUnknownText, photos: [] })
          MaxItem = 0
          lineIndex += 1
          let isRepeat = false
          dateUnknown.forEach((item) => {
            this.photoListWithSameDate[this.photoListWithSameDate.length - 1].photos.push(item)
            if (MaxItem === 0) {
              MaxItem = MAX
              this.photoDates.push(0)
              this.photoMapDates.push({
                first: !isRepeat,
                index: lineIndex,
                date: dateUnknownText,
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

        /* calculate each row's heigth and their sum */
        this.photoMapDates.forEach((list) => {
          const tmp = size * Math.ceil(list.photos.length / Math.floor((width - 60) / size)) + !!list.first * 48
          this.allHeight.push(tmp)
          this.rowHeightSum += tmp
          this.indexHeightSum.push(this.rowHeightSum)
        })

        this.maxScrollTop = this.rowHeightSum - height + 16 * 2
        if (this.maxScrollTop > 1500000) {
          const r = this.maxScrollTop / 1500000
          this.indexHeightSum = this.indexHeightSum.map(h => h / r)
          this.maxScrollTop = 1500000
        }
      }
      return {
        allPhotos: this.allPhotos,
        photoDates: this.photoDates,
        photoMapDates: this.photoMapDates,
        indexHeightSum: this.indexHeightSum,
        allHeight: this.allHeight,
        maxScrollTop: this.maxScrollTop,
        rowHeightSum: this.rowHeightSum,
        currentDigest: this.memoizeValue.currentDigest,
        photoListWithSameDate: this.photoListWithSameDate,
        size: size - 8
      }
    }

    this.getTimeline = (photoDates, indexHeightSum, maxScrollTop, height) => {
      const month = new Map()
      let dateUnknown = 0
      /* parse data to list of month */
      photoDates.forEach((date) => {
        if (!date) return (dateUnknown += 1)
        const b = date.split(/-/)
        const mix = `${b[0]}-${b[1]}`
        if (month.has(mix)) {
          month.set(mix, month.get(mix) + 1)
        } else {
          month.set(mix, 1)
        }
        return null
      })
      if (dateUnknown) month.set('0', dateUnknown)

      let sumCount = 0
      let spacingCount = 0
      let currentYear = null
      const timeline = [...month].map((data, index) => {
        let percentage = 0
        if (sumCount) {
          percentage = (indexHeightSum[sumCount - 1] - 200) / maxScrollTop
        }
        /* top = percentage * height + headerHeight - adjust */
        let top = percentage * height - 8

        const spacingPercentage = (indexHeightSum[spacingCount] - 200) / maxScrollTop
        const spacingTop = spacingPercentage * height

        sumCount += data[1]
        spacingCount += data[1]
        let date
        let zIndex = 2
        if (currentYear !== parseInt(data[0], 10)) {
          date = parseInt(data[0], 10)
        } else {
          date = <hr style={{ width: 8 }} />
        }
        currentYear = parseInt(data[0], 10)
        if (!index) { // first date
          top = 8
          spacingCount = 0
        } else if (index === month.size - 1) { // last date
          top += 20
          if (top > height - 26) top = height - 26
        } else if (spacingTop > 32 && date === parseInt(data[0], 10)) { // show years with enough spacing
          spacingCount = 0
        } else if (date === parseInt(data[0], 10)) { // hide years without enough spacing
          date = null
        } else { // show bar
          zIndex = 1
        }

        /* set range of displaying date */
        if (top < 16 && index) date = null
        if (top > (height - 46) && index !== month.size - 1) date = null
        return [date, top, zIndex, percentage]
      })
      return timeline
    }

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
    }

    this.removeListToSelection = (digests) => {
      this.setState({ selectedItems: removeElement(digests, this.state.selectedItems).sort() })
    }

    this.clearSelect = () => { this.setState({ selectedItems: [] }) }

    this.getHoverPhoto = (digest) => {
      if (!this.state.selectedItems.length) return
      const lastSelect = this.state.selectedItems[this.state.selectedItems.length - 1]
      const lastSelectIndex = this.media.findIndex(photo => photo.hash === lastSelect)
      const hoverIndex = this.media.findIndex(photo => photo.hash === digest)
      let shiftHoverPhotos = this.media.slice(lastSelectIndex, hoverIndex + 1)

      if (hoverIndex < lastSelectIndex) shiftHoverPhotos = this.media.slice(hoverIndex, lastSelectIndex + 1)
      this.setState({ shiftHoverItems: shiftHoverPhotos.map(photo => photo.hash) })
    }

    this.getShiftStatus = (event) => {
      if (event.shiftKey === this.state.shift) return
      this.setState({ shift: event.shiftKey })
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
      const txt = show ? i18n.__('Retrieve') : i18n.__('Hide')
      const list = this.state.selectedItems.length
        ? this.state.selectedItems
        : [this.media.find(item => item.hash === this.memoizeValue.downloadDigest).hash]
      this.ctx.props.apis.request(show ? 'subtractBlacklist' : 'addBlacklist', list, (error) => {
        if (error) {
          this.ctx.openSnackBar(show ? i18n.__('Retrieve Media Failed') : i18n.__('Hide Media Failed'))
        } else {
          this.ctx.openSnackBar(show ? i18n.__('Retrieve Media Success %s', list.length) : i18n.__('Hide Media Success %s', list.length))
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
      if (!window.navigator.onLine) return this.ctx.openSnackBar(i18n.__('Offline Text'))
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

  willReceiveProps(nextProps) {
    this.handleProps(nextProps.apis, ['blacklist', 'media'])
    this.media = this.processMedia(this.state.media, this.state.blacklist)
  }

  navEnter() {
    this.timeFlag = (new Date()).getTime()
    this.ctx.props.apis.request('blacklist')
    this.ctx.props.apis.request('media')
  }

  navLeave() {
  }

  navGroup() {
    return 'media'
  }

  menuName() {
    return i18n.__('Media Menu Name')
  }

  menuIcon() {
    return PhotoIcon
  }

  quickName() {
    return i18n.__('Media Quick Name')
  }

  appBarStyle() {
    return 'light'
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

  hasQuickNav() {
    return !this.state.selectedItems.length
  }

  renderNavigationMenu({ style, onTouchTap }) {
    const CustomStyle = Object.assign(style, { opacity: 1 })
    return (
      <div style={CustomStyle} ref={ref => (this.refNavigationMenu = ref)}>
        <IconButton onTouchTap={onTouchTap}>
          <NavigationMenu color="rgba(0,0,0,0.54)" />
        </IconButton>
      </div>
    )
  }

  renderTitle({ style }) {
    const newStyle = Object.assign(style, { color: 'rgba(0,0,0,0.54)' })
    return (
      <div style={newStyle}>
        { i18n.__('Media Title') }
        { !!this.media && ` (${this.media.length})` }
      </div>
    )
  }

  renderToolBar({ style }) {
    return (
      <div style={style}>
        <FlatButton label={i18n.__('Upload')} onTouchTap={this.uploadMedia} primary />
      </div>
    )
  }

  renderContent() {
    return (<PhotoApp
      media={this.media}
      setPhotoInfo={this.setPhotoInfo}
      getTimeline={this.getTimeline}
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
