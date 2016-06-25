/**
 * @component mediaComponent
 * @description mediaComponent
 * @time 2016-6-25
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
// import Component 
class Media extends Component {
	render() {
		return (
			<div>
				{this.props.item.hash}
			</div>
		)
	}

}

export default Media;