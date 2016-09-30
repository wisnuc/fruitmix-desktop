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
      textIndent: 20,
      lineHeight: '20px',
      marginBottom: 10,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    verticalCol: {
      textIndent: 'inherit',
      textAlign: 'center'
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
    const { root, row, col, verticalCol } = getStyles();
    const assignedCol = Object.assign({}, col, verticalCol);

    return (
      <div className="permission" style={ root }>
        <div className="permission-header">
          <div className="permission-row" style={ row }>
            <span style={ col }>用户</span>
            <span style={ assignedCol }>编辑</span>
            <span style={ assignedCol }>查看</span>
          </div>
        </div>
        <div className="permission-body">
          <div className="permission-row" style={ row }>
            <span style={ col }>RoseRoseRoseRoseRose</span>
            <span style={ assignedCol }>
              <Checkbox value="edit" checked={ true } onChange={ this.onChange }></Checkbox>
            </span>
            <span style={ assignedCol }>
              <Checkbox value="view" onChange={ this.onChange }></Checkbox>
            </span>
          </div>
          <div className="permission-row" style={ row }>
            <span style={ col }>Jack</span>
            <span style={ assignedCol }>
              <Checkbox value="edit" onChange={ this.onChange }></Checkbox>
            </span>
            <span style={ assignedCol }>
              <Checkbox value="view" checked={ true } onChange={ this.onChange }></Checkbox>
            </span>
          </div>
        </div>
      </div>
    );
  }
}
