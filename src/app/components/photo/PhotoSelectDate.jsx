/**
  PhotoSelectDate.jsx
**/

import React, { Component, PropTypes } from 'react';
import SelectIconButton from './SelectIconButton';

function getStyles () {
  return {
    root: {
      fontSize: 12,
      opacity: .87
    }
  }
}

export default class PhotoSelectDate extends Component {
  constructor(props) {
    super(props);

    this.style = getStyles();
    this.selectedDateBehavior = props.selectedDateBehavior;
    this.offSelectedDateBehavior = props.offSelectedDateBehavior;
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    let { style, primaryText } = this.props;

    return (
      <div style={ style }>
        <label style={ this.style.root }>
          <SelectIconButton
            style={{ display: 'inline-block', width: 18, height: 18, marginRight: 8 }}
            selectBehavior={ (action) => { action === 'on' ? this.selectedDateBehavior() : this.offSelectedDateBehavior() } }/>
          { primaryText }
        </label>
      </div>
    );
  }
}

PhotoSelectDate.propTypes = {
  style: PropTypes.object,
  primaryText: PropTypes.string.isRequired,
  selectedDateBehavior: PropTypes.func.isRequired,
  offSelectedDateBehavior: PropTypes.func.isRequired
};
