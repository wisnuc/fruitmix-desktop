/**
  @description 照片信息组件
  @author zengwenbing
  @date 2016-9-19
**/

import React, { Component, PropTypes } from 'react';

function getStyles () {
  return {
    root: {
      boxSizing: 'border-box',
      minHeight: 184
    },
    header: {
      textAlign: 'center',
			lineHeight: '40px',
			fontSize: 12,
			color: '#fff',
			backgroundColor: 'rgba(0,0,0,.2)',
			borderBottom: '1px solid rgba(0,0,0,.25)',
      borderTop: '1px solid rgba(0,0,0,.25)'
    },
    body: {
      margin: 0,
      padding: '10px 0 0 15px',
      color: '#fff'
    },
    li: {
      listStyle: 'none',
      margin: '5px 0'
    },
    label: {
      textAlign: 'right',
      display: 'inline-block',
      width: 60,
      fontSize: 14
    },
    span: {
      paddingLeft: 10,
      vertical: 'middle',
      fontSize: 14,
      fontWeight: 700
    }
  };
}

export default class PhotoInfo extends Component {
  render() {
    const {
      root,
      header,
      body,
      li,
      label,
      span
    } = getStyles();

    return (
      <div className="photo-info-box" style={ root }>
        <div className="photo-info-header" style={ header }>照片信息</div>
        <ul className="photo-info-body" style={ body }>
          <li style={ li }>
            <label style={ label }>所有者:</label>
            <span style={ span }>111</span>
          </li>
          <li style={ li }>
            <label style={ label }>文件类型:</label>
            <span style={ span }>exit</span>
          </li>
          <li style={ li }>
            <label style={ label }>文件大小:</label>
            <span style={ span }>30000</span>
          </li>
          <li style={ li }>
            <label style={ label }>拍摄日期:</label>
            <span style={ span }>2016-9-2 16:00:00</span>
          </li>
          <li style={ li }>
            <label style={ label }>尺寸:</label>
            <span style={ span }>300 * 300</span>
          </li>
        </ul>
      </div>
    );
  }
}
