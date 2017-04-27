import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { List, AutoSizer } from 'react-virtualized'
// import List from './List'
import { Paper, Card, IconButton, CircularProgress, FlatButton } from 'material-ui'
import Carousel from './Carousel'
import PhotoDetail from './PhotoDetail'
import { formatDate } from '../../utils/datetime'
import RenderListByRow from './RenderListByRow'
import loading from '../../../assets/images/index/loading.gif'
import PhotoItem from './PhotoItem'

const debug = Debug('component:photoApp:PhotoList')
const headerHeight = 64
const leftnavWidth = 72

const findPath = (items, path) => items.findIndex(item => item === path)

const mousePosition = (ev) => {
  if (ev.pageX || ev.pageY) {
    return { x: ev.pageX, y: ev.pageY }
  }
  return {
    x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
    y: ev.clientY + document.body.scrollTop - document.body.clientTop
  }
}

class PhotoList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hover: false
    }
    this.maxScrollTop = 0
    this.indexHeightSum = []
    this.time = null

    this.onRowTouchTap = (e, index) => {
      e.preventDefault()  // important!
      e.stopPropagation()
    }

    this.showDateBar = () => {
      if (!this.state.hover) {
        this.setState({ hover: true })
      }
    }
    this.onScroll = () => {
      if (!this.photoMapDates.length) return
      const list = document.getElementsByClassName('ReactVirtualized__List')[0]
      const currentIndex = this.indexHeightSum.findIndex(data => data > list.scrollTop + 200)
      const percentage = list.scrollTop / this.maxScrollTop
      this.date = this.photoMapDates[currentIndex].date

      if (this.refDateBar) {
        /* convert percentage to styleTop */
        let top = percentage * this.height
        if (top < 26) top = 26
        if (top > this.height + 40) top = this.height + 40

        /* update datebar */
        this.refDateBar.style.top = `${top + 64}px`

        /* update datebox */
        this.refDateBox.style.opacity = 1
        this.refDateBox.style.top = `${top + 48}px`
        this.refDateBox.innerHTML = this.date

        /* show timeline */
        this.refTimeline.style.opacity = 1

        /* hide dateBarFollowMouse */
        this.refBarFollowMouse.style.opacity = 0

        /* hide DateBox and Timeline 2000ms later */
        clearTimeout(this.time)
        if (!this.state.hover) {
          this.time = setTimeout(() => {
            this.refDateBox.style.opacity = 0
            this.refTimeline.style.opacity = 0
          }, 2000)
        }
      }
    }

    this.onMouseMove = (event) => {
      if (!this.photoMapDates.length) return null

      /* get mouse position*/
      let { x, y } = mousePosition(event)
      let top = y - 16
      if (top < (headerHeight + 10)) top = headerHeight + 10
      if (top > this.height + 8) top = this.height + 8

      if (this.onMouseDown || (x > this.width - 12 && y > headerHeight)) {
        /* showTimeline and clear setTimeout */
        this.showDateBar()
        clearTimeout(this.time)

        /* calculate position */
        if (y < headerHeight) y = headerHeight
        const percentage = Math.round((y - headerHeight) / this.height * 1000)

        /* convert currentScrollTop to currentIndex */
        const currentScrollTop = Math.round((this.maxScrollTop * percentage / 1000))
        const currentIndex = this.indexHeightSum.findIndex(data => data > currentScrollTop + 200)
        this.date = this.photoMapDates[currentIndex].date

        /* change cursor */
        if (this.refBackground) {
          this.refBackground.style.cursor = 'row-resize'
        }

        /* change position of date box */
        if (this.refDateBox) {
          this.refDateBox.style.opacity = 1
          this.refDateBox.style.top = `${top}px`
          this.refDateBox.innerHTML = this.date

          this.refBarFollowMouse.style.opacity = 1
          this.refBarFollowMouse.style.top = `${top + 16}px`

          this.scrollTop = currentScrollTop
          if (this.onMouseDown) {
            this.scrollToPosition()
          }
        }
      } else if (this.refDateBox) {
        this.refBarFollowMouse.style.opacity = 0
      }
      return null
    }

    this.scrollToPosition = () => {
      const list = document.getElementsByClassName('ReactVirtualized__List')[0]
      list.scrollTop = this.scrollTop
    }
  }

  renderList = () => (
    <div style={{ display: 'flex', width: '100%', height: '100%' }} >
      <AutoSizer>
        {({ height, width }) => {
          /* get PhotoInfo */
          const PhotoInfo = this.props.setPhotoInfo(height, width, this.props.media)
          // debug('PhotoInfo', PhotoInfo)

          /* set global variant */
          this.height = height
          this.width = width
          this.allPhotos = PhotoInfo.allPhotos
          this.photoDates = PhotoInfo.photoDates
          this.photoMapDates = PhotoInfo.photoMapDates
          this.indexHeightSum = PhotoInfo.indexHeightSum
          this.allHeight = PhotoInfo.allHeight
          this.maxScrollTop = PhotoInfo.maxScrollTop
          this.rowHeightSum = PhotoInfo.rowHeightSum

          const estimatedRowSize = PhotoInfo.rowHeightSum / PhotoInfo.allHeight.length
          const rowHeight = ({ index }) => PhotoInfo.allHeight[index]
          /* function to render each row */
          const rowRenderer = ({ key, index, style, isScrolling }) => (
            <div key={key} style={style} >
              <RenderListByRow
                lookPhotoDetail={this.props.lookPhotoDetail}
                isScrolling={isScrolling}
                list={this.photoMapDates[index]}
              />
            </div>
          )
          return (
            <div onTouchTap={e => this.onRowTouchTap(e, -1)}>
              <List
                height={height}
                width={width}
                estimatedRowSize={estimatedRowSize}
                rowHeight={rowHeight}
                rowRenderer={rowRenderer}
                rowCount={PhotoInfo.photoDates.length}
                onScroll={this.onScroll}
                scrollTop={this.scrollTop}
                overscanRowCount={10}
                style={{ padding: 16, outline: 'none' }}
              />
            </div>
          )
        }}
      </AutoSizer>
    </div>
  )

  renderTimeline = () => {
    // debug('renderTimeline, this.photoDates', this.photoDates, this.indexHeightSum, this.maxScrollTop)
    const Dates = this.photoDates
    const month = new Map()
    let mix = null
    let dateUnknown = 0

    /* parse data to list of month */
    Dates.forEach((date) => {
      if (!date) return (dateUnknown += 1)
      const b = date.split(/-/)
      mix = `${b[0]}-${b[1]}`
      if (month.has(mix)) {
        month.set(mix, month.get(mix) + 1)
      } else {
        month.set(mix, 1)
      }
      return null
    })
    month.set('0', dateUnknown)

    let sumCount = 0
    let spacingCount = 0
    let currentYear = null
    const timeline = [...month].map((data, index) => {
      const percentage = (this.indexHeightSum[sumCount] - 200) / this.maxScrollTop
      /* top = percentage * height + headerHeight - adjust */
      let top = percentage * this.height + headerHeight - 18

      const spacingPercentage = (this.indexHeightSum[spacingCount] - 200) / this.maxScrollTop
      /* top = percentage * height - headerHeight */
      const spacingTop = spacingPercentage * this.height

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
        top = headerHeight + 8
        spacingCount = 0
      } else if (index === month.size - 1) { // last date
        top += 20
        if (top > this.height + 16) top = this.height + 16
      } else if (spacingTop > 32 && date === parseInt(data[0], 10)) { // show years with enough spacing
        spacingCount = 0
      } else if (date === parseInt(data[0], 10)) { // hide years without enough spacing
        date = null
      } else { // show bar
        zIndex = 1
      }

      /* set range of displaying date*/
      if (top < (headerHeight + 16) && index) date = null
      if (top > this.height && index !== month.size - 1) date = null
      return [date, top, zIndex]
    })

    return (
      <div
        ref={ref => (this.refBackground = ref)}
        style={{
          position: 'fixed',
          height: '100%',
          width: 80,
          paddingTop: headerHeight,
          right: 16
        }}
        onMouseLeave={() => {
          if (!this.onMouseDown) this.setState({ hover: false })
          this.scrollTop = null
        }}
        onMouseDown={() => (this.onMouseDown = true)}
        onMouseUp={() => (this.onMouseDown = false)}
        onTouchTap={this.scrollToPosition}
      >
        {/* timeline */}
        <div
          ref={ref => (this.refTimeline = ref)}
          style={{
            opacity: this.state.hover ? 1 : 0,
            transition: 'opacity 350ms'
          }}
        >
          {/* date list */}
          {
             timeline.map((data, index) => {
               let date = data[0]
               const top = data[1]
               const zIndex = data[2]
               if (date === 0) date = '神秘时间'
               return (
                 <div
                   key={index.toString()}
                   style={{
                     position: 'fixed',
                     boxSizing: 'border-box',
                     top,
                     color: 'rgba(0,0,0,0.54)',
                     backgroundColor: 'white',
                     paddingRight: 8,
                     right: (data[0] === 0) ? 24 : 36,
                     zIndex,
                     textAlign: 'center'
                   }}
                 >
                   { date }
                 </div>
               )
             })
          }

          {/* position bar */}
          <div
            ref={ref => (this.refDateBar = ref)}
            style={{
              position: 'fixed',
              top: -1000,
              height: 2,
              width: 48,
              right: 38,
              zIndex: 3,
              backgroundColor: '#4285f4'
            }}
          />
        </div>

        {/* BarFollowMouse */}
        <div
          ref={ref => (this.refBarFollowMouse = ref)}
          style={{
            opacity: this.state.hover ? 1 : 0,
            transition: 'opacity 350ms',
            position: 'absolute',
            top: -1000,
            height: 2,
            width: 48,
            right: 22,
            zIndex: 4,
            backgroundColor: 'rgba(0,0,0,0.54)'
          }}
        />

        {/* DateBox */}
        <div
          ref={ref => (this.refDateBox = ref)}
          style={{
            opacity: this.state.hover ? 1 : 0,
            transition: 'opacity 350ms',
            position: 'absolute',
            top: -1000,
            width: 84,
            right: 96,
            backgroundColor: 'black',
            color: 'white',
            padding: 8
          }}
        />
      </div>
    )
  }

  render() {
    // debug('render PhotoList, this.props', this.props, this.state)
    document.body.onmousemove = this.onMouseMove
    document.body.onmouseup = () => (this.onMouseDown = false)
    return (
      <Paper
        style={this.props.style}
      >

        {/* 图片列表 */}
        <this.renderList />

        {/* 时间轴 */}
        <this.renderTimeline />

      </Paper>
    )
  }
}

export default PhotoList
