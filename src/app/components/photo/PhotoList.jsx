/**
  PhotoList.jsx
**/

import React, { Component, PropTypes } from 'react';
import PhotoListByDate from './PhotoListByDate';
import Carousel from './Carousel';
import PhotoDetail from './PhotoDetail';
import FadingToAnimate from './FadingToAnimate';
import LazyloadBox from '../scrollLazyload/LazyloadBox';
import ScrollFlush from '../scrollLazyload/ScrollFlush';
import { formatDate } from '../../utils/datetime';

export default class PhotoList extends Component {
  constructor(props) {
    super(props);

    this.style = {
      carousel: {
        bottom: 15,
        left: 0,
        margin: '0 25px',
        position: 'fixed',
        width: 'calc(100% - 50px)',
        zIndex: 200
      },
      photoDetail: {
        position: 'fixed',
        // left: '50%',
        // top: '50%',
        // width: 781,
        // height: 648,
        // transform: 'translate(-50%, -50%)',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 10002
      }
    };

    this.state = {
      carouselItems: [],
      activeIndex: false
    };

    this.addListToSelection = (path) => {
      const hasPath = this.state.carouselItems.findIndex(item => item === path) >= 0;

      !hasPath && this.setState(prevState => ({
        carouselItems: [
          ...prevState.carouselItems,
          path
        ]
      }));
    };
    this.removeListToSelection = (path) => {
      const hasPath = this.state.carouselItems.findIndex(item => item === path) >= 0;

      hasPath && this.setState(prevState => {
        let index = this.findPath(prevState.carouselItems, path);

        return {
          carouselItems: [
            ...prevState.carouselItems.slice(0, index),
            ...prevState.carouselItems.slice(index + 1)
          ]
        }
      });
    };
    this.lookPhotoDetail = (seqIndex, activeIndex) => {
      this.setState({ activeIndex });
      this.seqIndex = seqIndex;
    };

    this.renderCarousel = () => (
      <FadingToAnimate style={ this.style.carousel } flag={ this.state.carouselItems.length ? 'in' : 'out' }>
        <Carousel
          onClearHoverToList={() => { this.photoListByDates.forEach(p => p.removeCheckToAllItem())}}
          style={{ backgroundColor: '#fff', height: 180, borderRadius: 4, boxShadow: '0 0 10px rgba(0,0,0,.3)' }}
          items={ this.state.carouselItems } />
      </FadingToAnimate>
    );
    this.renderPhotoDetail = (photos) => {
      return photos.length && this.state.activeIndex !== false
        ? (<PhotoDetail
            closeMaskLayer={ () => this.setState({ activeIndex: false }) }
            style={ this.style.photoDetail }
            deltaWidth={ document.documentElement.clientWidth }
            deltaHeight={ document.documentElement.clientHeight }
            items={ photos[this.state.activeIndex].photos }
            seqIndex={ this.seqIndex }
            activeIndex={ this.state.activeIndex } />)
        : void 0;
    };
  }

  getChildContext() {
    return { photos: this.props.photoMapDates };
  }

  findPath(items, path) {
    return items.findIndex(item => item === path);
  }

  findPhotosByDate(photos, date) {
    return photos.filter(photo => formatDate(photo.exifDateTime) === date);
  }

  detectAllOffChecked(photoListByDates) {
    return photoListByDates.every(p => p.detectIsAllOffChecked());
  }

  render() {
    return (
      <div style={ this.props.style }>
        {/* 图片列表 */}
        <ScrollFlush
          allPhotos={this.props.allPhotos}
          addListToSelection={ this.addListToSelection }
          lookPhotoDetail={ this.lookPhotoDetail }
          removeListToSelection={ this.removeListToSelection }
          list={this.props.photoMapDates}
          onDetectAllOffChecked={this.detectAllOffChecked}
          onGetPhotoListByDates={photoListByDates => this.photoListByDates = photoListByDates}
          onAddHoverToList={photoListByDates => { this.photoListByDates = photoListByDates; photoListByDates.forEach(p => p.addHoverToAllItem())}}
          onRemoveHoverToList={photoListByDates => {const isAllOffChecked = photoListByDates.every(p => p.detectIsAllOffChecked()); isAllOffChecked && photoListByDates.forEach(p => p.removeHoverToAllItem()) }}
          pageSize={7}>
          <LazyloadBox />
        </ScrollFlush>

        {/* 轮播 */}
        {/* this.renderCarousel() */}

        {/* 查看大图 */}
        { this.renderPhotoDetail(this.props.photoMapDates) }
      </div>
    );
  }
}

PhotoList.childContextTypes = {
  photos: PropTypes.array.isRequired
};
