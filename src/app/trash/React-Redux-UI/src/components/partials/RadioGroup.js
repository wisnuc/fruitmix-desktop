/**
  radio group
**/

import React, { Component, PropTypes } from 'react';

// Radio Component
import Radio from './Radio';

// Action
import Action from '../../actions/action';

function getStyles (direction) {
  if (direction === 'horizontal') {
    return {
      display: 'inline-block',
      marginRight: 5
    };
  } else {
    return {
      display: 'block',
      marginBottom: 20,
      fontWeight: 700
    };
  }
}

export default class RadioGroup extends Component {
  constructor() {
    super();
    this.onSelectedItem = this.onSelectedItem.bind(this);
  }

  onSelectedItem(selectedItemValue, checked) {
    const { dispatch, onSelectItemChange } = this.props;
    dispatch(Action.showShareRadios(selectedItemValue));

    setTimeout(() => {
      onSelectItemChange(selectedItemValue, checked);
    }, 0);
  }

  createRadioComponents() {
    const { radios, direction } = this.props;
    const radioStyle = getStyles(direction);

    return radios.map((radioItem, index) => {
      return (
        <Radio
          className="share-type"
          key={ index }
          style={ radioStyle }
          changeEventHandle={ this.onSelectedItem }
          { ...radioItem }>
        </Radio>
      );
    })
  }

  render() {
    return (
      <div className="radio-group">
        { this.createRadioComponents() }
      </div>
    );
  }
}

RadioGroup.propTypes = {
  /**
    排列方向
  **/
  direction: PropTypes.oneOf([
    'horizontal',
    'vertical'
  ]),

  /**
    Radio Component info
    [
      {
        value: 'dd',
        text: 'aa',
        readOnly: false,
        checked: false | true
      }
    ]
  **/
  radios: PropTypes.array.isRequired,

  onSelectItemChange: PropTypes.func
};


RadioGroup.defaultProps = {
  direction: 'vertical'
};
