/**
  @description 分享组件
  @author zengwenbing
  @date 2016-9-19
**/

import React, { Component, PropTypes } from 'react';
import CheckboxGroup from '../../React-Redux-UI/src/components/partials/CheckboxGroup';
import Radio from '../../React-Redux-UI/src/components/partials/Radio';

function getStyles () {
  return {
    root: {
      boxSizing: 'border-box',
      minHeight: 350
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

    }

  };
}

export default class Share extends Component {
  render() {
    const { root, header } = getStyles();

    return (
      <div className="share-box" style={ root }>
        <div className="share-header" style={ header }>分享</div>
        <div className="share-body">

        </div>
      </div>

    );
  }
}
