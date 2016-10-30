/**
  查看用户权限
**/

import React, { Component, PropTypes } from 'react';
import Checkbox from '../../React-Redux-UI/src/components/partials/Checkbox';
import { connect } from 'react-redux';

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

class ViewPermission extends Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(value, checked) {

  }

  render() {
    const { root, row, col, verticalCol } = getStyles();
    const { users, uuid } = this.props;
    const assignedCol = Object.assign({}, col, verticalCol);
    const components = users.filter(user => user.uuid !== uuid).map(user => {
      return (
        <div key={ user.uuid }  className="permission-row" style={ row }>
          <span style={ col }>{ user.username }</span>
          <span style={ assignedCol }>
            <Checkbox value={ user.uuid } className="user-select" checked={ false } onChange={ this.onChange }></Checkbox>
          </span>
        </div>
      )
    });

    return (
      <div className="permission" style={ root }>
        <div className="permission-header">
          <div className="permission-row" style={ row }>
            <span style={ col }>用户</span>
            <span style={ assignedCol }>查看</span>
          </div>
        </div>
        <div className="permission-body">
          { components }
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ login: { obj: { uuid, users } } }) => ({ users, uuid });

export default connect(mapStateToProps)(ViewPermission);
