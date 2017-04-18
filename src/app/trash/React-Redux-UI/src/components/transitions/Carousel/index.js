/**
  图片轮播组件
**/

import React, { Component, PropTypes } from 'react';
import { replaceTemplate } from '../../../utils';
import Drag from '../../partials/Drag';

import Action from '../../../actions/action';
import svg from '../../../../../utils/SVGIcon';

import { MenuItem } from 'material-ui';

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
      left: 0
    },

    rightArrowItemContainer: {
      right: 0
    },

    item: {
      display: 'inline-block',
      boxSizing: 'border-box',
      borderRadius: '4px',
      width: replaceTemplate('${itemWidth}px', props),
      marginRight: replaceTemplate('${itemGap}px', props),
      height: replaceTemplate('${height}px', props),
      position: 'relative',
      zIndex: 10,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 0',
      backgroundSize: 'cover',
      overflow: 'hidden'
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

  return transformStyles.find(name => node.style[name] !== undefined);
}

export default class Carousel extends Component {
  constructor(props) {
    super(props);

    this.initial();
  }

  componentWillReceiveProps(nextProps) {
    this.initial(nextProps);
  }

  initial(props) {
    const { data } = props || this.props;

    this.transformStyle = getTransformStyle(props);
		this.realWidth = this.getRealWidth(props);
		this.everyBlockItemCount = this.getEveryBlockItemCountByRealWidth(props);
		this.blockCount = this.getBlockCountByItemCount(props);
		this.currentItemIndex = data.length >= this.everyBlockItemCount
		 ? this.everyBlockItemCount - 1
		 : data.length - 1;

		this.prevItemIndex = this.currentItemIndex;
		this.currentBlockIndex = 0;
  }

	getRealWidth(props) {
		const { data, itemWidth, itemGap } = props || this.props;
		return data.length * (itemWidth + itemGap);
	}

	getWidth(props) {
		const { width, arrowItemContainerWidth } = props || this.props;

		return width - arrowItemContainerWidth * 2;
	}

	getEveryBlockItemCountByRealWidth(props) {
		const { itemWidth, itemGap } = props || this.props;
		const width = this.getWidth();

		return Math.floor((width + itemGap) / (itemWidth + itemGap));
	}

	getBlockCountByItemCount(props) {
		const { data } = props || this.props;

		return Math.ceil(data.length / this.everyBlockItemCount);
	}

  createItemComponents(props) {
    const { item } = getStyles(props || this.props);
    const { data, onDragEnd } = props || this.props;

    return data.map((dataItem, index) => {
      return (
        <Drag
          key={ index }
          className="carousel-item"
          onDragEnd={ onDragEnd }
          date={ dataItem.date }
          index={ dataItem.index }
          src={dataItem.el.querySelector('img').getAttribute('src')}
          style={ Object.assign({}, item, { backgroundImage: 'url("'+ dataItem.el.querySelector('img').getAttribute('src') +'")' }) }>
          { dataItem.text }
        </Drag>
      );
    });
  }

  createContainerComponent(props) {
    let { carouselRoot, carouselRootInner } = getStyles(props || this.props);
    const { itemWidth } = props || this.props;
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

    if (blockItems < this.everyBlockItemCount) {
      return;
    }

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
    const leftArrowItemContainerComponent = (
      <div className="arrow-left" onClick={ this.handleLeftArrowClick.bind(this) } style={ leftArrowItemContainerStyle }>
        <MenuItem className="arrow-left-btn" desktop={ true } leftIcon={ svg.leftArrow() }></MenuItem>
      </div>
    );
    const rightArrowItemContainerComponent = (
      <div className="arrow-right" onClick={ this.handleRightArrowClick.bind(this) } style={ rightArrowItemContainerStyle }>
        <MenuItem className="arrow-right-btn" desktop={ true } leftIcon={ svg.rightArrow() }></MenuItem>
      </div>
    );

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
  itemGap: PropTypes.number,

  /**
    拖拽结束回调
  **/
  onDragEnd: PropTypes.func.isRequired
};

Carousel.defaultProps = {
  className: 'carousel-container',
  type: 'click',
  itemGap: 15,
  itemWidth: 75,
  arrowItemContainerWidth: 55
};
