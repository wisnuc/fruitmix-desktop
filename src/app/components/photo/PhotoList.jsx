import React, { Component, PropTypes } from 'react'
import Debug from 'debug'
import { Paper, Card, IconButton, CircularProgress } from 'material-ui'
import Carousel from './Carousel'
import PhotoDetail from './PhotoDetail'
import LazyloadBox from './scrollLazyload/LazyloadBox'
import ScrollFlush from './scrollLazyload/ScrollFlush'
import { formatDate } from '../../utils/datetime'
import PhotoListByDate from './PhotoListByDate'

const debug = Debug('component:photoApp:PhotoList')
const findPath = (items, path) => items.findIndex(item => item === path)
const findPhotosByDate = (photos, date) => photos.filter(photo => formatDate(photo.exifDateTime) === date)
const detectAllOffChecked = photoListByDates => photoListByDates.every(p => p.detectIsAllOffChecked())

export default class PhotoList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      carouselItems: [],
      activeIndex: false
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
    this.lookPhotoDetail = (seqIndex, activeIndex) => {
      this.setState({ activeIndex })
      this.seqIndex = seqIndex
    }

    this.renderCarousel = () => {
      if (!this.state.carouselItems.length) return <div />
      debug('this.renderCarousel')
      return (
        <Paper
          style={{
            position: 'fixed',
            bottom: 15,
            width: '75%'
          }}
        >
          <Carousel
            ClearAll={() => this.setState({ carouselItems: [] })}
            removeListToSelection={this.removeListToSelection}
            style={{ backgroundColor: '#fff', height: 180, borderRadius: 4, boxShadow: '0 0 10px rgba(0,0,0,.3)' }}
            items={this.state.carouselItems}
          />
        </Paper>
      )
    }
    this.renderPhotoDetail = photos => photos.length && this.state.activeIndex !== false
        ? (<PhotoDetail
          closePhotoDetail={() => this.setState({ activeIndex: false })}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%'
          }}
          deltaWidth={document.documentElement.clientWidth}
          deltaHeight={document.documentElement.clientHeight}
          items={photos[this.state.activeIndex].photos}
          seqIndex={this.seqIndex}
          activeIndex={this.state.activeIndex}
        />)
      : <div />
  }

  getChildContext() {
    return { photos: this.props.photoMapDates }
  }

  render() {
    debug('this.props', this.props)
    let date=''
    if(this.props.photoMapDates[0]) date=this.props.photoMapDates[0].date
    return (
      <Paper style={this.props.style}>
        {/* 图片列表 */}
        <PhotoListByDate
          addListToSelection={this.addListToSelection}
          allPhotos={this.props.allPhotos}
          lookPhotoDetail={this.lookPhotoDetail}
          onAddHoverToList={
            (photoListByDates) => {
              this.photoListByDates = photoListByDates; photoListByDates.forEach(p => p.addHoverToAllItem())
            }
          }
          onDetectAllOffChecked={detectAllOffChecked}
          onGetPhotoListByDates={photoListByDates => this.photoListByDates = photoListByDates}
          onRemoveHoverToList={
            (photoListByDates) => {
              const isAllOffChecked = photoListByDates.every(p => p.detectIsAllOffChecked())
              isAllOffChecked && photoListByDates.forEach(p => p.removeHoverToAllItem())
            }
          }
          removeListToSelection={this.removeListToSelection}
          style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start' }}
          ref={'photoListByDate'}
          photos={this.props.photoMapDates}
          date={date}
        />
        {/*
          list={this.props.photoMapDates}
          selectedList={this.state.carouselItems}
          pageSize={7}
        
        */}

        {/* 轮播 */}
        {/* this.renderCarousel() */}
        { this.renderCarousel() }

        {/* 查看大图 */}
        { this.renderPhotoDetail(this.props.photoMapDates) }
      </Paper>
    )
  }
}

PhotoList.childContextTypes = {
  photos: PropTypes.array.isRequired
}
