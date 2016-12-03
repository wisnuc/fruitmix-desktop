/**
  PhotoItem
**/

import { ipcRenderer } from 'electron';

import React, { Component } from 'react';
import loadingIcon from '../../../assets/images/index/loading.gif';

function getStyles () {
  return {
    root: {
      boxSizing: 'border-box',
      border: '1px solid #e5e5e5',
      position: 'relative',
      flexBasis: 150,
      height: 158,
      marginRight: 6,
      marginBottom: 6
    },
    thumb: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    loadingIcon: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      marginLeft: -8,
      marginTop: -8,
      width: 16,
      height: 16,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 0'
    }
  }
}

export default class PhotoItem extends Component {
  buildThumb(path, thumbStyle) {
    return (
      <img
        src={ path }
        style={ thumbStyle }
      />
    );
  }

  buildLoadingIcon(loadingIconStyle) {
    return (
      <img
        src={ loadingIcon }
        style={ loadingIconStyle }
      />
    );
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.state.path !== this.props.state.path;
  }

  render() {
    let { path } = this.props.state;
    let { root, thumb, loadingIcon } = getStyles();

    return (
      <div style={ root }>
        { path ? this.buildThumb(path, thumb) : this.buildLoadingIcon(loadingIcon) }
      </div>
    );
  }

  // componentDidMount() {
  //   let { path } = this.props.state;
  //
  //   ipcRenderer.send('getThumb', path);
  // }
}
