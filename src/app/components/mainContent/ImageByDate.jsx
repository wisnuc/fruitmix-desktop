/**
  根据日期操作图片
**/

import React, { Component, PropTypes } from 'react';

import Checkbox from '../../React-Redux-UI/src/components/partials/Checkbox';

function getStyles () {
  return {
    listStyle: {
      paddingTop: 10,
    },
    itemStyle: {
      border: '1px solid #a1a1a1',
      borderRadius: 4,
      boxSizing: 'border-box',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 0',
      backgroundSize: 'cover',
      backgroundColor: '#efefef',
      float: 'left',
      marginRight: '15px',
      width: 106,
      height: 106
    }
  };
}

export default class ImageByDate extends Component {
  constructor() {
    super();

    this.selectHandle = this.selectHandle.bind(this);
    this.state = {
      hasSelectedDate: false
    };
  }

  selectHandle() {

  }

  render() {
    const { date } = this.props;
    const { itemStyle, listStyle } = getStyles();

    return (
      <div className="image-group">
        <div className="image-group-header">
          <Checkbox
            value={ date }
            text={ date }
            onChange={ this.selectHandle }>

          </Checkbox>
        </div>
        <div className="image-list" style={ listStyle }>
          <div className="image-item" style={ itemStyle }></div>
          <div className="image-item" style={ itemStyle }></div>
          <div className="image-item" style={ itemStyle }></div>
          <div className="image-item" style={ itemStyle }></div>
          <div className="image-item" style={ itemStyle }></div>
          <div className="image-item" style={ itemStyle }></div>
          <div className="image-item" style={ itemStyle }></div>
        </div>
      </div>
    );
  }
}

ImageByDate.propTypes = {
  /**
    图片信息
  **/
  imageInfo: PropTypes.array.isRequired,

  /**
    日期
  **/
  date: PropTypes.string.isRequired
};
