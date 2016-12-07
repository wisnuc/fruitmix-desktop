/**
  PhotoListByDate.jsx
**/

import React, { Component, PropTypes } from 'react';
import PhotoItem from './PhotoItem';
import PhotoSelectDate from './PhotoSelectDate';
import SelectIconButton from './SelectIconButton';

import { formatDate } from '../../utils/datetime';

export default class PhotoListByDate extends Component {
  constructor() {
    super();

    this.state = {
      action: 'on'
    };
  }

  render() {
    let { style, date, photos } = this.props;
    let icon;

    return (
      <div>
        {/* 日期 */}
        <PhotoSelectDate
          style={{ marginBottom: 15 }}
          primaryText={ date }
          addListToSelection={ () => this.selectionRefs.forEach(refName => this.refs[refName].onSelected()) }
          removeListToSelection={ () => this.selectionRefs.forEach(refName => this.refs[refName].offSelected()) } />

         {/* 照片 */}
         <div style={ style }>
           { photos.map((photo, index) => (
               <div style={{ position: 'relative' }}>
                 { this.state.action === 'pending'
                     ? (null)
                     : (<SelectIconButton ref={ 'selectAction' + index } style={{ position: 'absolute', left: 5, top: 5, width: 18, height: 18 }} />)
                 }
                 <PhotoItem
                   style={{ width: 150, height: 158, marginRight: 6, marginBottom: 6 }}
                   digest={ photo.digest }
                   path={ photo.path }
                   key={ photo.digest } />
               </div>
             ))
           }
         </div>
      </div>
    );
  }

  componentDidMount() {
    this.selectionRefs = Object
      .keys(this.refs)
      .filter(refName => refName.indexOf('selectAction') >= 0);
  }
}

PhotoListByDate.propTypes = {
  style: PropTypes.object,
  date: PropTypes.string.isRequired,
  photos: PropTypes.array.isRequired
};
