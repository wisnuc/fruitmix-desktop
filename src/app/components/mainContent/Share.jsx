/**
  @description 分享组件
  @author zengwenbing
  @date 2016-9-19
**/

import React, { Component, PropTypes } from 'react';

// 子组件
import CheckboxGroup from '../../React-Redux-UI/src/components/partials/CheckboxGroup';
import RadioGroup from '../../React-Redux-UI/src/components/partials/RadioGroup';

function getStyles () {
  return {
    root: {
      boxSizing: 'border-box',
      height: 350
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
      padding: '10px 0 0 15px',
      color: '#fff',
      fontSize: 12
    },
    radio: {
      display: 'block',
      margin: '5px 0 15px'
    },
    bodyCustomBox: {
      fontSize: 12
    },
    bodyCustomInnerBox: {
      display: '-webkit-box',
      WebkitBoxOrient: 'horizontal'
    },
    bodyCustomInnerItem: {
      display: 'block',
      width: '33.33%',
      WebkitBoxFlex: 1,
      WebkitBoxAlign: 'center',
      textAlign: 'center',
      marginBottom: 15
    }
  };
}

export default class Share extends Component {
  constructor() {
    super();

    this.onSelectItemChange = this.onSelectItemChange.bind(this);
    this.state = {
      customComponentIsLive: false
    };
  }

  createCustomComponent() {
    const {
      bodyCustomBox,
      bodyCustomInnerBox,
      bodyCustomInnerItem
    } = getStyles();

    return (
      <div className="share-custom-box" style={ bodyCustomBox }>
        <div className="share-custom-header" style={ bodyCustomInnerBox }>
          <span style={ bodyCustomInnerItem }>用户</span>
          <span style={ bodyCustomInnerItem }>编辑</span>
          <span style={ bodyCustomInnerItem }>查看</span>
        </div>
        <div className="share-custom-content" style={ bodyCustomInnerBox }>
          <span style={ bodyCustomInnerItem }>aaa</span>
          <span style={ bodyCustomInnerItem }>编辑</span>
          <span style={ bodyCustomInnerItem }>查看</span>
        </div>
      </div>
    );
  }

  onSelectItemChange(value, checked) {
    this.setState({ customComponentIsLive: (value === 'custom' && checked === false) ? true : false });
  }

  render() {
    const { dispatch, state } = this.props;
    const {
      root,
      header,
      body,
      radio } = getStyles();

    return (
      <div className="share-box" style={ root }>
        <div className="share-header" style={ header }>分享</div>
        <div className="share-body" style={ body }>

          {/* 自定义类型 */}
          <RadioGroup
            dispatch={ dispatch }
            radios={ state.shareRadio }
            onSelectItemChange={ this.onSelectItemChange }>
          </RadioGroup>

          { this.state.customComponentIsLive && this.createCustomComponent() }
        </div>
      </div>

    );
  }
}
