/**
  PhotoSelectDate.jsx
**/

import React, { Component, PropTypes } from 'react'
import SelectIconButton from './SelectIconButton'

export default class PhotoSelectDate extends Component {
  shouldComponentUpdate() {
    return false
  }

  render() {
    const { style, primaryText } = this.props

    return (
      <div style={style}>
        <label style={{ fontSize: 12, opacity: 0.87 }}>
          { primaryText }
        </label>
      </div>
    )
  }
}

PhotoSelectDate.propTypes = {
  style: PropTypes.object,
  primaryText: PropTypes.string.isRequired
}
