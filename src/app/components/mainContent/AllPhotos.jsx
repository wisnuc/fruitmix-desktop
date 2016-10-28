/**
  所有照片
**/

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';

import Checkbox from '../../React-Redux-UI/src/components/partials/Checkbox';
import NavigationBar from '../main/NavigationBar';
import RightPanel from '../main/RightPanel';
import ImageByDate from '../common/ImageByDate';
// 图片轮播组件
import Carousel from '../../React-Redux-UI/src/components/transitions/Carousel';
import Mask from '../../React-Redux-UI/src/components/partials/Mask';
import ImageSwipe from '../common/ImageSwipe';
import { MenuItem } from 'material-ui';

import Action from '../../actions/action';

import svg from '../../utils/SVGIcon';

import { formatDate } from '../../utils/datetime';

function getStyles () {
  return {
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
  }
}

/**
  生成根据日期时间戳降序，日期字符串作为key的map
**/
function getMapByDateTimestamp (arr) {
  const map = new Map;
  const result = [];

  for (let item of arr) {
    if (item.datetime != null) {
      const dateStr = formatDate(item.datetime);

      if (!map.has(dateStr)) {
        map.set(dateStr, [ item ]);
      } else {
        const data = map.get(dateStr);
        data.push(item);
      }
    }
  }

  let mapKeys = [];

  for (let key of map.keys()) {
    mapKeys.push(key);
  }

  mapKeys = mapKeys.sort().reverse();

  for (let key of mapKeys) {
    result.push( { key: key, data: map.get(key) } );
  }

  return result;
}

class AllPhotos extends Component {
  constructor(props) {
    super(props);

    this.map = props.media ? props.media.data : [];
    this.state = {
      imageGroup: void 0
    };
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

  selectedItemHandle(index, el, date, hasChecked) {
    const { dispatch } = this.props;
    const nodeList = Array.from(document.querySelectorAll('[data-date="'+ date +'"]'));

    if (hasChecked) {
      dispatch(Action.addDragImageItem(el, date, index));
    } else {
      dispatch(Action.removeDragImageItem(date, index));
    }

    if (hasChecked) {
      setTimeout(() => {
        Object.keys(this.refs).forEach(ref => {
          if (ref.indexOf(date) >= 0) {
            findDOMNode(this.refs[ref]).classList.add('active');
          }
        });

        const allChecked = nodeList.every(node => node.classList.contains('show'));

        if (allChecked) {
          this.refs["select_datetime" + '_' + date].setState({ checked: true });
        }
      }, 0);
    } else {
      const allUnChecked = nodeList.every(node => !node.classList.contains('show'));

      if (allUnChecked) {
        this.refs["select_datetime" + '_' + date].setState({ checked: false });
      }
    }
  }

  cancelSelectedItemHandle(index, date) {
    const { dispatch } = this.props;
    const nodeList = Array.from(document.querySelectorAll('[data-date="'+ date +'"]'));

    dispatch(Action.removeDragImageItem(date, index));
    setTimeout(() => {
      const allUnChecked = nodeList.every(node => !node.classList.contains('show'));

      if (allUnChecked) {
        this.refs["select_datetime" + '_' + date].setState({ checked: false });
      }
    })
  }

  detectImageItemActive(date) {
    const imageItemEls = Array.prototype.slice.call(document.querySelectorAll('[data-date="'+ date +'"]'));
    const hasSelectedLength = imageItemEls.filter(el => el.classList.contains('active')).length;

    return !!hasSelectedLength;
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
      findDOMNode(this.refs[date + '-' + index]).classList.remove('active');
      findDOMNode(this.refs[date + '-' + index]).classList.remove('show');
      dispatch(Action.removeDragImageItem(date, index));
    }
  }

