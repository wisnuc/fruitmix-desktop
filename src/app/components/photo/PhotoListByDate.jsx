/**
  PhotoListByDate.jsx
**/

import React, { Component, PropTypes } from 'react';
import PhotoItem from './PhotoItem';
import PhotoSelectDate from './PhotoSelectDate';
import SelectIconButton from './SelectIconButton';

import { formatDate } from '../../utils/datetime';

export default class PhotoListByDate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      action: 'on'
    };

    this.selectSingleItem = (action, itemIndex) => {
      let photoItem = this.refs['photoItem' + itemIndex];
      let selectDate = this.refs['selectDate'];
      let isOn = action === 'on';

      props[(isOn ? 'add' : 'remove') + 'ListToSelection'](photoItem.props.path);

      setTimeout(() =>
        isOn
          ? (this.selectionRefs.every(refName => this.refs[refName].state.action === 'on') && selectDate.onSelected(true))
          : (this.selectionRefs.every(refName => this.refs[refName].state.action === 'off') && selectDate.offSelected(true))
      , 0);
    }
  }

  render() {
    let { style, date, photos, lookPhotoDetail } = this.props;
    let icon;

    return (
      <div>
        {/* 日期 */}
        <div style={{ marginBottom: 15 }}>
          <SelectIconButton
            ref="selectDate"
            style={{ display: 'inline-block', width: 18, height: 18, marginRight: 8 }}
            selectBehavior={ action => this.selectionRefs.forEach(refName => this.refs[refName][action + 'Selected']()) } />

          <PhotoSelectDate
            style={{ display: 'inline-block' }}
            primaryText={ date } />
        </div>

         {/* 照片 */}
         <div style={ style }>
           { photos.map((photo, index) => (
               <div style={{ position: 'relative' }}>
                 { this.state.action === 'pending'
                     ? (null)
                     : (<SelectIconButton
                         ref={ 'selectSingleItem' + index }
                         style={{ position: 'absolute', left: 5, top: 5, width: 18, height: 18 }}
                         selectBehavior={ action => this.selectSingleItem(action, index) } />
                        )
                 }
                 <PhotoItem
                   ref={ 'photoItem' + index }
                   style={{ width: 150, height: 158, marginRight: 6, marginBottom: 6 }}
                   lookPhotoDetail={ lookPhotoDetail }
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
      .filter(refName => refName.indexOf('selectSingleItem') >= 0);
  }
}

PhotoListByDate.propTypes = {
  style: PropTypes.object,
  date: PropTypes.string.isRequired,
  photos: PropTypes.array.isRequired,
  addListToSelection: PropTypes.func.isRequired,
  removeListToSelection: PropTypes.func.isRequired,
  lookPhotoDetail: PropTypes.func.isRequired
};
