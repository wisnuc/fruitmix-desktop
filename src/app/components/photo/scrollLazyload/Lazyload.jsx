import React, { Component, PropTypes, Children } from "react";
import { findDOMNode } from 'react-dom';
import { add, remove } from './utils/eventListeners';
import throttle from './utils/throttle';
import parentScrollNode from './utils/parentScrollNode';
import inVisualNode from './utils/inVisualNode';

export default class Lazyload extends Component {
	constructor(props) {
  	super(props);

  	this.state = { visible: 'pending' };
  	this.style = {
  	  opacity: 0,
  	  transition: 'opacity .35s linear'
  	};

  	this.lazyloadHandler = throttle(() => {
  	  if (inVisualNode(this.node, this.parentScrollNode)) {
  	    this.setState({ visible: 'loading'});
  	    this.removeListener();
  	  }
  	}, 300, 300);
	}

	addListener() {
	  add(this.parentScrollNode, 'scroll', this.lazyloadHandler);
	}

	removeListener() {
	  remove(this.parentScrollNode, 'scroll', this.lazyloadHandler);
	}

	shouldComponentUpdate(nextProps, nextState) {
	  return nextState.visible === 'loading';
	}

	render() {
  	let { nodeName, width, height, children } = this.props;
  	const isLoadingState = this.state.visible === 'loading';
  	const style = Object.assign({}, this.style,
    	{ width, height },
    	{ opacity: isLoadingState ? 1 : 0 }
  	);

  	return React.createElement(nodeName, {
  	  style
  	}, isLoadingState && Children.only(children));
	}

	componentDidMount() {
  	this.node = findDOMNode(this);
  	this.parentScrollNode = parentScrollNode(this.node);

  	this.lazyloadHandler();
  	this.addListener();
	}

	componentWillUnmount() {
	   this.removeListener();
	}
};

Lazyload.PropTypes = {
  nodeName: PropTypes.string,
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  children: PropTypes.node.isRequired
};

Lazyload.defaultProps = {
  nodeName: 'div'
};
