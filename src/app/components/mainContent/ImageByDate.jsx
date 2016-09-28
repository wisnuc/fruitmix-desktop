/**
  根据日期操作图片
**/

import React, { Component, PropTypes } from 'react';

import Checkbox from '../../React-Redux-UI/src/components/partials/Checkbox';

function getStyles () {
  return {
    itemStyle: {
      boxSizing: 'border-box',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 0',
      backgroundSize: 'cover',
      backgroundColor: '#fff',
      float: 'left',
      position: 'relative',
      width: 140,
      height: 140,
      marginRight: 10,
      marginBottom: 10
    },
    selectStatusStyle: {
      borderRadius: '100%',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#757575',
      boxSizing: 'border-box',
      display: 'none',
      position: 'absolute',
      left: 10,
      top: 10,
      width: 15,
      height: 15
    }
  };
}

export default class ImageByDate extends Component {
  constructor(props) {
    super(props);

    this.overedHandle = this.overedHandle.bind(this);
    this.outedHandle = this.outedHandle.bind(this);
    this.selectedItemHandle = this.selectedItemHandle.bind(this);
    this.changedHandle = this.changedHandle.bind(this);
    this.lookBigPhotoHandle = this.lookBigPhotoHandle.bind(this);

    this.state = {
      checked: false
    };
  }

  overedHandle() {
    this.el.classList.add('show');
  }

  outedHandle() {
    if (this.el.classList.contains('active')) {
      return;
    }

    this.el.classList.remove('show');
  }

  selectedItemHandle(e) {
    const { onSelectedItem, date } = this.props;
    const el = e.currentTarget.parentNode;

    el.classList.toggle('active');
    el.classList.toggle('show');
    onSelectedItem(el, date, el.classList.contains('active'));
    e.stopPropagation();
  }

  lookBigPhotoHandle(e) {
    const el = e.currentTarget;
    const { date, detectImageItemActive } = this.props;

    if (el.classList.contains('active')) {
      el.classList.remove('active');

      if (!detectImageItemActive(date)) {
        var b = Array
         .prototype
         .slice
         .call(
           document
           .querySelectorAll('[data-date="'+ date +'"]'))
         .forEach(el => {
           el.classList.remove('show');
         })
      }
    } else {
      alert('查看大图');
    }
  }

  changedHandle(value, checked) {
    this.setState({
      checked
    });
  }

  render() {
    const { date, state } = this.props;
    let { itemStyle, selectStatusStyle } = getStyles();

    return (
      <div ref={ el => this.el = el } data-date={ date } className={ this.state.checked ? "image-item active show" : "image-item" } style={ itemStyle }
        onClick={ this.lookBigPhotoHandle } onMouseOver={ this.overedHandle } onMouseOut={ this.outedHandle }>
        <div className="selected-mask"></div>
        <i style={ selectStatusStyle } onClick={ this.selectedItemHandle }></i>
      </div>
    );
  }
}

ImageByDate.propTypes = {
  /**
    选中项回调
  **/
  onSelectedItem: PropTypes.func.isRequired,

  /**
    图片加载状态
  **/
  status: PropTypes.string,

  /**
    检查当前这一组是否active
  **/
  detectImageItemActive: PropTypes.func
};
