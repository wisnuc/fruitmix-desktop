/**
 PhotoApp.jsx
**/

import { Menu, MenuItem, Divider } from 'material-ui';
import IconButton from 'material-ui/IconButton';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import DeviceStorage from 'material-ui/svg-icons/device/storage';
import { blue500, red500, greenA200 } from 'material-ui/styles/colors'

import { sharpCurve, sharpCurveDuration, sharpCurveDelay } from '../common/motion';

import React, { Component } from 'react';
import PhotoToolBar from './PhotoToolBar';
import PhotoList from './PhotoList';

const LEFTNAV_WIDTH = 210;

function getStyles (leftnav) {
  return {
    leftNav: {
      width: LEFTNAV_WIDTH,
      height: '100%',
      position: 'absolute',
      left: leftnav ? 0 : -LEFTNAV_WIDTH,
      top: 0,
      transition: sharpCurve('left'),
      zIndex: 1000
    },
    photoList: {
      padding: '16px 15px 0',
      overflow: 'auto',
      position: 'absolute',
      left: 0,
      top: 56,
      width: '100%',
      height: '100%'
    }
  }
}

class PhotoApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login: null,
      leftNav: true
    };

    this.toggleLeftNav = () => this.setState({ leftNav: !this.state.leftNav });
    this.style = getStyles(this.state.leftNav);

    // this.renderLeftNav = () => (
    //   <div
    //     style={ leftNav }
    //     transitionEnabled={ false }
    //     rounded={false}
    //     zDepth={this.state.leftNav ? 3 : 0}>
    //
    //     {/* 导航条 */}
    //     <div style={{width: '100%', height: 56, display: 'flex', alignItems: 'center',
    //       backgroundColor: blue500 }}>
    //       <div style={{marginLeft:4, width:68}}>
    //         <IconButton iconStyle={{color: '#FFF'}}
    //           onTouchTap={() => this.setState(Object.assign({}, this.state, {
    //             leftNav: false
    //           }))}>
    //           <NavigationMenu />
    //         </IconButton>
    //       </div>
    //       <div style={{fontSize:21, fontWeight: 'medium', color: '#FFF' }}>文件</div>
    //     </div>
    //
    //     {/* 左侧菜单 */}
    //     <Menu
    //       autoWidth={ false }
    //       width={ LEFTNAV_WIDTH }>
    //       <MenuItem primaryText='照片' leftIcon={<DeviceStorage />}
    //         innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}
    //       />
    //       <Divider />
    //       <MenuItem primaryText='相册' leftIcon={<DeviceStorage />}
    //         innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}
    //       />
    //       <Divider />
    //       <MenuItem primaryText='分享' leftIcon={<DeviceStorage />}
    //         innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}
    //       />
    //     </Menu>
    //   </div>
    // );
  }

  render() {
    return (
      <div>
        {/* 工具条 */}
        <PhotoToolBar
          action={ this.toggleLeftNav }
          state={ ['照片'] }/>

        {/* 照片列表 */}
        <PhotoList style={ this.style.photoList } />
      </div>
    );
  }

}

export default PhotoApp;
