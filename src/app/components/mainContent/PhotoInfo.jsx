/**
  @description 照片信息组件
  @author zengwenbing
  @date 2016-9-19
**/

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { formatDate } from '../../utils/datetime';

function getStyles () {
  return {
    body: {
      margin: 0,
      padding: '20px',
      color: '#757575'
    },
    li: {
      listStyle: 'none',
      marginBottom: 6,
      lineHeight: 1
    },
    lastLi: {
      marginBottom: 0
    },
    label: {
      display: 'inline-block',
      fontSize: 12
    },
    span: {
      paddingLeft: 10,
      vertical: 'middle',
      fontSize: 12
    }
  };
}

class PhotoInfo extends Component {
  render() {
    const {
      body,
      li,
      lastLi,
      label,
      span
    } = getStyles();
    const lastLiStyle = Object.assign({}, li, lastLi);
    const {
      fileInfo: { type, size, exifDateTime, width, height },
      username
    } = this.props;
    
    return (
      <ul className="photo-info-body" style={ body }>
        <li style={ li }>
          <label style={ label }>所有者:</label>
          <span style={ span }>{ username }</span>
        </li>
        <li style={ li }>
          <label style={ label }>文件类型:</label>
          <span style={ span }>{ type }</span>
        </li>
        <li style={ li }>
          <label style={ label }>文件大小:</label>
          <span style={ span }>{ size ? (size / 1024).toFixed(2) + 'KB' : '' }</span>
        </li>
        <li style={ li }>
          <label style={ label }>拍摄日期:</label>
          <span style={ span }>{ exifDateTime ? formatDate(exifDateTime) : '' }</span>
        </li>
        <li style={ lastLiStyle }>
          <label style={ label }>尺寸:</label>
          <span style={ span }>{ width } * { height }</span>
        </li>
      </ul>
    );
  }
}

const mapStateToProps = ({ fileInfo, login: { obj: { username } } }) => ({ fileInfo, username });

export default connect(mapStateToProps)(PhotoInfo);
