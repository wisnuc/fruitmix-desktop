/**
  @author zengwenbing
  @date 2016-9-19
**/

import React, { Component, PropTypes } from 'react';

function getStyles () {
  return {
    root: {

    },

    header: {
      
    }
  };
}

export default class NavGroup extends Component {
  render() {

  }
}

NavGroup.propTypes = {
  /**
   * title
  **/
  title: PropTypes.string.isRequired,

  /**
   * children nodes
  **/
  children: PropTypes.node
};
