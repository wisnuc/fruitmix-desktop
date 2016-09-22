/**
  图片轮播组件
**/

import React, { Component, PropTypes } from 'react';
import { replaceTemplate } from '../../utils';
import Drag from '../../partials/Drag';

function getStyles (props) {
  return {
    root: {
      position: 'relative',
      width: replaceTemplate('${width}px', props)
    },

    carouselRoot: {
      position: 'relative',
      margin: replaceTemplate('0 ${arrowItemContainerWidth}px', props),
      overflow: 'hidden',
      height: replaceTemplate('${height}px', props)
    },

    carouselRootInner: {
      position: 'absolute',
      transition: 'transform .2s linear'
    },

    arrowItemContainer: {
      position: 'absolute',
      width: replaceTemplate('${arrowItemContainerWidth}px', props),
      height: replaceTemplate('${height}px', props),
      top: 0
    },

    leftArrowItemContainer: {
      left: 0,
      backgroundColor: 'green'
    },

    rightArrowItemContainer: {
      right: 0,
      backgroundColor: 'yellow'
    },

    item: {
      display: 'inline-block',
      boxSizing: 'border-box',
      borderRadius: '4px',
      width: replaceTemplate('${itemWidth}px', props),
      marginRight: replaceTemplate('${itemGap}px', props),
      height: replaceTemplate('${height}px', props),
      backgroundColor: '#efefef'
    }
  }
}

function getArrowItemContainerComponent (props) {
  const { type } = props;

  if (type === 'click') {
    const { arrowItemContainer, leftArrowItemContainer, rightArrowItemContainer } = getStyles(props);

    return {
      leftArrowItemContainerStyle: Object.assign({}, arrowItemContainer, leftArrowItemContainer),
      rightArrowItemContainerStyle: Object.assign({}, arrowItemContainer, rightArrowItemContainer)
    };
  }
}

function getTransformStyle () {
  const node = document.createElement('div');
  const transformStyles = [
    'transform',
    'webkitTransform',
    'mozTransform'
  ];

  for (const value of transformStyles) {
    if (node.style[value] !== undefined) {
      return value;
    }
  }
}

export default class Carousel extends Component {
  constructor(props) {
    super(props);
		const { data } = this.props;

    this.transformStyle = getTransformStyle();
		this.realWidth = this.getRealWidth();
		this.everyBlockItemCount = this.getEveryBlockItemCountByRealWidth();
		this.blockCount = this.getBlockCountByItemCount();

		this.currentItemIndex = data.length >= this.everyBlockItemCount
		 ? this.everyBlockItemCount - 1
		 : data.length - 1;

		this.prevItemIndex = this.currentItemIndex;
		this.currentBlockIndex = 0;
  }

	getRealWidth() {
		const { data, itemWidth, itemGap } = this.props;

		return data.length * (itemWidth + itemGap);
	}

	getWidth() {
		const { width, arrowItemContainerWidth } = this.props;

		return width - arrowItemContainerWidth * 2;
	}

	getEveryBlockItemCountByRealWidth() {
		const { itemWidth, itemGap } = this.props;
		const width = this.getWidth();

		return Math.floor((width + itemGap) / (itemWidth + itemGap));
	}

	getBlockCountByItemCount() {
		const { data } = this.props;

		return Math.ceil(data.length / this.everyBlockItemCount);
	}

  createItemComponents() {
    const { item } = getStyles(this.props);
    const { data } = this.props;

    return data.map((dataItem, index) => {
      return (
        <Drag
          key={ index }
          className="carousel-item"
          style={ item }>
          { dataItem.text }
        </Drag>
      );
    });
  }

  createContainerComponent() {
    let { carouselRoot, carouselRootInner } = getStyles(this.props);
    const { itemWidth } = this.props;
    const itemComponents = this.createItemComponents();
    const carouselNewRootInner = Object.assign({}, carouselRootInner, { width: this.realWidth });

    return (
      <div className="carousel" style={ carouselRoot }>
        <div ref={ el => this.el = el } className="carousel-inner" style={ carouselNewRootInner }>
          { itemComponents }
        </div>
      </div>
    );
  }

  moveTo(nextItemIndex) {
    const { itemWidth, itemGap, data} = this.props;
		const blockItems = this.everyBlockItemCount * (this.currentBlockIndex + 1) > data.length
		  ? data.length
			: this.everyBlockItemCount * (this.currentBlockIndex + 1);

    this.currentItemIndex = nextItemIndex;

		if (nextItemIndex < this.everyBlockItemCount - 1) {
			this.currentBlockIndex--;
			this.currentItemIndex = this.everyBlockItemCount - 1;
		} else if (nextItemIndex >= blockItems) {
			if (nextItemIndex >= data.length) {
				this.currentItemIndex = data.length - 1;
				this.currentBlockIndex = this.blockCount - 1;
			} else {
				this.currentBlockIndex++;
			}
		}

		this.move(-(this.currentItemIndex - this.prevItemIndex) * (itemWidth + itemGap));
  }

  move(dist) {
    this.el.style[this.transformStyle] = 'translate3d('+ dist +'px, 0px, 0px)';
  }

  handleLeftArrowClick() {
    this.moveTo(this.currentItemIndex - 1);
  }

  handleRightArrowClick() {
    this.moveTo(this.currentItemIndex + 1);
  }

  render() {
    const { className } = this.props;
    const { root } = getStyles(this.props);
    const { leftArrowItemContainerStyle, rightArrowItemContainerStyle } = getArrowItemContainerComponent(this.props);
    const leftArrowItemContainerComponent = (<div className="arrow-left" onClick={ this.handleLeftArrowClick.bind(this) } style={ leftArrowItemContainerStyle }></div>);
    const rightArrowItemContainerComponent = (<div className="arrow-right" onClick={ this.handleRightArrowClick.bind(this) } style={ rightArrowItemContainerStyle }></div>);

    return (
      <div className={ className } style={ root }>
        { leftArrowItemContainerComponent }
        { rightArrowItemContainerComponent }
        { this.createContainerComponent() }
      </div>
    );
  }
}

Carousel.propTypes = {
  /**
   * className
  */
  className: PropTypes.string,

  /**
   * width
  */
  width: PropTypes.number,

  /**
   * height
  */
  height: PropTypes.number,

  /**
   * 轮播方式是自动轮播还是点击轮播
  */
  type: PropTypes.oneOf([
    'auto',
    'click'
  ]),

  /**
   * item 数据
  */
  data: PropTypes.array.isRequired,

  /**
   * carousel arrow item 样式信息
  */
  /** @ignore **/
  arrowContainerWidth: PropTypes.number,
  /** @ignore **/
  arrowIconWidth: PropTypes.number,

  /**
   * carousel item 样式信息
  */
  /** @ignore **/
  itemWidth: PropTypes.number,
  /** @ignore **/
  itemGap: PropTypes.number
};

Carousel.defaultProps = {
  className: 'carousel-container',
  type: 'click',
  itemGap: 15,
  itemWidth: 75,
  arrowItemContainerWidth: 55
};
