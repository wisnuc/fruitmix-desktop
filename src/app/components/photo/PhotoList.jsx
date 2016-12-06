/**
  PhotoList.jsx
**/

import React, { Component } from 'react';
import PhotoListByDate from './PhotoListByDate';

import { formatDate } from '../../utils/datetime';

export default class PhotoList extends Component {
  constructor(props) {
    super(props);
  }

  findDatesByExifDateTime(dataSource) {
    return dataSource
      .map(dataItem => formatDate(dataItem.exifDateTime))
      .filter((date, index, dates) => !index || dates.indexOf(date) === index && date)
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
        <div>
          { photoDates.map((date, index) => (
            <PhotoListByDate
              style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start', marginBottom: 15 }}
              date={ date }
              photos={ this.findPhotosByDate(photos, date) }
              key={ date }/>
            ))
          }
        </div>
      </div>
    );
  }
}
