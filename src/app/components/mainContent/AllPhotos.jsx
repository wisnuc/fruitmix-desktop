/**
  所有照片
**/

import React, { Component, PropTypes } from 'react';

import ImageByDate from './ImageByDate.jsx';

import Action from '../../actions/action';

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

  selectedItemHandle(index, el, date, hasChecked) {
    const { dispatch } = this.props;

    if (hasChecked) {
      dispatch(Action.addDragImageItem(el, date, index));
    } else {
      dispatch(Action.removeDragImageItem(date, index));
    }
  }

  dragEndHandle(date, index, left, top, dragedEl) {
    const width = parseInt(dragedEl.offsetWidth);
    const height = parseInt(dragedEl.offsetHeight);

    // 检测是否超出了容器
    const container = this.getDragElementRect();
    const containerTop = this.dragEl.getBoundingClientRect().top + window.pageYOffset;
    const containerHeight = this.dragEl.getBoundingClientRect().height;

    const detectLeft = (width + left) >= container.left;
    const detectRight = left <= container.left + container.width;
    const detectTop = (width + top) >= containerTop;
    const detectBottom = top <= containerTop + containerHeight;

    if (!detectLeft || !detectRight || !detectTop || !detectBottom) {
      // 拖拽元素全部超出容器
      dispatch(Action.removeDragImageItem(date, index));
    }
  }

  createCarouselComponent() {
    const { state, dispatch } = this.props;

    if (state.imageItem && state.imageItem.length) {
      const { dragStyle, dragButtonStyle, operationBarStyle } = getStyles();

      const dragElementRect = this.getDragElementRect();
      const newDragStyle = Object.assign({}, dragStyle, dragElementRect);
      const clearAllButtonStyle = Object.assign({}, dragButtonStyle, { marginRight: 0 });

      return (
        <div ref={ el => this.dragEl = el } className="image-selected" style={ newDragStyle }>
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
              data={ state.imageItem }
              dispatch={ dispatch }
              height={ 75 }
              onDragEnd={ this.dragEndHandle.bind(this) }
              width={ dragElementRect.width - 2 }>
            </Carousel>
          </div>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="view-image">
        <div className="image-group">
          <ImageByDate onSelectedItem={ this.selectedItemHandle.bind(this, 0) } imageInfo={ [1] } date="2016-8-12"></ImageByDate>
        </div>
        { this.createCarouselComponent() }
      </div>
    );
  }
}
