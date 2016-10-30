/**
  相册查看
**/

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import NavigationBar from '../main/NavigationBar';
import AlbumPhotoItem from '../common/AlbumPhotoItem';
import Carousel from '../../React-Redux-UI/src/components/transitions/Carousel';
import Mask from '../../React-Redux-UI/src/components/partials/Mask';
import ImageSwipe from '../common/ImageSwipe';
import { MenuItem } from 'material-ui';

import svg from '../../utils/SVGIcon';
import Action from '../../actions/action';

function getStyles () {
  return {
    root: {
      marginLeft: -5,
      paddingTop: 52
    },
    operationBarStyle: {
      padding: '0 55px'
    },
    dragStyle: {
      position: 'fixed',
      backgroundColor: '#fff',
    	boxSizing: 'border-box',
    	border: '1px solid #d3d3d3',
      boxShadow: "0 0 5px rgba(0,0,0,.25)",
    	height: 155
    },
    dragButtonStyle: {
      display: 'inline-block',
      marginRight: 30,
      marginTop: 15,
      marginBottom: 15,
      textAlign: 'center',
      width: 16,
      height: 16
    }
  };
}

class AlbumView extends Component {
  getAlbumPhotoList() {
    const album = this.getAlbumByHash();

    return album.doc.contents;
  }

  getAlbumByHash() {
    const { media: { mediaShare }, albumHash } = this.props;

    return mediaShare.filter(media => media.digest === albumHash)[0];
  }

  toDate(timestamp) {
    const date = new Date();

    date.setTime(timestamp);

    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
  }

  clearAllSelectedItem() {
    const { dispatch } = this.props;

    dispatch(Action.clearDragImageItem());
  }

  viewLargeImageHandle(date, currentThumbIndex) {
    const { dispatch } = this.props;

    dispatch(Action.getLargeImageList(document.querySelectorAll('[data-date="'+ date +'"]'), currentThumbIndex, date));
  }

  shutdownMaskHandle() {
    const { dispatch } = this.props;

    dispatch(Action.toggleMedia(false));
    dispatch(Action.removeLargeImageList());
  }

  createMaskComponent() {
    const { largeImages } = this.props;

    if (largeImages.data && largeImages.data.length) {
      return (
        <Mask className="large-image-mask" onShutdown={ this.shutdownMaskHandle.bind(this) }></Mask>
      );
    }
  }

  createImageSwipeComponent() {
    const { largeImages, shareComponentEnterAnimateAble, view, shareRadios } = this.props;

    if (largeImages.data && largeImages.data.length) {
      return (
        <ImageSwipe
          width={ 960 }
          height={ 700 }
          shareComponentEnterAnimateAble={ shareComponentEnterAnimateAble }
          largeImages={ largeImages }
          view={ view }
          shareRadios={ shareRadios }>
        </ImageSwipe>
      );
    }
  }

  createAlbumPhotoItem() {
    const { doc: { ctime } } = this.getAlbumByHash();
    const albumPhotoHashList = this.getAlbumPhotoList();
    const { state: { albumHash } } = this.props;

    return albumPhotoHashList.map((albumPhoto, index) => (
      <AlbumPhotoItem
        ref={ 'date' + index }
        albumDigest={ albumHash }
        dataIndex={ index }
        date={ this.toDate(ctime) }
        key={ albumPhoto.digest }
        digest={ albumPhoto.digest }
        path={ albumPhoto.path }
        onViewLargeImage={ this.viewLargeImageHandle.bind(this) }
        onSelect={ this.selectAlbumPhotoItemHandle.bind(this) }>
      </AlbumPhotoItem>
    ));
  }

  createNavigationBar() {
    const { dispatch, navigationBarTitleTexts } = this.props;

    return (
      <NavigationBar
        dispatch={ dispatch }
        navigationBarTitleTexts={ navigationBarTitleTexts }
        navigationBarHorizontalPadding={ 18 }>
      </NavigationBar>
    );
  }

