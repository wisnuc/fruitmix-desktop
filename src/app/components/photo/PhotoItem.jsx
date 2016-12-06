/**
  PhotoItem
**/

import { ipcRenderer } from 'electron';

import React, { Component, PropTypes } from 'react';
import loading from '../../../assets/images/index/loading.gif';

function getStyles () {
  return {
    root: {
      boxSizing: 'border-box',
      border: '1px solid #e5e5e5',
      height: '100%',
      width: '100%'
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
  shouldComponentUpdate(nextProps) {
    return nextProps.path !== this.props.path;
  }

  render() {
    let { path, style } = this.props;
    let { root, thumb, loadingIcon } = getStyles();
    let component;

    if (path) {
      component = (<img src={ path } style={ thumb } />);
    } else {
      component = (<img src={ loading } style={ loadingIcon } />);
    }

    return (
      <div style={ style }>
        <div style={ root }>
          { component }
        </div>
      </div>
    );
  }

  componentDidMount() {
    let { digest } = this.props;

    ipcRenderer.send('getThumb', [{ digest }]);
  }
}

PhotoItem.propTypes = {
  digest: PropTypes.string.isRequired
};
