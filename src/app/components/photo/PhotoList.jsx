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
        width: 'calc(100% - 50px)'
      },
      photoDetail: {
        position: 'fixed',
        // left: '50%',
        // top: '50%',
        // width: 781,
        // height: 648,
        // transform: 'translate(-50%, -50%)',
        left: 60,
        right: 60,
        width: 'calc(100% - 120px)',
        top: 60,
        bottom: 60,
        height: 'calc(100% - 120px)',
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
        <Carousel style={{ backgroundColor: '#fff', height: 180, borderRadius: 4, boxShadow: '0 0 10px rgba(0,0,0,.3)' }} items={ this.state.carouselItems } />
      </FadingToAnimate>
    );
    this.renderPhotoDetail = (photos) => {
      return photos.length && this.state.activeIndex !== false
        ? (<PhotoDetail
            closeMaskLayer={ () => this.setState({ activeIndex: false }) }
            style={ this.style.photoDetail }
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

  render() {
    // this.photoMapDates = this.photoDates.map(date => ({
    //   date,
    //   photos: this.findPhotosByDate(this.allPhotos, date)
    // }));
    // let store = window.store;
    // let dispatch = store.dispatch;
    // let photos = this.photos = store.getState().media.data;
    // let photoDates = this.findDatesByExifDateTime(photos);
    return (
      <div style={ this.props.style }>
        <ScrollFlush
          allPhotos={this.props.allPhotos}
          addListToSelection={ this.addListToSelection }
          lookPhotoDetail={ this.lookPhotoDetail }
          removeListToSelection={ this.removeListToSelection }
          list={this.props.photoMapDates}
          pageSize={7}>
          <LazyloadBox />
        </ScrollFlush>

        {/* photoDates.map((date, index) => (
          <PhotoListByDate
            style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start', marginBottom: 15 }}
            date={ date }
            allPhotos={ photos }
            photos={ this.findPhotosByDate(photos, date) }
            addListToSelection={ this.addListToSelection }
            lookPhotoDetail={ this.lookPhotoDetail }
            removeListToSelection={ this.removeListToSelection }
            key={ date }/>
          ))
        */}
        {/* 轮播 */}
        { this.renderCarousel() }

        {/* 查看大图 */}
        { this.renderPhotoDetail(this.props.photoMapDates) }
      </div>
    );
  }
}

PhotoList.childContextTypes = {
  photos: PropTypes.array.isRequired
};
