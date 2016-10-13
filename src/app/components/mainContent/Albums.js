/**
  相册
**/

import React, { Component, PropTypes } from 'react';

import NavigationBar from '../main/NavigationBar';
import AlbumItem from './AlbumItem';

function getStyles () {

  return {
    list: {
      marginLeft: -5,
      paddingTop: 10
    },
    add: {
      bottom: 140,
      backgroundColor: '#e54387',
      borderRadius: '100%',
      color: '#fff',
      fontSize: 30,
      height: 40,
      lineHeight: '40px',
      position: 'fixed',
      right: 50,
      textAlign: 'center',
      width: 40
    }
  }
}

export default class Albums extends Component {
  createNavigationBar() {
    return (
      <NavigationBar
        dispatch={ this.props.dispatch }
        state={ this.props.state }
        navigationBarHorizontalPadding={ 18 }
        icons={[]}>
      </NavigationBar>
    );
  }

  createAlbum() {
    const { state } = this.props;

    return state.media.mediaShare.map(album =>
      <AlbumItem info={ album } state={ this.props.state }></AlbumItem>
    );
  }

  createAddAlbum() {

  }

  render() {
    const { list, add } = getStyles();
    return (
      <div className="album-container">
        {/* navigationbar */}
        { this.createNavigationBar() }

        {/* 相册列表 */}
        <div className="album-list clearfix" style={ list }>
          { this.createAlbum() }
        </div>

        {/* add icon */}
        <div style={ add }>+</div>
      </div>
    );
  }
}
