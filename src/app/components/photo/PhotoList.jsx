import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { List, WindowScroller } from 'react-virtualized'
// import List from './List'
import { Paper, Card, IconButton, CircularProgress, FlatButton } from 'material-ui'
import Carousel from './Carousel'
import PhotoDetail from './PhotoDetail'
import { formatDate } from '../../utils/datetime'
import RenderListByRow from './RenderListByRow'
import loading from '../../../assets/images/index/loading.gif'
import PhotoItem from './PhotoItem'

const debug = Debug('component:photoApp:PhotoList')
const headerHeight = 56

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

export default class PhotoList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      carouselItems: [],
      openDetail: false,
      hover: false
    }
    this.clientWidth = 0
    this.clientHeight = 0
    this.maxScrollTop = 0
    this.indexHeightSum = []
    this.percentage = 0
    this.time = null

    this.addListToSelection = (path) => {
      const hasPath = this.state.carouselItems.findIndex(item => item === path) >= 0

      !hasPath && this.setState(prevState => ({
        carouselItems: [
          ...prevState.carouselItems,
          path
        ]
      }))
    }
    this.removeListToSelection = (path) => {
      const hasPath = this.state.carouselItems.findIndex(item => item === path) >= 0

      hasPath && this.setState((prevState) => {
        const index = findPath(prevState.carouselItems, path)

        return {
          carouselItems: [
            ...prevState.carouselItems.slice(0, index),
            ...prevState.carouselItems.slice(index + 1)
          ]
        }
      })
    }
    this.lookPhotoDetail = (digest) => {
      this.seqIndex = this.props.allPhotos.findIndex(item => item.digest === digest)
      this.setState({ openDetail: true })
    }
    this.showDateBar = () => {
      if (!this.state.hover) {
        this.setState({ hover: true })
      }
    }
    this.onScroll = () => {
      if (!this.props.photoMapDates.length) return
      const list = document.getElementsByClassName('ReactVirtualized__List')[0]
      const currentIndex = this.indexHeightSum.findIndex(data => data > list.scrollTop + 200)
      const percentage = list.scrollTop / this.maxScrollTop
      this.date = this.props.photoMapDates[currentIndex].date

      if (this.refDateBar) {
        /* convert percentage to styleTop */
        let top = percentage * (this.clientHeight - headerHeight)
        if (top < 26) top = 26
        if (top > this.clientHeight - 96) top = this.clientHeight - 96

        /* update datebar */
        this.refDateBar.style.top = `${top}px`

        /* update datebox */
        this.refDateBox.style.display = 'flex'
        this.refDateBox.style.top = `${top + 40}px`
        this.refDateBox.innerHTML = this.date

        /* hide dateBarFollowMouse */
        this.refBarFollowMouse.style.display = 'none'

        /* hide DateBox 1000ms later */
        clearTimeout(this.time)
        this.time = setTimeout(() => {
          this.refDateBox.style.display = 'none'
        }, 2000)
      }
    }

    this.onMouseMove = (event) => {
      if (!this.props.photoMapDates.length) return null

      /* get mouse position*/
      let { x, y } = mousePosition(event)
      let top = y - 16
      if (top < 66) top = 66
      if (top > this.clientHeight - headerHeight) top = this.clientHeight - headerHeight

      if (this.onMouseDown || (x > this.clientWidth - 100 && x < this.clientWidth - 16 && y > headerHeight && this.state.hover)) {
        if (y < headerHeight) y = headerHeight
        this.percentage = Math.round((y - headerHeight) / (this.clientHeight - headerHeight) * 1000)

        /* convert currentScrollTop to currentIndex */
        const currentScrollTop = Math.round((this.maxScrollTop * this.percentage / 1000))
        const currentIndex = this.indexHeightSum.findIndex(data => data > currentScrollTop + 200)
        this.date = this.props.photoMapDates[currentIndex].date

        /* change cursor */
        if (this.refBackground) {
          this.refBackground.style.cursor = 'row-resize'
        }

        /* change position of date box */
        if (this.refDateBox) {
          this.refDateBox.style.display = 'flex'
          this.refDateBox.style.top = `${top}px`
          this.refDateBox.innerHTML = this.date

          this.refBarFollowMouse.style.display = 'flex'
          this.refBarFollowMouse.style.top = `${top + 16}px`

          this.scrollTop = currentScrollTop
          if (this.onMouseDown) {
            this.scrollToPosition()
          }
        }
      } else if (this.refDateBox) {
        // this.refDateBox.style.display = 'none'
        this.refBarFollowMouse.style.display = 'none'
        /*
        clearTimeout(this.time)
        this.time = setTimeout(() => {
          this.refDateBox.style.display = 'none'
          this.refBarFollowMouse.style.display = 'none'
        }, 1000)
        */
      }
    }

    this.scrollToPosition = () => {
      const list = document.getElementsByClassName('ReactVirtualized__List')[0]
      list.scrollTop = this.scrollTop
    }
  }

  renderList = () => {
    /* calculate size of list */
    this.clientHeight = window.innerHeight
    this.clientWidth = window.innerWidth
    const height = this.clientHeight - headerHeight
    const width = this.props.leftNav ? this.clientWidth - 210 : this.clientWidth

    /* calculate each row's heigth and their sum */
    const AllHeight = []
    this.rowHeightSum = 0
    this.indexHeightSum = []
    this.props.photoMapDates.forEach((list) => {
      const tmp = 216 * Math.ceil(list.photos.length / Math.floor(width / 216)) + !!list.first * 40
      AllHeight.push(tmp)
      this.rowHeightSum += tmp
      this.indexHeightSum.push(this.rowHeightSum)
    })

    const rowHeight = ({ index }) => AllHeight[index]
    const estimatedRowSize = this.rowHeightSum / AllHeight.length
    this.maxScrollTop = this.rowHeightSum - this.clientHeight + headerHeight + 16 * 2

    /* function to render each row */
    const rowRenderer = ({ key, index, style, isScrolling }) => {
      const list = this.props.photoMapDates[index]
      return (
        <div
          key={key}
          style={style}
        >
          <RenderListByRow
            lookPhotoDetail={this.lookPhotoDetail}
            isScrolling={isScrolling}
            list={list}
          />
        </div>
      )
    }

    return (
      <List
        height={height}
        width={width}
        rowCount={this.props.photoMapDates.length}
        rowHeight={rowHeight}
        rowRenderer={rowRenderer}
        onScroll={this.onScroll}
        scrollTop={this.scrollTop}
        overscanRowCount={10}
        style={{ padding: 16 }}
        estimatedRowSize={estimatedRowSize}
      />
    )
  }

  renderTimeline = () => {
    const Dates = this.props.photoDates
    const years = new Map()
    const month = new Map()
    let mix = null
    let dateUnknown = 0

    /* parse data */
    Dates.forEach((date) => {
      if (!date) return (dateUnknown += 1)
      const b = date.split(/-/)

      /* year */
      if (years.has(b[0])) {
        years.set(b[0], years.get(b[0]) + 1)
      } else {
        years.set(b[0], 1)
      }
      /* month */
      mix = `${b[0]}-${b[1]}`
      if (month.has(mix)) {
        month.set(mix, month.get(mix) + 1)
      } else {
        month.set(mix, 1)
      }
    })
    years.set('0', dateUnknown)
    this.years = years

    /* contanerHeight = clientHeight - headerHeight - marginTopBottom */
    const contanerHeight = this.clientHeight - headerHeight + 24
    let perHeight = contanerHeight / Dates.length

    /*
    use Newton's method to calc perHeight 
    for (let i = 0; i < 5; i++) {
      if (firstHeight < 28) {
        perHeight = (contanerHeight - 28 + firstHeight) / Dates.length
        firstHeight = [...years][0][1] * perHeight
      }
    }
    */

    /* convert currentScrollTop to currentIndex */

      /* 
    this.percentage = Math.round((y - headerHeight) / (this.clientHeight - headerHeight) * 1000)
    const currentScrollTop = Math.round((this.maxScrollTop * this.percentage / 1000))
    const currentIndex = this.indexHeightSum.findIndex(data => data > currentScrollTop + 200)
    this.date = this.props.photoMapDates[currentIndex].date
    */



    let sumCount = 0
    const timeline = [...years].map((data, index) => {
      let lineHeight = parseInt(data[1] * perHeight, 10)

      /* top = percentage * (clientHeight - headerHeight) - headerHeight */
      let top = sumCount / Dates.length * (this.clientHeight - headerHeight)
      debug(sumCount,data[1],sumCount / Dates.length,Dates.length,this.clientHeight,headerHeight)

      sumCount += data[1]

      if (!index) top += 8
      let date = null
      date = parseInt(data[0], 10)
      if (date === 0) date = 'other'
      return [date, lineHeight, top]
    })

    debug('timeline', timeline)
    return (
      <div
        ref={ref => (this.refBackground = ref)}
        style={{
          position: 'fixed',
          height: '100%',
          paddingTop: headerHeight,
          right: 0
        }}
        onMouseMove={() => this.showDateBar()}
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
          style={{
            position: 'fixed',
            top: headerHeight,
            boxSizing: 'border-box',
            height: 'calc(100% - 56px)',
            right: 20
          }}
        >
          {/* date list */}
          {
            timeline.map((data, index) => {
              const date = data[0]
              const lineHeight = data[1]
              const top = data[2]
              return (
                <div
                  key={date}
                  style={{
                    position: 'absolute',
                    boxSizing: 'border-box',
                    top: top,
                    height: lineHeight,
                    color: 'rgba(0,0,0,0.54)',
                    paddingRight: 8,
                    right: 16,
                    textAlign: 'center'
                  }}
                >
                  { date || null }
                </div>
              )
            })
          }

          {/* position bar */}
          <div
            ref={ref => (this.refDateBar = ref)}
            style={{
              position: 'absolute',
              top: -1000,
              height: 2,
              width: 48,
              right: 18,
              backgroundColor: '#4285f4'
            }}
          />
        </div>

        {/* BarFollowMouse */}
        <div
          ref={ref => (this.refBarFollowMouse = ref)}
          style={{
            display: this.state.hover ? 'flex' : 'none',
            position: 'absolute',
            top: -1000,
            width: 48,
            right: 38,
            height: 2,
            backgroundColor: 'rgba(0,0,0,0.54)'
          }}
        />

        {/* DateBox */}
        <div
          ref={ref => (this.refDateBox = ref)}
          style={{
            display: this.state.hover ? 'flex' : 'none',
            position: 'absolute',
            top: -1000,
            width: 96,
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
    const photos = this.props.photoMapDates
    if (photos.length === 0) {
      return (
        <div style={this.props.style}>
          <CircularProgress />
        </div>
      )
    }
    return (
      <Paper
        style={this.props.style}
      >

        {/* 图片列表 */}
        <this.renderList />

        {/* 轮播 */}
        {
          this.state.carouselItems.length ?
            <Paper style={{ position: 'fixed', bottom: 15, width: '75%' }} >
              <Carousel
                ClearAll={() => this.setState({ carouselItems: [] })}
                removeListToSelection={this.removeListToSelection}
                style={{ backgroundColor: '#fff', height: 180, borderRadius: 4, boxShadow: '0 0 10px rgba(0,0,0,.3)' }}
                items={this.state.carouselItems}
              />
            </Paper> : <div />
        }

        {/* 查看大图 */}
        {
          this.state.openDetail ?
            <PhotoDetail
              closePhotoDetail={() => this.setState({ openDetail: false })}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%'
              }}
              items={this.props.allPhotos}
              seqIndex={this.seqIndex}
            /> : <div />
        }

        {/* 时间轴 */}
        { <this.renderTimeline /> }

      </Paper>
    )
  }
}
