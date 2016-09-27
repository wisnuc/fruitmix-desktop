/**
  所有照片
**/

import React, { Component, PropTypes } from 'react';

import ImageByDate from './ImageByDate.jsx';

// 图片轮播组件
import Carousel from '../../React-Redux-UI/src/components/transitions/Carousel';

function getStyles () {
  return {
    operationBarStyle: {
      padding: '0 30px'
    },
    dragStyle: {
      position: 'fixed',
      backgroundColor: '#fff',
    	boxSizing: 'border-box',
    	border: '1px solid #d3d3d3',
    	borderRadius: 4,
      boxShadow: "5px 5px 2px rgba(0,0,0,.25)",
    	height: 155
    },
    dragButtonStyle: {
      borderRadius: 4,
      backgroundColor: '#ebebeb',
      color: '#2196f3',
      display: 'inline-block',
      fontSize: 14,
      lineHeight: '30px',
      marginRight: 30,
      marginTop: 15,
      marginBottom: 15,
      textAlign: 'center',
      width: 80
    }
  }
}


export default class AllPhotos extends Component {
  constructor() {
    super();
  }

  getDragElementRect() {
    const leftSideBarWidth = 241;
    const totalGap = 70;
    const bottom = 10;
    const rightPanelWidth = window.innerWidth - leftSideBarWidth;
    const width = rightPanelWidth - totalGap;
    const originPosLeft = parseInt((rightPanelWidth - width) / 2);

    return {
      width: width,
      left: originPosLeft + leftSideBarWidth,
      bottom: bottom
    }
  }

  render() {
    const { dragStyle, dragButtonStyle, operationBarStyle } = getStyles();
    const dragElementRect = this.getDragElementRect();
    const newDragStyle = Object.assign({}, dragStyle, dragElementRect);
    const clearAllButtonStyle = Object.assign({}, dragButtonStyle, { marginRight: 0 });

    return (
      <div className="view-image">
        <div className="image-group">
          <ImageByDate imageInfo={ [1] } date="2016-8-12"></ImageByDate>
        </div>
        <div className="image-selected" style={ newDragStyle }>
          <div className="image-operation clearfix" style={ operationBarStyle }>
            <div className="operations fl">
              <button style={ dragButtonStyle }>分享</button>
              <button style={ dragButtonStyle }>相册</button>
              <button style={ dragButtonStyle }>下载</button>
            </div>
            <button className="fr" style={ clearAllButtonStyle }>清除全部</button>
          </div>
          <div className="image-carousel">
            {/* 图片轮播 */}
            <Carousel
              className="carousel"
              width={ dragElementRect.width - 2 }
              height={ 75 }
              data={ [1, 2, 3, 4] }>
            </Carousel>
          </div>
        </div>
      </div>
    );
  }
}
