/**
  @description 分享组件
  @author zengwenbing
  @date 2016-9-19
**/

import React, { Component, PropTypes } from 'react';

// 子组件
import ViewPermission from './ViewPermission';
import RadioGroup from '../../React-Redux-UI/src/components/partials/RadioGroup';

function getStyles () {
  return {
    body: {
      padding: '10px 0 0 20px',
      color: '#757575',
      fontSize: 12
    },
    radio: {
      display: 'block',
      margin: '5px 0 15px'
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

  onSelectItemChange(value, checked) {
    this.setState({ customComponentIsLive: (value === 'custom' && checked === false) ? true : false });
  }

  render() {
    const { dispatch, shareRadios } = this.props;
    const { body, radio } = getStyles();

    return (
      <div className="share-body" style={ body }>

        {/* 自定义类型 */}
        <RadioGroup
          dispatch={ dispatch }
          radios={ shareRadios }
          onSelectItemChange={ this.onSelectItemChange }>
        </RadioGroup>

        { this.state.customComponentIsLive && (<ViewPermission></ViewPermission>) }
      </div>
    );
  }
}
