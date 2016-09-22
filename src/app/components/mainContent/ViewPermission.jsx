/**
  查看用户权限
**/

import React, { Component, PropTypes } from 'react';
import Checkbox from '../../React-Redux-UI/src/components/partials/Checkbox';

function getStyles() {
  return {
    root: {
      fontSize: 12
    },
    row: {
      display: '-webkit-box',
      WebkitBoxOrient: 'horizontal'
    },
    col: {
      display: 'block',
      width: '33.33%',
      WebkitBoxFlex: 1,
      WebkitBoxAlign: 'center',
      textAlign: 'center',
      lineHeight: '20px',
      marginBottom: 10
    }
  };
}

export default class ViewPermission extends Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(value, checked) {
    
  }

  render() {
    const { root, row, col } = getStyles();

    return (
      <div className="permission" style={ root }>
        <div className="permission-header">
          <div className="permission-row" style={ row }>
            <span style={ col }>用户</span>
            <span style={ col }>编辑</span>
            <span style={ col }>查看</span>
          </div>
        </div>
        <div className="permission-body">
          <div className="permission-row" style={ row }>
            <span style={ col }>Rose</span>
            <span style={ col }>
              <Checkbox value="edit" checked={ true } onChange={ this.onChange }></Checkbox>
            </span>
            <span style={ col }>
              <Checkbox value="view" onChange={ this.onChange }></Checkbox>
            </span>
          </div>
          <div className="permission-row" style={ row }>
            <span style={ col }>Jack</span>
            <span style={ col }>
              <Checkbox value="edit" onChange={ this.onChange }></Checkbox>
            </span>
            <span style={ col }>
              <Checkbox value="view" checked={ true } onChange={ this.onChange }></Checkbox>
            </span>
          </div>
        </div>
      </div>
    );
  }
}
