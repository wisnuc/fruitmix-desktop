import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { add, remove } from './utils/eventListeners';
import throttle from './utils/throttle';

export default class ScrollFlush extends Component {
	constructor() {
	  this.state = { visible: 'pending' };

	  this.scrollHandler = throttle(() => {
	    if (this.isToBottom()) {

	    }
	  }, 300, 300);
	}

	isToBottom() {

	}

	render() {

	}

	componentDidMount() {
	  this.node = findDOMNode(this);
	  add(findDOMNode(this), 'scroll', this.scrollHandler);
	}

	componentWillUnmount() {

	}
}

ScrollFlush.propTypes = {
  nodeName: PropTypes.string,
  total: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onScrolled: PropTypes.func.isRequired
};

ScrollFlush.defaultProps = {
  nodeName: 'div'
};
