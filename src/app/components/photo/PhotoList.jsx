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
    this.scrollToIndex = undefined
    this.indexHeightSum = []
    this.percentage = 0

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
    this.showDateBar = (hover) => {
      if (!this.state.hover) {
        clearTimeout(this.time)
        this.setState({ hover: true })
        this.time = setTimeout(() => this.setState({ hover: false }), hover ? 100000 : 3000)
      }
    }
    this.onScroll = (showDateBar) => {
      if (!this.props.photoMapDates.length) return
      this.scrollToIndex = undefined
      const list = document.getElementsByClassName('ReactVirtualized__List')[0]
      const currentIndex = this.indexHeightSum.findIndex(element => element > list.scrollTop)
      this.percentage = currentIndex / this.props.photoMapDates.length

      /* timelineHeight = clientHeight - headerHeight - marginTopBottom */
      this.timelineHeight = this.clientHeight - headerHeight - 8 - 20 - 20 - 8
      if (this.dateRef) {
        this.dateRef.style.top = `${parseInt(this.percentage * this.timelineHeight + 28, 10)}px`
        if (showDateBar) this.showDateBar(false)
      }
    }

    this.onPick = (event) => {
      const { x, y } = mousePosition(event)
      if (!this.props.photoMapDates.length) return null
      if (x > this.clientWidth - 100 && y > headerHeight) {
        
        this.scrollToIndex = undefined
        this.percentage = (y - 56) / this.clientHeight
        const top = this.percentage * (this.clientHeight - 66) + 68
        const currentIndex = Math.floor((this.props.photoMapDates.length * this.percentage))
        this.date = this.props.photoMapDates[currentIndex].date
        debug('onPick', currentIndex)
        if (this.bgRef) {
          debug('!!!!!!!!!!!!', this.bgRef.style.cursor)
          this.bgRef.style.cursor = 'row-resize'
        }
        if (this.dateRefMouse) {
          this.dateRefMouse.style.display = 'flex'
          this.dateRefMouse.style.top = `${top}px`
          this.dateRefMouse.innerHTML = this.date
          debug('onScroll', currentIndex, this.percentage, this.dateRef.style, this.dateRef.style.top)
          if (this.onMouseDown) {
            this.forceUpdate()
            this.scrollToIndex = currentIndex
          }
        }
      } else if (this.dateRefMouse) {
        this.dateRefMouse.style.display = 'none'
      }
    }

    this.scrollToPosition = (top) => {
      if (top === this.maxScrollTop) {
        this.scrollToIndex = this.props.photoMapDates.length - 1
        this.forceUpdate()
        return
      }
      const list = document.getElementsByClassName('ReactVirtualized__List')[0]
      list.scrollTop = top
    }
  }

  componentDidUpdate() {
    this.onScroll(false)
  }

  renderList = () => {
    /* calculate size of list */
    this.clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    this.clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
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
        onScroll={() => this.onScroll(true)}
        scrollToIndex={this.scrollToIndex}
        overscanRowCount={6}
        style={{ padding: 16 }}
        estimatedRowSize={estimatedRowSize}
      />
    )
  }

  renderPicker = () => (
    <div
      style={{
        position: 'fixed',
        height: '100%',
        paddingTop: headerHeight,
        right: 0
      }}
    >
      <div
        ref={ref => (this.dateRefMouse = ref)}
        style={{
          display: 'flex',
          position: 'absolute',
          top: -100,
          width: 96,
          right: 96,
          backgroundColor: 'black',
          color: 'white',
          padding: 8
        }}
      />
    </div>
  )

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
    /* contanerHeight = clientHeight - headerHeight - marginTopBottom - marginYear */
    const perHeight = (this.clientHeight - headerHeight - 24 - 8 * years.size) / Dates.length
    debug('renderDateList', 'years', years, 'month', month, 'perHeight', perHeight)
    return (
      <div
        ref={ref => (this.bgRef = ref)}
        style={{
          position: 'fixed',
          height: '100%',
          paddingTop: headerHeight,
          right: 0
        }}
        onMouseEnter={() => this.showDateBar(true)}
        onMouseLeave={() => this.setState({ hover: false })}
        onMouseDown={() => (this.onMouseDown = true)}
        onMouseUp={() => (this.onMouseDown = false)}
      >
        <div
          style={{
            position: 'fixed',
            top: 64,
            right: 20
          }}
        >
          {/* timeline */}
          {
            [...years].map((data) => {
              const lineHeight = parseInt(data[1] * perHeight, 10) > 20 ? parseInt(data[1] * perHeight, 10) : 20
              return(
                <div
                  key={data[0]}
                  style={{
                    height: lineHeight,
                    color: 'rgba(0,0,0,0.54)',
                    margin: 8,
                    textAlign: 'center'
                  }}
                >
                  {parseInt(data[0], 10) || '神秘时间'}
                </div>
              )
            })
          }

          {/* position bar */}
          <div
            ref={ref => (this.dateRef = ref)}
            style={{
              display: this.state.hover ? '' : 'none',
              position: 'absolute',
              height: 2,
              width: 48,
              right: 18,
              backgroundColor: '#4285f4'
            }}
          />

        </div>
        {/*
        <FlatButton
          label="Top"
          style={{
            position: 'fixed',
            top: 72,
            right: 16
          }}
          onTouchTap={() => this.scrollToPosition(0)}
        />
        <FlatButton
          label="Bottom"
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16
          }}
          onTouchTap={() => this.scrollToPosition(this.maxScrollTop)}
        />
        */}
      </div>
    )
  }

  render() {
    // debug('render PhotoList, this.props', this.props, this.state)
    const photos = this.props.photoMapDates
    if (photos.length === 0) return <div />
    return (
      <Paper
        style={this.props.style}
        onMouseMove={this.onPick}
      >

        {/* 图片列表 */}
        {
          this.props.photoMapDates.length ? <this.renderList /> : <div />
        }

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

        {/* 时间 */}
        { <this.renderPicker /> }

        {/* 时间轴和跳转按钮 */}
        { <this.renderTimeline /> }

      </Paper>
    )
  }
}
