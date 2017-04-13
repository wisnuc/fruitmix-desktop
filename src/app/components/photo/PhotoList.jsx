import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import EventListener from 'react-event-listener'
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
      scrollToIndex: 0
    }

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
  }

  renderList = () => {
    const photoSum = this.props.photoMapDates.length
    if (photoSum === 0) return <div />
    const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    const height = clientHeight - 56
    const width = this.props.leftNav ? clientWidth - 210 : clientWidth
    // debug('this.props.photoMapDates', this.props.photoMapDates)
    const rowRenderer = ({ key, index, style, isScrolling }) => {
      const list = this.props.photoMapDates[index]
      // if (isScrolling) return <div />
        /*
      if (isScrolling) {
      }
      return (
        <div key={key} style={style}>
          <div style={{ padding: '0 6px 6px 6px' }}>
            { list.first &&
              <div style={{ marginBottom: 15 }}>
                <div style={{ display: 'inline-block' }}>{ list.date }</div>
              </div>
            }
            <div style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start' }}>
              { isScrolling ? list.photos.map(() => (
                <div
                  style={{
                    width: 210,
                    height: 210,
                    marginRight: 6,
                    marginBottom: 6,
                    backgroundColor: '#eeeeee'
                  }}
                />)) :
                list.photos.map(photo => (
                  <PhotoItem
                    style={{ width: 210, height: 210, marginRight: 6, marginBottom: 6 }}
                    lookPhotoDetail={this.lookPhotoDetail}
                    digest={photo.digest}
                    path={photo.path}
                    key={photo.digest}
                  />
                )
                )
              }
            </div>
          </div>
        </div>)
      */
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
    let rowHeightSum = 0
    for (let i = 0; i < this.props.photoMapDates.length; i++) {
      rowHeightSum += rowHeight({ index: i })
    }
    // debug('rowHeightSum', rowHeightSum)
    return (
      <List
        height={height}
        width={width}
        rowCount={this.props.photoMapDates.length}
        rowHeight={rowHeight}
        rowRenderer={rowRenderer}
        scrollToIndex={this.state.scrollToIndex}
        onScroll={() => this.setState({ hover: true })}
        overscanRowCount={6}
      />
    )
  }

  componentDidUpdate() {
  }

  handleResize = () => {
    this.forceUpdate()
  }

  renderPicker = () => (
    <div
      style={{
        position: 'fixed',
        width: 80,
        height: '100%',
        backgroundColor: this.state.hover ? 'white' : 'white',
        right: 26
      }}
      onMouseEnter={() => this.setState({ hover: true })}
      onMouseLeave={() => this.setState({ hover: false })}
    >
      <FlatButton
        label="Top"
        style={{
          display: this.state.hover ? '' : 'none',
          position: 'absolute',
          width: 80,
          top: 76
        }}
        onTouchTap={() => this.setState({ scrollToIndex: 0 })}
      />
      <FlatButton
        label="Bottom"
        style={{
          display: this.state.hover ? '' : 'none',
          position: 'absolute',
          width: 80,
          bottom: 86
        }}
        onTouchTap={() => this.setState({ scrollToIndex: (this.props.photoMapDates.length - 1) })}
      />
    </div>
    )
  render() {
    // debug('render PhotoList, this.props', this.props)
    const photos = this.props.photoMapDates
    if (photos.length === 0) return <div />
    return (
      <Paper style={this.props.style}>
        <EventListener
          target="window"
          onResize={this.handleResize}
        />
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
