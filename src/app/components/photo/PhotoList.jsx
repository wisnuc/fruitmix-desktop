import React, { Component, PropTypes } from 'react'
import Debug from 'debug'
import Carousel from './Carousel'
import PhotoDetail from './PhotoDetail'
import FadingToAnimate from './FadingToAnimate'
import LazyloadBox from './scrollLazyload/LazyloadBox'
import ScrollFlush from './scrollLazyload/ScrollFlush'
import { formatDate } from '../../utils/datetime'

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
      debug('this.renderCarousel')
      return (
        <FadingToAnimate
          style={{
            position: 'fixed',
            bottom: 15,
            width: '75%',
            zIndex: 10001
          }}
          flag={this.state.carouselItems.length ? 'in' : 'out'}
        >
          <Carousel
            onClearHoverToList={() => { this.photoListByDates.forEach(p => p.removeCheckToAllItem()) }}
            style={{ backgroundColor: '#fff', height: 180, borderRadius: 4, boxShadow: '0 0 10px rgba(0,0,0,.3)' }}
            items={this.state.carouselItems}
          />
        </FadingToAnimate>
      )
    }
    this.renderPhotoDetail = photos => photos.length && this.state.activeIndex !== false
        ? (<PhotoDetail
          closeMaskLayer={() => this.setState({ activeIndex: false })}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 10004
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
    return (
      <div style={this.props.style}>
        {/* 图片列表 */}
        <ScrollFlush
          allPhotos={this.props.allPhotos}
          addListToSelection={this.addListToSelection}
          lookPhotoDetail={this.lookPhotoDetail}
          removeListToSelection={this.removeListToSelection}
          list={this.props.photoMapDates}
          onDetectAllOffChecked={detectAllOffChecked}
          onGetPhotoListByDates={photoListByDates => this.photoListByDates = photoListByDates}
          onAddHoverToList={
            (photoListByDates) => {
              this.photoListByDates = photoListByDates; photoListByDates.forEach(p => p.addHoverToAllItem())
            }
          }
          onRemoveHoverToList={
            (photoListByDates) => {
              const isAllOffChecked = photoListByDates.every(p => p.detectIsAllOffChecked())
              isAllOffChecked && photoListByDates.forEach(p => p.removeHoverToAllItem())
            }
          }
          pageSize={7}
        >
          <LazyloadBox />
        </ScrollFlush>

        {/* 轮播 */}
        {/* this.renderCarousel() */}
        { this.renderCarousel() }

        {/* 查看大图 */}
        { this.renderPhotoDetail(this.props.photoMapDates) }
      </div>
    )
  }
}

PhotoList.childContextTypes = {
  photos: PropTypes.array.isRequired
}
