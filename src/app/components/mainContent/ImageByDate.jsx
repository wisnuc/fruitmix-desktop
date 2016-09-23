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
      marginBottom: '15px',
      position: 'relative',
      width: 106,
      height: 106
    },
    selectStatusStyle: {
      borderRadius: '100%',
      border: '1px solid #999',
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
  constructor() {
    super();

    this.overedHandle = this.overedHandle.bind(this);
    this.outedHandle = this.outedHandle.bind(this);
    this.selectedItemHandle = this.selectedItemHandle.bind(this);
    this.changedHandle = this.changedHandle.bind(this);
    this.state = {
      hasAllSelected: false
    };
  }

  overedHandle(e) {
    const el = e.currentTarget;
    el.classList.add('show');
  }

  outedHandle(e) {
    const el = e.currentTarget;

    if (el.classList.contains('active')) {
      return;
    }

    el.classList.remove('show');
  }

  selectedItemHandle(e) {
    const el = e.currentTarget.parentNode;
    el.classList.toggle('active');
    el.classList.toggle('show');
  }

  changedHandle(value, checked) {
    this.setState({
      hasAllSelected: checked
    });
  }

  render() {
    const { date } = this.props;
    let { itemStyle, listStyle, selectStatusStyle } = getStyles();

    return (
      <div className="image-item">
        <div className="image-item-header">
          <Checkbox value={ date } text={ date } onChange={ this.changedHandle }></Checkbox>
        </div>
        <div className="image-list" style={ listStyle }>
          <div className={ this.state.hasAllSelected ? "image-item active show" : "image-item" } style={ itemStyle } onClick={ this.selectItemHandle } onMouseOver={ this.overedHandle } onMouseOut={ this.outedHandle }>
            <i style={ selectStatusStyle } onClick={ this.selectedItemHandle }></i>
          </div>
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
