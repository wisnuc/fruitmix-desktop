/**
  PhotoList.jsx
**/

import React, { Component } from 'react';
import PhotoItem from './PhotoItem';

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

  render() {
    let store = window.store;
    let dispatch = store.dispatch;
    let photos = store.getState().media.data.slice(0, 200);
    let photoDates = this.findDatesByExifDateTime(photos);

    return (
      <div className="image-group" style={{ paddingTop: 66 }}>
        <div>
          { photoDates.map((date, index) => {
              return (
                <div className="clearfix" key={ "photodate" + index }>

                  {/* 日期 */}
                  <div style={{ margin: '0 0 8px', fontFamily: 'helvetica', color: '#6d6d6d', fontSize: 12, lineHeight: '20px' }}>
                    <div>
                      <span className="status-widget select-status-widget unselected-status-widget"><i>{ date }</i></span>
                      <span style={{ marginLeft: 5 }}>{ date }</span>
                    </div>
                  </div>

                  {/* 照片 */}
                  <div style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start', marginBottom: 15 }}>
                    { photos.map(photo => {
                        if (formatDate(photo.exifDateTime) === date) {
                          return (
                            <PhotoItem
                              state={ photo }
                              key={ photo.digest }
                            />
                          );
                        }
                      })
                    }
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}
