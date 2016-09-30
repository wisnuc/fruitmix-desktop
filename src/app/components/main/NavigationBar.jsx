/**
  导航条
**/

import React, { Component, PropTypes } from 'react';

function getStyles (props) {
  return {
    backgroundColor: props.navigationBarBackgroundColor,
    color: props.navigationBarTextStyle,
    fontSize: props.navigationBarFontSize,
    fontFamily: props.navigationBarFontFamily,
    paddingLeft: props.navigationBarHorizontalPadding,
    height: props.navigationBarHeight,
    lineHeight: props.navigationBarHeight + 'px'
  }
}

export default class NavigationBar extends Component {
  createTitleTextComponent() {
    const { navigationBarTitleTexts } = this.props;

    return navigationBarTitleTexts.map((text, index) => {
      if (index === navigationBarTitleTexts.length - 1) {
        return <span>{ text }</span>
      } else {
        return <span>{ text } &gt; </span>
      }
    });
  }

  render() {
    const navigationBarStyle = getStyles(this.props);

    return (
      <div className="navigation-bar" style={ navigationBarStyle }>
        { this.createTitleTextComponent() }
      </div>
    );
  }
}

NavigationBar.propTypes = {
  // 背景颜色
  navigationBarBackgroundColor: PropTypes.string,
  // 字体颜色
  navigationBarTextStyle: PropTypes.string,
  // 字体大小
  navigationBarFontSize: PropTypes.number,
  // 字号
  navigationBarFontFamily: PropTypes.string,
  // horizontal 内边距
  navigationBarHorizontalPadding: PropTypes.number,
  // 高度
  navigationBarHeight: PropTypes.number,
  // 显示文字列表
  navigationBarTitleTexts: PropTypes.array.isRequired
};

NavigationBar.defaultProps = {
  navigationBarBackgroundColor: '#fff',
  navigationBarTextStyle: '#9a9a9a',
  navigationBarFontSize: 12,
  navigationBarFontFamily: 'sans-serif',
  navigationBarHorizontalPadding: 15,
  navigationBarHeight: 38
};
