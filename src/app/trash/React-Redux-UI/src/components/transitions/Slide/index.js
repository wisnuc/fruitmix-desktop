/**
  react slideUp slideDown 效果组件
**/

import React, { Component, PropTypes } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { replaceTemplate } from '../../utils';
import './slide.less';

function getTransitionEvent () {
  const node = document.createElement('div');
  const cssPropertyEventMap = {
    transition: 'transitionend',
    webkitTransition: 'webkitTransitionEnd',
    mozTransition: 'mozTransitionEnd'
  };

  for (let property in cssPropertyEventMap) {
    if (node.style[property] !== undefined) {
      return cssPropertyEventMap[property];
    }
  }
}

function getStyles(props) {
  return {
    root: {
      width: replaceTemplate('${width}px', props),
      minHeight: replaceTemplate('${spreadItemHeaderHeight}px', props),
      marginBottom: replaceTemplate('${marginBottom}px', props)
    },
    header: {
      height: replaceTemplate('${spreadItemHeaderHeight}px', props),
      lineHeight: replaceTemplate('${spreadItemHeaderHeight}px', props),
      backgroundColor: replaceTemplate('${spreadItemHeaderBgColor}', props),
      textAlign: replaceTemplate('${spreadItemHeaderTextAlign}', props),
      color: replaceTemplate('${spreadItemHeaderColor}', props),
      fontSize: replaceTemplate('${spreadItemHeaderFontSize}px', props),
      fontWeight: replaceTemplate('${spreadItemHeaderFontWeight}', props)
    },
    body: {
      borderSizing: 'border-box',
      backgroundColor: replaceTemplate('${spreadItemBodyBgColor}', props)
    },
    bodyInner: {
      padding: replaceTemplate('${spreadItemBodyPadding}px', props)
    },
    bodyItem: {
      display: 'block',
      textAlign: 'center',
      height: replaceTemplate('${spreadItemBodyItemHeight}px', props),
      lineHeight: replaceTemplate('${spreadItemBodyItemHeight}px', props),
      fontSize: replaceTemplate('${spreadItemBodyItemFontSize}px', props),
      color: replaceTemplate('${spreadItemBodyItemColor}', props)
    }
  }
}

class Slide extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.spreadIndexs = this.formatSpreadIndexs();
    this.spreadItems = this.formatSpreadItems();
    this.initialState();
  }

  initialState() {
    const { spreadItems } = this;

    for (let i = 0, length = spreadItems.length; i < length; i++) {
      this.state['isShown' + i] = spreadItems[i].selected;
    }
  }

  formatSpreadItems() {
    const { spreadItems } = this.props;
    const { spreadIndexs } = this;

    return spreadItems.map((spreadItem, index) => {
      spreadItem.selected = spreadIndexs.indexOf(index.toString()) >= 0;
      return spreadItem;
    });
  }

  formatSpreadIndexs() {
    let { defaultSelectedSpreadIndexs } = this.props;

    return Array.isArray(defaultSelectedSpreadIndexs)
      ? defaultSelectedSpreadIndexs.slice(0)
      : defaultSelectedSpreadIndexs.split(',');
  }

  createChildrenComponent(spreadItems) {
    const {
      root,
      header,
      body,
      bodyInner,
      bodyItem } = getStyles(this.props);

    const bodyContainer = (spreadItem, idx) => {
      return (
          <div key={ idx } className="spread-item-body">
            <div className="spread-item-body-inner" style={ bodyInner }>
                {
                  spreadItem.content && spreadItem.content.map((item, index) => {
                    return (
                      <a key={ index } href="javascript:;" value={ item.value } style={ bodyItem }>{ item.text }</a>
                    );
                  })
                }
              </div>
          </div>
      );
    };

    return spreadItems.map((spreadItem, index) => {
      const shownKey = 'isShown' + index;

      return (
        <div key={ index } className="spread-item" style={ !spreadItem.selected ? Object.assign({}, root, { overflow: 'hidden' }) : root }>
          <div className="spread-item-header" style={ header } onClick={ this.handleClick.bind(this, index) }>{ spreadItem.title }</div>
          <ReactCSSTransitionGroup
            transitionName="slide"
            transitionAppear={ true }
            transitionAppearTimeout={ 500 }
            transitionEnterTimeout={ 400 }
            transitionLeaveTimeout={ 400 }>
            { this.state[shownKey] && bodyContainer(spreadItem) }
          </ReactCSSTransitionGroup>
        </div>
      );
    });
  }

  handleClick(index) {
    const shownKey = 'isShown';
    const joining = {
      [shownKey + index]: !this.state[shownKey + index]
    };

    // Object.keys(this.state)
    //   .filter((key, idx) => idx !== index)
    //   .forEach(key => joining[key] = false);

    this.setState(joining);
  }

  render() {
    let { className } = this.props;
    const components = this.createChildrenComponent(this.spreadItems);

    return (
      <div className={ className }>
          { components }
      </div>
    );
  }
}

Slide.propTypes = {
  /**
   * 需要展开的项
  */
  spreadItems: PropTypes.array.isRequired,

  /**
   * 默认展开的项索引
  */
  defaultSelectedSpreadIndexs: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),

  /**
   * class
  */
  className: PropTypes.string,

  /**
   * css width
  */
  width: PropTypes.number,

  /**
   * css margin-bottom
  */
  marginBottom: PropTypes.number,

  /**
   * 展开项头信息 css
  */
  /** @ignore **/
  spreadItemHeaderHeight: PropTypes.number,
  /** @ignore **/
  spreadItemHeaderBgColor: PropTypes.string,
  /** @ignore **/
  spreadItemHeaderTextAlign: PropTypes.string,
  /** @ignore **/
  spreadItemHeaderColor: PropTypes.string,
  /** @ignore **/
  spreadItemHeaderFontSize: PropTypes.number,
  spreadItemHeaderFontWeight: PropTypes.number,

  /**
   * 展开项主体信息 css
  */
  /** @ignore **/
  spreadItemBodyPadding: PropTypes.number,
  /** @ignore **/
  spreadItemBodyBgColor: PropTypes.string,

  /**
   * 展开具体项信息 css
  */
  /** @ignore **/
  spreadItemBodyItemHeight: PropTypes.number,
  spreadItemBodyItemFontSize: PropTypes.number,
  spreadItemBodyItemColor: PropTypes.string
}

Slide.defaultProps = {
  defaultSelectedSpreadIndexs: ['0'],
  width: 200,
  marginBottom: 10,
  spreadItemHeaderHeight: 30,
  spreadItemHeaderBgColor: 'rgb(215,215,215)',
  spreadItemHeaderTextAlign: 'center',
  spreadItemHeaderColor: '#666',
  spreadItemHeaderFontSize: 14,
  spreadItemHeaderFontWeight: 700,
  spreadItemBodyPadding: 15,
  spreadItemBodyBgColor: 'rgb(242,242,242)',
  spreadItemBodyItemHeight: 25,
  spreadItemBodyItemFontSize: 16,
  spreadItemBodyItemColor: '#666'

};

export default Slide;