  createCarouselComponent() {
    const { imageItem, dispatch } = this.props;

    if (imageItem && imageItem.length) {
      const { dragStyle, dragButtonStyle, operationBarStyle } = getStyles();
      const dragElementRect = this.getDragElementRect();
      const newDragStyle = Object.assign({}, dragStyle, dragElementRect);
      const clearAllButtonStyle = Object.assign({}, dragButtonStyle, { marginRight: 0 });

      return (
        <div ref={ el => this.dragEl = el } className="image-selected" style={ newDragStyle }>

          <div className="image-operation clearfix" style={ operationBarStyle }>
            <div className="operations fl">
              <div className="action-btn" title="分享">
                <MenuItem
                  desktop={ true }
                  leftIcon={ svg.share() }>
                </MenuItem>
              </div>

              <div className="action-btn" title="相册">
                <MenuItem
                  desktop={ true }
                  leftIcon={ svg.album() }>
                </MenuItem>
              </div>

              {/*<div className="action-btn" title="下载">
                <MenuItem
                  desktop={ true }
                  leftIcon={ svg.selectedDownload() }>
                </MenuItem>
              </div>*/}
            </div>
            <div className="clear-operation fr" onClick={ this.clearAllSelectedItem.bind(this) } style={{ marginTop: 10 }}>
              <MenuItem
                className="action-btn"
                desktop={ true }
                leftIcon={ svg.deleteAll() }>
              </MenuItem>
              <label>清除全部</label>
            </div>
          </div>

          <div className="image-carousel">
            <Carousel
              className="carousel"
              data={ imageItem }
              dispatch={ dispatch }
              height={ 75 }
              onDragEnd={ this.dragEndHandle.bind(this) }
              width={ this.getDragElementRect().width - 2 }>
            </Carousel>
          </div>

          <div className="text-bar"
            style={{ textAlign: 'center', fontSize: 12, marginTop: 10, color: '#757575'  }}>
            选中
              <label style={{ fontSize: 14 }}>{ imageItem.length }</label>
            张图片
          </div>

        </div>
      );
    }
  }

  dragEndHandle(date, index, left, top, dragedEl) {
    const width = parseInt(dragedEl.offsetWidth);
    const height = parseInt(dragedEl.offsetHeight);

    // 检测是否超出了容器
    const container = this.getDragElementRect();
    const containerTop = this.dragEl.getBoundingClientRect().top + window.pageYOffset;
    const containerHeight = this.dragEl.getBoundingClientRect().height;

    const detectLeft = (width + left) >= container.left;
    const detectRight = left <= container.left + container.width;
    const detectTop = (width + top) >= containerTop;
    const detectBottom = top <= containerTop + containerHeight;

    if (!detectLeft || !detectRight || !detectTop || !detectBottom) {
      // 拖拽元素全部超出容器
      dispatch(Action.removeDragImageItem(date, index));
    }
  }

  getDragElementRect() {
    const leftSideBarWidth = 220;
    const totalGap = 36;
    const bottom = 10;
    const rightPanelWidth = window.innerWidth - leftSideBarWidth;
    const width = rightPanelWidth - totalGap;
    const originPosLeft = parseInt((rightPanelWidth - width) / 2);

    return {
      width: width,
      left: originPosLeft + leftSideBarWidth,
      bottom: bottom
    }
  }

  selectAlbumPhotoItemHandle(index, el, date, checked) {
    const { dispatch } = this.props;

    if (checked) {
      Object
        .keys(this.refs)
        .filter(key => key.indexOf('date') >= 0)
        .forEach(key => {
          const node = findDOMNode(this.refs[key]);

          if (node === el) {
            this.refs[key].setState({ selectStatus: 'active' });
          } else {
            if (this.refs[key].state.selectStatus !== 'active') {
              this.refs[key].setState({ selectStatus: 'over' });
            }
          }
        });

      setTimeout(() => {
        dispatch(Action.addDragImageItem(el, date, index));
      }, 0);
    } else {
      const filterKeys = Object.keys(this.refs).filter(key => key.indexOf('date') >= 0);
      const allUnChecked = filterKeys.every(key => this.refs[key].state.selectStatus !== 'active');

      if (allUnChecked) {
        filterKeys.forEach(key => {
          const node = findDOMNode(this.refs[key]);
          this.refs[key].setState({ selectStatus: el === node ? 'over' : void 0 });
        })
      }

      dispatch(Action.removeDragImageItem(date, index));
    }
  }

  render() {
    const { root } = getStyles();

    return (
      <div className="album-view clearfix">
        { this.createNavigationBar() }
        <div className="album-view-list clearfix" style={ root }>
          { this.createAlbumPhotoItem() }
        </div>
        { this.createCarouselComponent() }
        { this.createMaskComponent() }
        { this.createImageSwipeComponent() }
      </div>
    );
  }

  componentWillUnmount() {
    this.clearAllSelectedItem();
  }
};

const mapStateToProps = (state) => ({
  albumHash: state.albumHash,
  media: state.media,
  imageItem: state.imageItem,
  navigationBarTitleTexts: state.navigationBarTitleTexts,
  shareComponentEnterAnimateAble: state.shareComponentEnterAnimateAble,
  view: state.view,
  largeImages: state.largeImages,
  shareRadios: state.shareRadio
});

export default connect(mapStateToProps)(AlbumView);
