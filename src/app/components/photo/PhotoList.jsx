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
const findPath = (items, path) => items.findIndex(item => item === path)
const detectAllOffChecked = photoListByDates => photoListByDates.every(p => p.detectIsAllOffChecked())

export default class PhotoList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      carouselItems: [],
      openDetail: false,
      hover: false,
    }
    this.clientWidth = ''
    this.clientHeight = ''
    this.maxScrollTop = ''

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
    this.showPicker = (hover) => {
      debug('this.showPicker')
      const tmp = document.getElementsByClassName('ReactVirtualized__Grid')[0]
      debug(tmp, tmp.scrollTop)
      if (!this.state.hover) {
        clearTimeout(this.time)
        this.setState({ hover: true })
        this.time = setTimeout(() => this.setState({ hover: false }), hover ? 100000 : 2000)
      }
    }
    this.scrollToPosition = (top) => {
      const list = document.getElementsByClassName('ReactVirtualized__List')[0]
      list.scrollTop = top
      // const container = document.getElementsByClassName('ReactVirtualized__Grid__innerScrollContainer')[0]
      // debug('container', container, container.style)
      // container.style.maxHeight = `${this.rowHeightSum}px`
      // container.style.height = `${this.rowHeightSum}px`
    }
  }

  renderList = () => {
    const photoSum = this.props.photoMapDates.length
    if (photoSum === 0) return <div />
    this.clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    this.clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    debug('clientHeight', this.clientHeight)
    const height = this.clientHeight - 56
    const width = this.props.leftNav ? this.clientWidth - 210 : this.clientWidth
    // debug('this.props.photoMapDates', this.props.photoMapDates)
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
    const AllHeight = []
    this.props.photoMapDates.map(list => (AllHeight.push(
      216 * Math.ceil(list.photos.length / Math.floor(width / 216)) + !!list.first * 40
    )))
    const rowHeight = ({ index }) => AllHeight[index]
    this.rowHeightSum = 0
    for (let i = 0; i < this.props.photoMapDates.length; i++) {
      this.rowHeightSum += rowHeight({ index: i })
    }
    debug('rowHeightSum', this.rowHeightSum)
    this.maxScrollTop = this.rowHeightSum - this.clientHeight + 56 + 16 * 2
    return (
      <List
        height={height}
        width={width}
        rowCount={this.props.photoMapDates.length}
        rowHeight={rowHeight}
        rowRenderer={rowRenderer}
        onScroll={() => this.showPicker(false)}
        overscanRowCount={6}
        style={{ padding: 16 }}
      />
    )
  }

  renderPicker = () => (
    <div
      style={{
        position: 'fixed',
        height: '100%',
        width: 80,
        right: 16
      }}
      onMouseEnter={() => this.showPicker(true)}
      onMouseLeave={() => this.setState({ hover: false })}
    >
      <FlatButton
        label="Top"
        style={{
          display: this.state.hover ? '' : 'none',
          position: 'fixed',
          width: 80,
          right: 26,
          top: 72
        }}
        onTouchTap={() => this.scrollToPosition(0)}
      />
      <FlatButton
        label="Bottom"
        style={{
          display: this.state.hover ? '' : 'none',
          position: 'fixed',
          width: 80,
          right: 26,
          bottom: 16
        }}
        onTouchTap={() => this.scrollToPosition(this.maxScrollTop)}
      />
    </div>
    )
  render() {
    // debug('render PhotoList, this.props', this.props)
    const photos = this.props.photoMapDates
    if (photos.length === 0) return <div />
    return (
      <Paper
        style={this.props.style}
      >
        {/* 图片列表 */}
        <this.renderList />
        {/* 轮播 */
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
        {/* 查看大图 */
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
        { this.renderPicker() }
      </Paper>
    )
  }

}

PhotoList.childContextTypes = {
  photos: PropTypes.array.isRequired
}
