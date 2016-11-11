/**
  导航条
**/

import React, { Component, PropTypes } from 'react';

//import RightPanel from './RightPanel';

function getStyles (props) {
  return {
    root: {
      borderBottom: '1px solid #efefef',
      backgroundColor: props.navigationBarBackgroundColor,
      color: props.navigationBarTextStyle,
      fontSize: props.navigationBarFontSize,
      fontFamily: props.navigationBarFontFamily,
      paddingLeft: props.navigationBarHorizontalPadding,
      height: props.navigationBarHeight,
      lineHeight: props.navigationBarHeight + 'px',
      marginLeft: 0,
      position: 'fixed',
      left: 220,
      right: 0,
      top: 50,
      zIndex: 1000
    },
    iconBlock: {
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: 'transparent',
      borderRadius: '2px',
      float: 'right',
      height: 32,
      lineHeight: '32px',
      textAlign: 'center',
      width: 32
    },
    icon: {
      display: 'inline-block',
      fontFamily: 'Microsoft Yahei',
      width: 20,
      height: 20,
      borderRadius: '100%',
      lineHeight: '20px',
      fontSize: 14,
      textAlign: 'center',
      backgroundColor: '#757575',
      color: '#fff'
    }
  }
}

export default class NavigationBar extends Component {
  constructor() {
    super();

    this.state = {
      addActiveClassAble: false
    };
  }

  createTitleTextComponent() {
    const { navigationBarTitleTexts } = this.props;

    return (
      <div className="fl">
        {
          navigationBarTitleTexts.map((text, index) => {
            if (index === navigationBarTitleTexts.length - 1) {
              return <span key={ index }>{ text }</span>
            } else {
              return <span key={ index }>{ text } &gt; </span>
            }
          })
        }
      </div>
    );
  }

  createIconComponent() {
    const { icons, hasIconAble } = this.props;
    const { icon, iconBlock } = getStyles(this.props);
    const activeClass = 'popup-photoinfo-icon'
      .split(' ')
      .concat(this.state.addActiveClassAble ? 'active' : '')
      .join(' ')
      .trim();

    if (hasIconAble) {
      return (
        <div className="fr">
          <div className={ activeClass } style={ iconBlock }>
            <i
              style={ icon }
              onClick={ this.iconClickHandler.bind(this) }>
              i
            </i>
          </div>
        </div>
      );
    }
  }

  iconClickHandler(e) {
    const { onShowedRightPanel } = this.props;

    onShowedRightPanel && onShowedRightPanel();
    this.setState({
      addActiveClassAble: !this.state.addActiveClassAble
    })
  }

  changeIconBackgroundColor(iconEl) {
    iconEl.classList.add('active');
  }

  render() {
    const { root } = getStyles(this.props);

    return (
      <div className="navigation-bar clearfix" style={ root }>
        { this.createTitleTextComponent() }
        { /*this.createIconComponent() */}
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
  // 是否显示图标
  hasIconAble: PropTypes.oneOf([true, false])
};

NavigationBar.defaultProps = {
  navigationBarBackgroundColor: '#fff',
  navigationBarTextStyle: '#9a9a9a',
  navigationBarFontSize: 12,
  navigationBarFontFamily: 'sans-serif',
  navigationBarHorizontalPadding: 15,
  navigationBarHeight: 37,
  hasIconAble: false
};
