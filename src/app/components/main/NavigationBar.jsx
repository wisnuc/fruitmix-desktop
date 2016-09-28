/**
  导航条
**/

import React, { Component, PropTypes } from 'react';

import RightPanel from './RightPanel';

function getStyles (props) {
  return {
    root: {
      backgroundColor: props.navigationBarBackgroundColor,
      color: props.navigationBarTextStyle,
      fontSize: props.navigationBarFontSize,
      fontFamily: props.navigationBarFontFamily,
      paddingLeft: props.navigationBarHorizontalPadding,
      height: props.navigationBarHeight,
      lineHeight: props.navigationBarHeight + 'px',
      borderBottom: '1px solid #efefef'
    },
    icon: {
      display: 'inline-block',
      fontFamily: 'Microsoft Yahei',
      width: 20,
      height: 20,
      borderRadius: '100%',
      marginRight: 20,
      lineHeight: '20px',
      fontSize: 14,
      textAlign: 'center',
      backgroundColor: '#586abf',
      color: '#fff'
    }
  }
}

export default class NavigationBar extends Component {
  createTitleTextComponent() {
    const { navigationBarTitleTexts } = this.props;

    return (
      <div className="fl">
        {
          navigationBarTitleTexts.map((text, index) => {
            if (index === navigationBarTitleTexts.length - 1) {
              return <span>{ text }</span>
            } else {
              return <span>{ text } &gt; </span>
            }
          })
        }
      </div>
    );
  }

  createIconComponent() {
    const { icons } = this.props;
    const { icon } = getStyles(this.props);

    return (
      <div className="fr">
        {
          icons.map((iconObj, index) => {
            return <i style={ icon } onClick={ this.iconClickHandler.bind(this, index, iconObj.text) }>{ iconObj.text }</i>
          })
        }
      </div>
    );
  }

  iconClickHandler() {
    const { onShowedRightPanel } = this.props;
    onShowedRightPanel && onShowedRightPanel();
  }

  render() {
    const { root } = getStyles(this.props);

    return (
      <div className="navigation-bar clearfix" style={ root }>
        { this.createTitleTextComponent() }
        { this.createIconComponent() }
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
  navigationBarHeight: 37
};
