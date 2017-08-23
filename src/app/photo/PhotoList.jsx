import React from 'react'
import ReactDom from 'react-dom'
import Debug from 'debug'
import { List, AutoSizer } from 'react-virtualized'
import { Paper, Card, IconButton, CircularProgress, FlatButton } from 'material-ui'
import RenderListByRow from './RenderListByRow'

const debug = Debug('component:photoApp:PhotoList')
const timelineMargin = 26

const mousePosition = (ev) => {
  if (ev.pageX || ev.pageY) {
    return { x: ev.pageX, y: ev.pageY }
  }
  return {
    x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
    y: ev.clientY + document.body.scrollTop - document.body.clientTop
  }
}

class PhotoList extends React.Component {
  constructor(props) {
    super(props)

    this.headerHeight = this.props.headerHeight
    this.hover = false
    this.firstScroll = 2

    this.onRowTouchTap = (e, index) => {
      e.preventDefault()  // important!
      e.stopPropagation()
    }

    this.showDateBar = (op) => {
      // debug('this.showDateBar', op)
      this.hover = op
      this.refDateBox.style.opacity = op ? 0.87 : 0
      this.refTimeline.style.opacity = op ? 1 : 0
    }

    this.onScroll = () => {
      if (!this.photoMapDates.length) return
      const list = document.getElementsByClassName('ReactVirtualized__List')[0]
      const currentIndex = this.indexHeightSum.findIndex(data => data > list.scrollTop + 200)
      const percentage = list.scrollTop / this.maxScrollTop
      this.date = this.photoMapDates[currentIndex].date
      this.currentDigest = this.photoMapDates[currentIndex].photos[0].hash
      if (!this.firstScroll) this.props.memoize({ currentDigest: '', currentScrollTop: list.scrollTop })
      // debug('this.props.memoize()', this.props.memoize())

      /* forceUpdate when first two scroll, this is necessary to show timeline*/
      if (this.firstScroll) {
        this.firstScroll -= 1
        this.forceUpdate()
      }

      if (this.refDateBar) {
        /* convert percentage to styleTop */
        let top = percentage * this.height
        if (top < timelineMargin) top = timelineMargin
        if (top > this.height - timelineMargin) top = this.height - timelineMargin

        /* update datebar */
        this.refDateBar.style.top = `${top}px`

        /* update datebox */
        this.refDateBox.style.opacity = 0.87
        this.refDateBox.style.top = `${top - 16}px`
        this.refDateBox.innerHTML = this.date

        /* show timeline */
        // debug('show timeline', this.timeline)
        this.refTimeline.style.opacity = 1

        /* hide dateBarFollowMouse */
        this.refBarFollowMouse.style.opacity = 0

        /* hide DateBox and Timeline 2000ms later */
        clearTimeout(this.time)
        if (!this.hover) {
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
      const { x, y } = mousePosition(event)
      let top = y - this.headerHeight
      if (top < timelineMargin) top = timelineMargin
      if (top > this.height - timelineMargin) top = this.height - timelineMargin

      if (this.onMouseDown || ((x > this.width - 96 && y > this.headerHeight) && this.hover)) {
        // debug('this.onMouseMove')
        /* showTimeline and clear setTimeout */
        this.showDateBar(true)
        clearTimeout(this.time)

        /* calculate position and percentage */
        let position = y - this.headerHeight
        if (position < 0) position = 0
        const percentage = Math.round(position / this.height * 1000)

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
          this.refDateBox.style.opacity = 0.87
          this.refDateBox.style.top = `${top - 16}px`
          this.refDateBox.innerHTML = this.date

          this.refBarFollowMouse.style.opacity = 1
          this.refBarFollowMouse.style.top = `${top}px`

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

    this.renderTimeline = () => {
      // debug('this.renderTimeline')
      if (!this.timeline) { return <div /> }
      return (
        <div onMouseEnter={() => this.showDateBar(true)} >
          {
            this.timeline.map((data, index) => {
              let date = data[0]
              const top = data[1]
              const zIndex = data[2]
              if (date === 0) date = '神秘时间'
              return (
                <div
                  onTouchTap={this.scrollToPosition}
                  key={index.toString()}
                  style={{
                    position: 'absolute',
                    boxSizing: 'border-box',
                    borderRadius: 11,
                    fontSize: 13,
                    top,
                    zIndex,
                    opacity: 0.54,
                    color: 'rgba(0, 0, 0, 1)',
                    backgroundColor: 'white',
                    paddingTop: 4,
                    paddingBottom: 4,
                    paddingLeft: 8,
                    right: (data[0] === 0) ? 8 : 20,
                    textAlign: 'center'
                  }}
                >
                  { date }
                </div>
              )
            })
          }
        </div>
      )
    }
  }

  componentWillUnmount() {
    clearTimeout(this.time)
  }


  renderLater() {
    clearTimeout(this.timeRenderLater)
    this.timeRenderLater = setTimeout(() => ReactDom.render(
      <div>{ this.renderTimeline() }</div>, document.getElementById('timeline')
    ), 100)
  }

  render() {
    // debug('render PhotoList, this.props', this.props)
    document.body.onmousemove = this.onMouseMove
    document.body.onmouseleave = () => (this.onMouseDown = false)
    document.body.onmouseup = () => (this.onMouseDown = false)
    return (
      <div style={this.props.style}>
        {/* 图片列表 */}
        <div style={{ display: 'flex', width: '100%', height: '100%' }} >
          <AutoSizer>
            {({ height, width }) => {
              /* get PhotoInfo */
              const PhotoInfo = this.props.setPhotoInfo(height, width, this.props.media)

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
              this.photoListWithSameDate = PhotoInfo.photoListWithSameDate

              /* get timeline */
              this.timeline = this.props.getTimeline(this.photoDates, this.indexHeightSum, this.maxScrollTop, this.height)
              // debug('Get this.timeline', this.timeline, this.height, this.width)

              const estimatedRowSize = PhotoInfo.rowHeightSum / PhotoInfo.allHeight.length
              const rowHeight = ({ index }) => PhotoInfo.allHeight[index]

              /* get previousIndex */
              let previousScrollTop = 0
              if (this.props.memoize().currentScrollTop) {
                previousScrollTop = this.props.memoize().currentScrollTop
              } else if (this.props.memoize().currentDigest) {
                this.photoMapDates.forEach((list, index) => {
                  const Got = list.photos.findIndex(photo => photo.hash === this.props.memoize().currentDigest)
                  if (Got >= 0) {
                    previousScrollTop = this.indexHeightSum[index - 1]
                  }
                })
              }

              /* function to render each row */
              const rowRenderer = ({ key, index, style, isScrolling }) => (
                <div key={key} style={style} >
                  <RenderListByRow
                    lookPhotoDetail={this.props.lookPhotoDetail}
                    isScrolling={isScrolling}
                    list={this.photoMapDates[index]}
                    photoListWithSameDate={this.photoListWithSameDate.find(item => item.date === this.photoMapDates[index].date)}
                    ipcRenderer={this.props.ipcRenderer}
                    addListToSelection={this.props.addListToSelection}
                    removeListToSelection={this.props.removeListToSelection}
                    selectedItems={this.props.selectedItems}
                    getHoverPhoto={this.props.getHoverPhoto}
                    shiftStatus={this.props.shiftStatus}
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
                    scrollTop={previousScrollTop}
                    overscanRowCount={10}
                    style={{ outline: 'none' }}
                  />
                </div>
              )
            }}
          </AutoSizer>
        </div>

        {/* 时间轴 */}
        <div
          ref={ref => (this.refBackground = ref)}
          style={{ position: 'absolute', height: '100%', width: 80, right: 16 }}
          onMouseLeave={() => {
            if (!this.onMouseDown) this.showDateBar(false)
            this.scrollTop = null
          }}
          onMouseEnter={() => this.showDateBar(true)}
          onMouseDown={() => (this.onMouseDown = true)}
          onTouchTap={this.scrollToPosition}
        >
          <div
            ref={ref => (this.refTimeline = ref)}
            style={{ opacity: this.hover ? 1 : 0, transition: 'opacity 200ms' }}
          >
            {/* date list */}
            <div id="timeline" />
            {/* RenderLater is necessary to get this latest value of 'this.timeline' */}
            { this.renderLater() }

            {/* position bar */}
            <div
              ref={ref => (this.refDateBar = ref)}
              style={{
                position: 'absolute',
                top: -1000,
                height: 2,
                width: 32,
                right: 20,
                zIndex: 3,
                backgroundColor: '#4285f4'
              }}
            />
          </div>

          {/* BarFollowMouse */}
          <div
            ref={ref => (this.refBarFollowMouse = ref)}
            style={{
              position: 'absolute',
              top: -1000,
              right: 20,
              height: 2,
              width: 32,
              zIndex: 4,
              transition: 'opacity 200ms',
              opacity: this.hover ? 1 : 0,
              backgroundColor: 'rgba(0,0,0,0.54)'
            }}
          />

          {/* DateBox */}
          <div
            ref={ref => (this.refDateBox = ref)}
            style={{
              position: 'absolute',
              fontSize: 14,
              top: -1000,
              right: 96,
              padding: 12,
              width: 84,
              color: 'white',
              backgroundColor: 'black',
              transition: 'opacity 200ms',
              opacity: this.hover ? 0.87 : 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2
            }}
          />
        </div>
      </div>
    )
  }
}

export default PhotoList
