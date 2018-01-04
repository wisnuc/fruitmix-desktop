import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { List, AutoSizer } from 'react-virtualized'
import RenderListByRow from './RenderListByRow'
import getPhotoInfo from './getPhotoInfo'
import getTimeline from './getTimeline'

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

    this.onRowTouchTap = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }

    this.showDateBar = (op) => {
      // debug('this.showDateBar', op)
      this.hover = op
      if (this.refDateBox) this.refDateBox.style.opacity = op ? 0.87 : 0
      if (this.refTimeline) this.refTimeline.style.opacity = op ? 1 : 0
    }

    this.onScroll = () => {
      if (!this.photoMapDates.length) return
      const list = document.getElementsByClassName('ReactVirtualized__List')[0]
      const currentIndex = this.indexHeightSum.findIndex(data => data > list.scrollTop + this.indexHeightSum[0] * 0.9)
      const percentage = list.scrollTop / this.maxScrollTop
      this.date = this.photoMapDates[currentIndex].date
      this.currentDigest = this.photoMapDates[currentIndex].photos[0].hash
      if (!this.firstScroll) this.props.memoize({ currentDigest: this.currentDigest, currentScrollTop: list.scrollTop })
      // debug('this.props.memoize()', this.props.memoize(), currentIndex, this.indexHeightSum[0])

      /* forceUpdate when first two scroll, this is necessary to show timeline */
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

      /* get mouse position */
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
        const currentIndex = this.indexHeightSum.findIndex(data => data > currentScrollTop + this.indexHeightSum[0] * 0.9)
        if (currentIndex > -1) this.date = this.photoMapDates[currentIndex].date

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

    this.onMouseUp = () => (this.onMouseDown = false)
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  }

  componentDidUpdate() {
    this.onScroll()
  }

  componentWillUnmount() {
    clearTimeout(this.time)
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  renderTimeline() {
    if (!this.timeline) { return <div /> }
    return (
      <div onMouseEnter={() => this.showDateBar(true)} >
        {
          this.timeline.map((data, index) => {
            const { date, top } = data
            if (date === -1) {
              return (
                <div
                  onTouchTap={this.scrollToPosition}
                  key={index.toString()}
                  style={{
                    position: 'absolute',
                    top,
                    height: 2,
                    width: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.27)',
                    marginTop: 4,
                    marginBottom: 4,
                    marginLeft: 8,
                    right: 20
                  }}
                />
              )
            }
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
                  opacity: 0.54,
                  color: 'rgba(0, 0, 0, 1)',
                  backgroundColor: '#FFFFFF',
                  paddingTop: 2,
                  paddingBottom: 2,
                  paddingLeft: 8,
                  right: date === 0 ? 8 : 20,
                  textAlign: 'center'
                }}
              >
                { date === 0 ? i18n.__('Date Unknown Text') : date }
              </div>
            )
          })
        }
      </div>
    )
  }

  render() {
    // debug('render PhotoList, this.props', this.props)
    return (
      <div style={this.props.style}>
        {/* Photo List */}
        <div style={{ display: 'flex', width: '100%', height: '100%' }} >
          <AutoSizer>
            {({ height, width }) => {
              /* get PhotoInfo */
              const PhotoInfo = getPhotoInfo(height, width, this.props.media, i18n.__('Date Unknown Text'))
              // debug('PhotoInfo', PhotoInfo)

              /* set global variant */
              this.height = height
              this.width = width
              this.photoMapDates = PhotoInfo.photoMapDates
              this.indexHeightSum = PhotoInfo.indexHeightSum
              this.maxScrollTop = PhotoInfo.maxScrollTop
              this.size = PhotoInfo.size

              /* get timeline */
              this.timeline = getTimeline(PhotoInfo.photoDates, this.indexHeightSum, this.maxScrollTop, this.height)
              console.log('Get this.timeline')

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
              // console.log('get previousIndex', this.props.memoize(), previousScrollTop)

              /* function to render each row */
              const rowRenderer = ({ key, index, style, isScrolling }) => (
                <div key={key} style={style} >
                  <RenderListByRow
                    rowSum={this.photoMapDates.length}
                    lookPhotoDetail={this.props.lookPhotoDetail}
                    isScrolling={isScrolling}
                    list={this.photoMapDates[index]}
                    photoListWithSameDate={PhotoInfo.photoListWithSameDate.find(item => item.date === this.photoMapDates[index].date)}
                    ipcRenderer={this.props.ipcRenderer}
                    addListToSelection={this.props.addListToSelection}
                    removeListToSelection={this.props.removeListToSelection}
                    selectedItems={this.props.selectedItems}
                    getHoverPhoto={this.props.getHoverPhoto}
                    shiftStatus={this.props.shiftStatus}
                    size={this.size}
                  />
                </div>
              )

              return (
                <div onTouchTap={e => this.onRowTouchTap(e)} key={this.size}>
                  <List
                    height={height}
                    width={width}
                    estimatedRowSize={estimatedRowSize}
                    rowHeight={rowHeight}
                    rowRenderer={rowRenderer}
                    rowCount={PhotoInfo.photoDates.length}
                    onScroll={this.onScroll}
                    scrollTop={previousScrollTop}
                    overscanRowCount={2}
                    style={{ outline: 'none' }}
                  />
                </div>
              )
            }}
          </AutoSizer>
        </div>

        {/* Timeline */}
        <div
          ref={ref => (this.refBackground = ref)}
          style={{ position: 'absolute', height: '100%', width: 80, right: 16 }}
          onMouseLeave={() => !this.onMouseDown && this.showDateBar(false)}
          onMouseEnter={() => this.showDateBar(true)}
          onMouseDown={() => (this.onMouseDown = true)}
          onTouchTap={this.scrollToPosition}
        >
          <div
            ref={ref => (this.refTimeline = ref)}
            style={{ opacity: this.hover ? 1 : 0, transition: 'opacity 200ms' }}
          >
            { this.renderTimeline() }

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
