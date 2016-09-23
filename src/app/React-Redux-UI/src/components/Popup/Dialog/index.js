/**
  对话框组件 | 容器组件
**/

'use static';

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import Popup from '../index';
import { pick, replaceTemplate } from '../../utils';
import IconButton from '../../partials/IconButton';

function getStyles(props) {
  const layout = pick(props, ['zIndex', 'width', 'alignType']);
  const appearance = pick(props, ['paddingLeftRight', 'borderRadius', 'borderColor']);
  const titleAppearance = pick(props, ['titleHeight', 'titleFontSize', 'titleFontFamily', 'titleColor']);
  const contentAppearance = pick(props, ['contentFontSize', 'contentFontFamily', 'contentColor']);

  return {
    root: {
      position: 'fixed',
      boxSizing: 'border-box',
      borderRadius: replaceTemplate('${borderRadius}px', appearance),
      border: replaceTemplate('1px solid ${borderColor}', appearance),
      width: replaceTemplate('${width}px', layout),
      zIndex: replaceTemplate('${zIndex}', layout),
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    },
    header: {
      padding: replaceTemplate('0 ${paddingLeftRight}px', appearance),
      height: replaceTemplate('${titleHeight}px', titleAppearance),
      lineHeight: replaceTemplate('${titleHeight}px', titleAppearance),
      borderBottom: replaceTemplate('1px solid ${borderColor}', appearance),
      fontFamily: replaceTemplate('${titleFontFamily}', titleAppearance),
      fontSize: replaceTemplate('${titleFontSize}px', titleAppearance),
      color: replaceTemplate('${titleColor}', titleAppearance)
    },
    body: {
      padding: replaceTemplate('0 ${paddingLeftRight}px', appearance),
      fontFamily: replaceTemplate('${contentFontFamily}', contentAppearance),
      fontSize: replaceTemplate('${contentFontSize}px', contentAppearance),
      color: replaceTemplate('${contentColor}', contentAppearance)
    }
  };
}

class DialogTitle extends Component {
  render() {
    const {
      isCloseBtn,
      className,
      style,
      children,
      clickEventHandle } = this.props;

    return (
      <div className={ className } style={ style }>
        <div className="dialog-inner" style={{ position: 'relative' }}>

          { isCloseBtn && <IconButton size={ 32 } font='arial' clickEventHandle={ clickEventHandle }>×</IconButton> }
          { children }

        </div>
      </div>
    );
  }
}

class DialogContent extends Component {
  render() {
    const { className, style } = this.props;

    return (
      <div className={ className } style={ style }>body</div>
    );
  }
}

class Dialog extends Popup {
  render() {
    const {
      className,
      isCloseBtn,
      title,
      titleClassName,
      contentClassName } = this.props;
    const { root, header, body } = getStyles(this.props);

    return (
      <div ref={ el => this.el = el } className={ className } style={ root }>

        <DialogTitle
          className={ titleClassName }
          isCloseBtn={ isCloseBtn }
          style={ header }
          clickEventHandle={ this.hide.bind(this) }>
          { title }
        </DialogTitle>

        <DialogContent className={ contentClassName } style={ body }></DialogContent>
      </div>
    );
  }
}

// 扩展Dialog静态属性propTypes
Object.assign(Dialog.propTypes = {}, Popup.propTypes, {
  /**
   * className
   */
  className: PropTypes.string,

  /**
   * dialog z-index
   */
  zIndex: PropTypes.number,

  /**
   * dialog width
   */
  width: PropTypes.number.isRequired,

  /**
   * dialog padding-top padding-bottom
   */
  paddingLeftRight: PropTypes.number,

  /**
   * dialog border color
   */
  borderColor: PropTypes.string,

  /**
   * dialog border radius
   */
  borderRadius: PropTypes.number,

  /**
   * dialog 对齐方式
   */
  alignType: PropTypes.oneOf([
    'middle',
    'custom'
  ]),

  /**
   * dialog 标题
   */
  title: PropTypes.string,

  /**
   * dialog header className
   */
  titleClassName: PropTypes.string,

  /**
   * dialog header height
   */
  titleHeight: PropTypes.number,

  /**
   * dialog header fontsize
   */
  titleFontSize: PropTypes.number,

  /**
   * dialog header fontfamily
   */
  titleFontFamily: PropTypes.string,

  /**
   * dialog header color
   */
  titleColor: PropTypes.string,

  /**
   * dialog main className
   */
  contentClassName: PropTypes.string,

  /**
   * dialog main fontsize
   */
  contentFontSize: PropTypes.number,

  /**
   * dialog main fontfamily
   */
  contentFontFamily: PropTypes.string,

  /**
   * dialog color
   */
  contentColor: PropTypes.string
});

// 扩展Dialog静态属性defaultProps
Object.assign(Dialog.defaultProps = {}, Popup.defaultProps, {
  className: 'dialog',
  titleClassName: 'dialog-header',
  contentClassName: 'dialog-main',
  alignType: 'middle',
  zIndex: 999,
  paddingLeftRight: 15,
  borderColor: '#ccc',
  borderRadius: 4,
  titleFontSize: 14,
  titleFontFamily: 'microsoft yahei',
  titleColor: '#333',
  contentFontSize: 12,
  contentFontFamily: 'microsoft yahei',
  contentColor: '#999'
});

export default Dialog;
