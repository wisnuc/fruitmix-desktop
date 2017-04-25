/**
  元素拖拽组件
**/

import React, { Component, PropTypes } from 'react';
import { replaceTemplate, parseUpperToCable } from '../../utils';

function getClientRect (el) {
	const clientRect = el.getBoundingClientRect();

	return {
		width: clientRect.width,
		height: clientRect.height,
		xPixel: clientRect.left + window.pageXOffset,
		yPixel: clientRect.top + window.pageYOffset
	}
}

export default class Drag extends Component {
	constructor() {
		super();
		this.hasMouseDown = false;

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
	}

	createDragElementStyles(rect) {
		return {
			position: 'absolute',
			width: replaceTemplate('${width}px', rect),
			height: replaceTemplate('${height}px', rect),
			left: replaceTemplate('${xPixel}px', rect),
			top: replaceTemplate('${yPixel}px', rect)
		};
	}

	createDragElement() {
		const cloneNode = this.el.cloneNode(true);
		const rect = getClientRect(this.el);
		const styles = Object.assign({}, this.createDragElementStyles(rect), { position: 'absolute', boxSizing: 'border-box', border: '2px dashed #666' });
		cloneNode.style.cssText = parseUpperToCable(JSON.stringify(styles).replace(/['"{}]/g, '').replace(/,/g, ';'));
		document.body.appendChild(cloneNode);

		return cloneNode;
	}

	onMouseDown(e) {
		if (this.el === e.target.parentNode) {
			this.cloneNode = this.createDragElement();
			const clientRect = getClientRect(this.el);

			this.currentXPixel = e.clientX - clientRect.xPixel;
			this.currentYPixel = e.clientY - clientRect.yPixel;
			this.hasMouseDown = true;
			this.hasCurrentNode = true;
		}
	}

	onMouseMove(e) {
		if (this.hasCurrentNode && this.hasMouseDown) {
		  this.cloneNode.style.left = e.clientX - this.currentXPixel + 'px';
			this.cloneNode.style.top = e.clientY - this.currentYPixel + 'px';
		}
	}

	onMouseUp(e) {
		if (this.hasCurrentNode && this.hasMouseDown) {
			const { onDragEnd, date, index } = this.props;

		  this.hasMouseDown = false;
			onDragEnd(date, index, e.clientX - this.currentXPixel, e.clientY - this.currentYPixel, e.target);
			document.body.removeChild(this.cloneNode);
		}
	}

	componentWillMount() {
		document.addEventListener('mousedown', this.onMouseDown.bind(this));
		document.addEventListener('mousemove', this.onMouseMove.bind(this));
		document.addEventListener('mouseup', this.onMouseUp.bind(this));
	}

	render() {
		const { className, children, style, src } = this.props;
		const newStyle = Object.assign({}, style, { WebkitUserSelect: 'none', backgroundImage: 'url("'+ src +'")' });

		return (
			<div ref={ el => this.el = el } className={ className } style={ style }>
				<img src={ src } draggable="false" ondragstart="return false;" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
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

	style: PropTypes.object,

	onDragEnd: PropTypes.func
};

Drag.defaultProps = {};