  createCarouselComponent() {
    const { imageItem, dispatch } = this.props;

    if (imageItem && imageItem.length) {
      const { dragStyle, dragButtonStyle, operationBarStyle } = getStyles();
      const dragElementRect = this.getDragElementRect();
      const newDragStyle = Object.assign({}, dragStyle, dragElementRect, { bottom: 0 });
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

              <div className="action-btn" title="下载">
                <MenuItem
                  desktop={ true }
                  leftIcon={ svg.selectedDownload() }>
                </MenuItem>
              </div>
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
            {/* 图片轮播 */}
            <Carousel
              className="carousel"
              data={ imageItem }
              dispatch={ dispatch }
              height={ 75 }
              onDragEnd={ this.dragEndHandle.bind(this) }
              width={ dragElementRect.width - 2 }>
            </Carousel>
          </div>
          <div
            className="text-bar"
            style={{ textAlign: 'center', fontSize: 12, marginTop: 10, color: '#757575'  }}>
              选中
              <label style={{ fontSize: 14 }}>
                { imageItem.length }
              </label>
              张图片
          </div>
        </div>
      );
    }
  }

  clearAllSelectedItem() {
    const { dispatch } = this.props;

    dispatch(Action.clearDragImageItem());
  }

  scrollTo() {
    if (this.mounted || this.mounted === void 0) {
      let store = {
        dateStr: [],
        data: []
      };

      let tmp = this.map;

      let tmpKeys = tmp.map(t =>
        formatDate(t.exifDateTime)
      );

      let uniqueKeys = tmpKeys.filter((key, index) =>
        !index || tmpKeys.indexOf(key) === index
      );

      uniqueKeys.forEach(key => {
        key && store.dateStr.push(key);
      });

      store.data = tmp;
      this.setState({ imageGroup: store });
    }
  }

  changedHandle(date, checked) {
    const { dispatch } = this.props;
    const checkedEls = [];

    Object.keys(this.refs).forEach((key, index) => {
      if (key.indexOf(date) == 0) {

        findDOMNode(this.refs[key]).classList[checked ? 'add' : 'remove']('active');
        findDOMNode(this.refs[key]).classList[checked ? 'add' : 'remove']('show');

        checkedEls.push(findDOMNode(this.refs[key]));
      }
    });

    if (checked) {
      dispatch(Action.addDragImageList(checkedEls, date));
    } else {
      dispatch(Action.removeDragImageList(date));
    }
  }

  viewLargeImageHandle(date, currentThumbIndex) {
    const { dispatch } = this.props;

    dispatch(Action.getLargeImageList(document.querySelectorAll('[data-date="'+ date +'"]'), currentThumbIndex, date));
  }

  createImageByDateComponent() {
    let component;

    if (this.state.imageGroup) {
      const dateStr = this.state.imageGroup.dateStr;
      const imageGroup = this.state.imageGroup.data;

      if (dateStr.length) {
        component = dateStr.map((date, index) => {
          return (
            <div className="clearfix">
              <div style={{ margin: '0 0 10px', fontFamily: 'helvetica', color: '#6d6d6d', fontSize: 12 }}>
                <Checkbox ref={ "select_datetime" + '_' + date }
                 key={ index }
                 value={ date }
                 text={ date }
                 onChange={ this.changedHandle.bind(this) }>
                </Checkbox>
              </div>
              {
                imageGroup.map((entry, index) => {
                  if (formatDate(entry.exifDateTime) === date) {

                    return (
                      <ImageByDate
                        key={ '' + index + index }
                        date={ date }
                        dataIndex={ index }
                        ref={ date + '-' + index }
                        figureItem={ entry }
                        onSelectedItem={ this.selectedItemHandle.bind(this) }
                        onCancelSelectedItem={ this.cancelSelectedItemHandle.bind(this) }
                        onViewLargeImage={ this.viewLargeImageHandle.bind(this) }
                        detectImageItemActive={ this.detectImageItemActive }
                        hash={ entry.digest }
                        dispatch={ this.props.dispatch }
                        state={this.props.state}>
                      </ImageByDate>
                    )
                  }
                })
              }
            </div>
          );
        });
      }
    }

    return (
      <div className="image-group">
        {/* navigation bar */}
        <NavigationBar
          dispatch={ this.props.dispatch }
          navigationBarTitleTexts={ this.props.navigationBarTitleTexts }
          navigationBarHorizontalPadding={ 18 }
          hasIconAble={ true }
          onShowedRightPanel={ this.showedRightPanelHandler.bind(this) }>
        </NavigationBar>

        {/* right panel */}
        <RightPanel ref="rightPanel" width={ 230 } dispatch={ this.props.dispatch } shareRadios={ this.props.shareRadios }></RightPanel>

        <div style={{ marginTop: 52 }}>
          { component }
        </div>
      </div>
    );
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
    const { largeImages } = this.props;

    if (largeImages.data && largeImages.data.length) {
      return (
        <ImageSwipe
          width={ 960 }
          height={ 700 }>
        </ImageSwipe>
      );
    }
  }

  showedRightPanelHandler() {
    this.refs.rightPanel && findDOMNode(this.refs.rightPanel).lastElementChild.classList.toggle('active');
  }

  componentDidMount() {
    this.mounted = true;
    this.scrollTo();
  }

  componentWillUnmount() {
    this.mounted = false;
    this.clearAllSelectedItem();
  }

  componentWillReceiveProps(nextProps) {
    this.map = nextProps.media ? nextProps.media.data : [];

    this.scrollTo();
  }

  render() {
    return (
      <div className="view-image">
        { this.createImageByDateComponent() }
        { this.createCarouselComponent() }
        { this.createMaskComponent() }
        { this.createImageSwipeComponent() }
      </div>
    );
  }
}

var mapStateToProps = (state)=>({
       //state: state,
     media: state.media,
     navigation: state.navigation,
     view: state.view,
     imageItem: state.imageItem,
     largeImages: state.largeImages,
     navigationBarTitleTexts: state.navigationBarTitleTexts,
     shareRadios: state.shareRadio,
     shareComponentEnterAnimateAble: state.shareComponentEnterAnimateAble
})

export default connect(mapStateToProps)(AllPhotos);
