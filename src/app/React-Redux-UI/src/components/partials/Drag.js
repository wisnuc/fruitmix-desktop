/**
  元素拖拽组件
**/

import React, { Component, PropTypes } from 'react';
import { replaceTemplate } from '../../utils';

function getClientRect (el) {
	const clientRect = el.getBoundingClientRect();

	return {
		width: clientRect.width,
		height: clientRect.height,
		xPixel: clientRect.x + window.pageXOffset,
		yPixel: clientRect.y + window.pageYOffset
	}
}

export default class Drag extends Component {
	constructor() {
		super();

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
	}

	createDragElementStyles(rect) {
		return {
			position: 'absolute',
			width: replaceTemplate('${width}px', rect),
			height: replaceTemplate('${height}px', rect),
			left: replaceTemplate('${left}px', rect),
			top: replaceTemplate('${top}px', rect)
		};
	}

	createDragElement() {
		const cloneNode = this.el.cloneNode(true);
		const rect = getClientRect(cloneNode);
		const styles = Object.assign({}, this.createDragElementStyles(rect), { position: 'absolute', boxSizing: 'border-box', border: '2px dashed #666' });
		document.body.appendChild(cloneNode);

		return cloneNode;
	}

	onMouseDown() {
		this.cloneNode = this.createDragElement();

		const clientRect = getClientRect(this.cloneNode);

		this.currentXPixel = clientRect.xPixel;
		this.currentYPixel = clientRect.yPixel;
	}

	onMouseMove(e) {
		this.cloneNode.style.left = e.clientX;
		this.cloneNode.style.top = e.clientY;
	}

	onMouseUp() {

	}

	render() {
		const { className, children, style } = this.props;
		const newStyle = Object.assign({}, style, { webkitUserSelect: 'none' });

		return (
			<div
			  ref={ el => this.el = el }
			  draggable={ true }
			  className={ className }
				onMouseDown={ this.onMouseDown }
				onMouseMove={ this.onMouseMove }
				onMouseUp={ this.onMouseUp }
				style={ newStyle }>
				{ children }
			</div>
		);
	}
}

// dragstart dragenter dragover dragleave

Drag.propTypes = {
	/**
   * class
	*/
	className: PropTypes.string,

	children: PropTypes.node,

	style: PropTypes.object
};

Drag.defaultProps = {};
