/**
  相册图片项
**/

import React, { Component, PropTypes } from 'react';
import Action from '../../actions/action';
import loadingIcon from '../../../assets/images/index/loading.gif';

function getStyles () {
  return {
    itemStyle: {
      boxSizing: 'border-box',
      border: '1px solid #e5e5e5',
      float: 'left',
      position: 'relative',
      width: 140,
      height: 140,
      marginRight: 10,
      marginBottom: 10
    },
    selectStatusStyle: {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#757575',
      boxSizing: 'border-box',
      display: 'none',
      position: 'absolute',
      left: 10,
      top: 10,
      width: 15,
      height: 15
    },
    figureStyle: {
      width: '100%',
      height: '100%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 0',
      backgroundSize: 'cover',
    },
    loadingStyle: {
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
  };
}

export default class AlbumPhotoItem extends Component {
  constructor() {
    super();

    this.mouseoverHandle = this.mouseoverHandle.bind(this);
    this.mouseoutHandle = this.mouseoutHandle.bind(this);
    this.clickHandle = this.clickHandle.bind(this);
    this.blockClickHandle = this.blockClickHandle.bind(this);
    this.state = {
      selectStatus: void 0
    };
  }

  getThumb() {
    const { figureStyle, loadingStyle } = getStyles();
    const { path } = this.props;
    const isPath = path ? true : false;

    return (
      <img
        src={ isPath ? path : loadingIcon }
        style={ isPath ? figureStyle : loadingStyle } />
    );
  }

  getMask() {
    return (
      <div className="selected-mask"></div>
    );
  }

  getSelectWidget() {
    const { selectStatusStyle } = getStyles();

    return <i style={ selectStatusStyle } onClick={ this.clickHandle }></i>
  }

  mouseoverHandle() {
    if (this.state.selectStatus === 'active') {
      return;
    }

    this.setState({
      selectStatus: 'over'
    });
  }

  mouseoutHandle(e) {
    const nodeList = Array.from(document.querySelectorAll('.image-item'));
    const hasSelected = nodeList.some(node => node.classList.contains('show'));

    if (this.state.selectStatus === 'active' || hasSelected) {
      return;
    }

    this.setState({
      selectStatus: void 0
    });
  }

  clickHandle(e) {
    const { onSelect, dataIndex, date } = this.props;

    this.setState({
      selectStatus: this.state.selectStatus === 'active' ? 'over' : 'active'
    });

    setTimeout(() => {
      onSelect(dataIndex, this.el, date, this.state.selectStatus === 'active')
    }, 0);

    e.stopPropagation();
  }

  blockClickHandle(e) {
    const {
      onViewLargeImage, onSelect, dataIndex,
      date, digest, isUnViewLargePhoto
    } = this.props;
    const nodelist = Array.from(document.querySelectorAll('.image-item'));

    if (isUnViewLargePhoto) {
      this.setState({
        selectStatus: this.state.selectStatus === 'over' ? 'active' : 'over'
      });

      setTimeout(() => {
        onSelect(dataIndex, this.el, date, this.state.selectStatus === 'active')
      }, 0);

    } else {
      const unAllChecked = nodelist.every(node => !node.classList.contains('show'));

      if (!unAllChecked) {
        this.setState({
          selectStatus: this.state.selectStatus === 'over' ? 'active' : 'over'
        });

        setTimeout(() => {
          onSelect(dataIndex, this.el, date, this.state.selectStatus === 'active');
        }, 0);
      } else {
        onViewLargeImage(date, dataIndex);
        ipc.send('getMediaImage', digest);
      }
    }

    e.stopPropagation();
  }

  render() {
    const { date, digest, style, dataExifOrientation } = this.props;
    let { itemStyle } = getStyles();
    const selectStatus = this.state.selectStatus;
    let className = selectStatus
      ? selectStatus === 'over'
         ? 'active'
         : 'show active'
      : '';
    className = className.split(' ').concat(['image-item', 'fl']).join(' ').trim();
    itemStyle = Object.assign({}, itemStyle, style);

    return (
      <div
        ref={ el => this.el = el }
        data-date={ date }
        data-exiforientation={ dataExifOrientation }
        data-hash={ digest }
        className={ className }
        style={ itemStyle }
        onMouseEnter={ this.mouseoverHandle }
        onClick={ this.blockClickHandle }
        onMouseLeave={ this.mouseoutHandle }>
        {/* 缩略图 */}
        { this.getThumb() }

        {/* 遮罩 */}
        { this.getMask() }

        {/* 选择控件 */}
        { this.getSelectWidget() }
      </div>
    );
  }

  componentDidMount() {
    const { digest, path, isViewAllPhoto, albumDigest } = this.props;

    if (!path) {
      ipc.send(isViewAllPhoto ? 'getThumb' : 'getAlbumThumb', { digest }, albumDigest);
    }
  }
}

AlbumPhotoItem.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onViewLargeImage: PropTypes.func.isRequired
};
