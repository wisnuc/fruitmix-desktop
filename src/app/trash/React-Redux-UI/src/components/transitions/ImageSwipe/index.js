/**
  图片切换组件
**/

import React, { Component, PropTypes } from 'react';
import { replaceTemplate } from 'utils';

function getStyles(props) {
  return {
    root: {
      position: 'relative',
      margin: '0 auto',
      width: replaceTemplate('${width}px', props)
    },

    swipeRoot: {
      position: 'relative',
      overflow: 'hidden',
      margin: replaceTemplate('0 ${arrowItemContainerWidth}px', props),
      height: replaceTemplate('${height}px', props)
    },

    swipeRootInner: {
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
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 0',
      backgroundSize: 'cover',
      height: replaceTemplate('${height}px', props)
    }
  };
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

export default class ImageSwipe extends Component {
  constructor(props) {
    super(props);
    const { defaultShownIndex, imgList } = this.props;

    this.transformStyle = getTransformStyle();
    this.currentIndex = defaultShownIndex;
    this.length = imgList.length;
  }

  detectIndex(nextIndex) {
    if (nextIndex < 0) {
      return 0;
    } else if (nextIndex >= this.length) {
      return this.length - 1;
    }

    return nextIndex;
  }

  moveTo(nextIndex) {
    nextIndex = this.detectIndex(nextIndex);
    const dist = this.getShownRegion();

    this.currentIndex = nextIndex;
    this.move(-this.currentIndex * dist);
  }

  move(dist) {
    this.el.style[this.transformStyle] = 'translate3d('+ dist +'px, 0px, 0px)';
  }

  createContainerComponent() {
    const { swipeRoot, swipeRootInner } = getStyles(this.props);
    const itemComponents = this.createItemComponents();
    const newSwipeRootStyle = Object.assign({}, swipeRoot, { width: this.getShownRegion() });
    const newSwipeRootInnerStyle = Object.assign({}, swipeRootInner, { width: this.getRealWidth() });

    return (
      <div className="image-swipe" style={ newSwipeRootStyle }>
        <div ref={ el => this.el = el } className="image-swipe-inner" style={ newSwipeRootInnerStyle }>
          { itemComponents }
        </div>
      </div>
    );
  }

  createItemComponents() {
    const { item } = getStyles(this.props);
    const { imgList } = this.props;
    const newItemStyle = Object.assign({}, item, { width: this.getShownRegion() })

    return imgList.map((img, index) => {
      return (
        <div key={ index } style={ Object.assign({}, newItemStyle, { backgroundImage: 'url('+ img.src +')' }) }></div>
      );
    });
  }

  createLeftArrowComponent() {
    const { arrowItemContainer, leftArrowItemContainer } = getStyles(this.props);

    return (
      <div
        className="arrow-left"
        style={ Object.assign({}, arrowItemContainer, leftArrowItemContainer) }
        onClick={ this.handleLeftArrowClick.bind(this) }>
      </div>
    );
  }

  createRightArrowComponent() {
    const { arrowItemContainer, rightArrowItemContainer } = getStyles(this.props);

    return (
      <div
        className="arrow-right"
        style={ Object.assign({}, arrowItemContainer, rightArrowItemContainer) }
        onClick={ this.handleRightArrowClick.bind(this) }>
      </div>
    );
  }

  getShownRegion() {
    const { width, arrowItemContainerWidth } = this.props;

    return width - arrowItemContainerWidth * 2;
  }

  getRealWidth() {
    const { imgList } = this.props;
    const shownRegion = this.getShownRegion();

    return shownRegion * imgList.length;
  }

  handleLeftArrowClick() {
    this.moveTo(this.currentIndex - 1);
  }

  handleRightArrowClick() {
    this.moveTo(this.currentIndex + 1);
  }

  render() {
    const { className } = this.props;
    const { root } = getStyles(this.props);

    return (
      <div className={ className } style={ root }>
        { this.createLeftArrowComponent() }
        { this.createRightArrowComponent() }
        { this.createContainerComponent() }
      </div>
    );
  }
}

ImageSwipe.propTypes = {
  /**
   * class
  */
  className: PropTypes.string,

  /**
   * width
  */
  width: PropTypes.number.isRequired,

  /**
   * height
  */
  height: PropTypes.number.isRequired,

  /**
   * 图片信息
  */
  imgList: PropTypes.array.isRequired,

  /**
   * 默认显示图片的索引
  */
  defaultShownIndex: PropTypes.number,

  /**
   * image swipe arrow item container
  */
  /** @ignore **/
  arrowItemContainerWidth: PropTypes.number,
  /** @ignore **/
  arrowIconWidth: PropTypes.number
};

ImageSwipe.defaultProps = {
  className: 'image-swipe-container',
  arrowItemContainerWidth: 155,
  defaultShownIndex: 0
};
