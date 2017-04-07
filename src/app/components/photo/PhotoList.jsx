import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import EventListener from 'react-event-listener'
import { List } from 'react-virtualized/dist/commonjs/List'
import { Paper, Card, IconButton, CircularProgress } from 'material-ui'
import Carousel from './Carousel'
import PhotoDetail from './PhotoDetail'
import { formatDate } from '../../utils/datetime'
import RenderListByRow from './RenderListByRow'
import loading from '../../../assets/images/index/loading.gif'

const debug = Debug('component:photoApp:PhotoList')
const findPath = (items, path) => items.findIndex(item => item === path)
const findPhotosByDate = (photos, date) => photos.filter(photo => formatDate(photo.exifDateTime) === date)
const detectAllOffChecked = photoListByDates => photoListByDates.every(p => p.detectIsAllOffChecked())

export default class PhotoList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      carouselItems: [],
      openDetail: false
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
      debug('111111111this.state.activeIndex, seqIndex, digest', this.state.activeIndex, this.seqIndex, digest)
      this.setState({ openDetail: true })
    }
  }
  getChildContext() {
    return { photos: this.props.photoMapDates }
  }

  handleResize = () => {
    this.forceUpdate()
  }

  renderList = () => {
    const photoSum = this.props.photoMapDates.length
    if (photoSum === 0) return <div />
    const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    const height = clientHeight - 56
    const width = this.props.leftNav ? clientWidth - 210 : clientWidth
    debug('this.props.photoMapDates', this.props.photoMapDates)
    const rowRenderer = ({ key, index, style, isScrolling }) => {
      const list = this.props.photoMapDates[index]
      // if (isScrolling) return <div />
        /*
      if (isScrolling) {
        return (
          <div key={key} style={style}>
            <div style={{ padding: '0 6px 6px 6px' }}>
              {
                <div style={{ marginBottom: 15 }}>
                  <div
                    style={{ display: 'inline-block' }}
                    primaryText={list.date}
                  />
                </div>
            }
              <div style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start' }}>
                { list.photos.map(() => (
                  <div
                    style={{
                      width: 150,
                      height: 158,
                      marginRight: 6,
                      marginBottom: 6,
                      display: 'flex',
                      flexFlow: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Loading
                  </div>
              ))
              }
              </div>
            </div>
          </div>)
      }
      */
      return (
        <div
          key={key}
          style={style}
        >
          <RenderListByRow
            addListToSelection={this.addListToSelection}
            allPhotos={this.props.allPhotos}
            lookPhotoDetail={this.lookPhotoDetail}
            onAddHoverToList={(photoListByDates) => {
              this.photoListByDates = photoListByDates
              photoListByDates.forEach(p => p.addHoverToAllItem())
            }}
            onDetectAllOffChecked={detectAllOffChecked}
            onRemoveHoverToList={(photoListByDates) => {
              const isAllOffChecked = photoListByDates.every(p => p.detectIsAllOffChecked())
              isAllOffChecked && photoListByDates.forEach(p => p.removeHoverToAllItem())
            }}
            removeListToSelection={this.removeListToSelection}
            style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start' }}
            photos={list.photos}
            date={list.date}
            first={list.first}
            isScrolling={isScrolling}
            photoSum={photoSum}
          />
        </div>
      )
    }
    const AllHeight = []
    this.props.photoMapDates.map(list => (AllHeight.push(
      164 * Math.ceil(list.photos.length / Math.floor(width / 156)) + !!list.first * 40
    )))
    const rowHeight = ({ index }) => AllHeight[index]
    return (
      <List
        height={height}
        width={width}
        rowCount={this.props.photoMapDates.length}
        rowHeight={rowHeight}
        rowRenderer={rowRenderer}
      />
    )
  }

  render() {
    debug('render PhotoList, this.props', this.props)
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
      </Paper>
    )
  }
}

PhotoList.childContextTypes = {
  photos: PropTypes.array.isRequired
}
