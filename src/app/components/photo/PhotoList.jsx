/**
  PhotoList.jsx
**/

import React, { Component, PropTypes } from 'react';
import PhotoListByDate from './PhotoListByDate';
import Carousel from './Carousel';

import { formatDate } from '../../utils/datetime';

export default class PhotoList extends Component {
  constructor(props) {
    super(props);

    this.style = {
      carousel: {
        backgroundColor: '#fff',
        borderRadius: 4,
        boxShadow: '0 0 10px rgba(0,0,0,.3)',
        bottom: 15,
        left: 0,
        margin: '0 25px',
        height: 180,
        position: 'fixed',
        width: 'calc(100% - 50px)'
      }
    };

    this.state = {
      carouselItems: []
    };

    this.addListToSelection = (path) => {
      this.setState({
        carouselItems: [
          ...this.state.carouselItems,
          path
        ]
      })
    };
    this.removeListToSelection = (path) => {
      const index = this.findItemByDigest(this.state.carouselItems, path);

      this.setState({
        carouselItems: [
          ...this.state.carouselItems.slice(0, index),
          ...this.state.carouselItems.slice(index + 1)
        ]
      });
    };

    this.renderCarousel = () => {
      if (this.state.carouselItems.length) {
        return (
          <Carousel
            style={ this.style.carousel }
            items={ this.state.carouselItems } />
        );
      }
    }
  }

  findDatesByExifDateTime(dataSource) {
    return dataSource
      .map(dataItem => formatDate(dataItem.exifDateTime))
      .filter((date, index, dates) => !index || dates.indexOf(date) === index && date)
  }

  findPath(items, path) {
    return items.findIndex(item => item === path);
  }

  findPhotosByDate(photos, date) {
    return photos.filter(photo => formatDate(photo.exifDateTime) === date);
  }

  render() {
    let store = window.store;
    let dispatch = store.dispatch;
    let photos = store.getState().media.data.slice(0, 200);
    let photoDates = this.findDatesByExifDateTime(photos);

    return (
      <div style={ this.props.style }>
        { photoDates.map((date, index) => (
          <PhotoListByDate
            style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start', marginBottom: 15 }}
            date={ date }
            photos={ this.findPhotosByDate(photos, date) }
            addListToSelection={ this.addListToSelection }
            removeListToSelection={ this.removeListToSelection }
            key={ date }/>
          ))
        }
        { this.renderCarousel() }
      </div>
    );
  }
}
