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
import AddShareDialog from '../common/Dialog';
import Mask from '../../React-Redux-UI/src/components/partials/Mask';
import ImageSwipe from '../common/ImageSwipe';
import { MenuItem } from 'material-ui';

import Action from '../../actions/action';

import svg from '../../utils/SVGIcon';

import { formatDate } from '../../utils/datetime';
import { timeShare } from '../../utils/funcExic';

function getStyles () {
  return {
    root: {
      marginTop: 55,
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
      imageGroup: void 0,
      addShareDialogShowedStatus: false
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
    const currentYearNodeList = Array.from(document.querySelectorAll('[data-date="'+ date +'"]'));
    const allNodeList = Array.from(document.querySelectorAll('.image-item'));

    if (hasChecked) {
      dispatch(Action.addDragImageItem(el, date, index));
    } else {
      dispatch(Action.removeDragImageItem(date, index));
    }

    if (hasChecked) {
      dispatch(Action.createFileInfo({
        type: el.dataset['type'],
        size: el.dataset['size'],
        exifDateTime: el.dataset['exifdatetime'],
        width: el.dataset['width'],
        height: el.dataset['height']
      }));

      setTimeout(() => {
        allNodeList.forEach(node => {
          node.classList.add('active');
        });

        const allChecked = currentYearNodeList.every(node => node.querySelector('span').classList.contains('selected-status-widget'));

        if (allChecked) {
          findDOMNode(this.refs["select_datetime" + '_' + date]).classList.add('selected-status-widget');
          findDOMNode(this.refs["select_datetime" + '_' + date]).classList.remove('unselected-status-widget');
        }
      }, 0);
    } else {
      const allYearUnChecked = currentYearNodeList.every(node => !node.querySelector('span').classList.contains('selected-status-widget'));
      const allUnChecked = allNodeList.every(node => !node.querySelector('span').classList.contains('selected-status-widget'));

      dispatch(Action.clearFileInfo());

      if (allYearUnChecked) {
        findDOMNode(this.refs["select_datetime" + '_' + date]).classList.remove('selected-status-widget');
        findDOMNode(this.refs["select_datetime" + '_' + date]).classList.add('unselected-status-widget');
      }

      if (allUnChecked) {
        allNodeList.forEach(node => node !== el && node.classList.remove('active')) ;
      }
    }
  }

  cancelSelectedItemHandle(index, date) {
    const { dispatch } = this.props;
    const nodeList = Array.from(document.querySelectorAll('[data-date="'+ date +'"]'));
    const allNodeList = Array.from(document.querySelectorAll('.image-item'));

    dispatch(Action.removeDragImageItem(date, index));
    dispatch(Action.clearFileInfo());

    const unChecked = nodeList.every(node => !node.querySelector('span').classList.contains('selected-status-widget'));
    const allUnChecked = allNodeList.every(node => !node.querySelector('span').classList.contains('selected-status-widget'));

    if (unChecked) {
      findDOMNode(this.refs["select_datetime" + '_' + date]).classList.remove('selected-status-widget');
      findDOMNode(this.refs["select_datetime" + '_' + date]).classList.add('unselected-status-widget');
    }

    if (allUnChecked) {
      allNodeList.forEach(node => node.classList.remove('active'));
    }
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

      const currentYearNodeList = Array.from(document.querySelectorAll('[data-date="'+ date +'"]'));
      const unChecked = currentYearNodeList.every(node => !node.classList.contains('show'));

      if (unChecked) {
        this.refs['select_datetime' + '_' + date].setState({ checked: false });
      }

      dispatch(Action.removeDragImageItem(date, index));
    }
  }

  shareActionHandle() {
    this.setState({ addShareDialogShowedStatus: true });
    // const { imageItem, login } = this.props;
    // const shareType = Array
    //   .from(document.querySelectorAll('.share-type'))
    //   .find(node => node.firstElementChild.checked)
    //   .firstElementChild
    //   .value;
    // const imageDigestList = imageItem.map(imageObj => imageObj.el.dataset['hash']);
    // let peoples;
    //
    // if (shareType === 'custom') {
    //   peoples = Array
    //     .from(document.querySelectorAll('.user-select'))
    //     .filter(node => node.checked).map(node => node.value);
    // } else {
    //   peoples = login.obj.users.filter(user => user.uuid !== login.obj.uuid).map(user => user.uuid);
    // }
    //
    // ipc.send('createMediaShare', imageDigestList, peoples);
    // this.clearAllSelectedItem();
  }

  albumActionHandle() {
    const { imageItem, login, node } = this.props;
    const shareType = Array
      .from(document.querySelectorAll('.share-type'))
      .find(node => node.firstElementChild.checked)
      .firstElementChild
      .value;
    const imageDigestList = imageItem.map(imageObj => imageObj.el.dataset['hash']);
    let peoples;

    if (shareType === 'custom') {
      peoples = Array
        .from(document.querySelectorAll('.user-select'))
        .filter(node => node.checked).map(node => node.value);
    } else {
      // peoples = login.obj.users.filter(user => user.uuid !== login.obj.uuid).map(user => user.uuid);
      peoples = node.server.users.filter(user => user.uuid !== login.obj.uuid).map(user => user.uuid)
    }

    ipc.send('createMediaShare', imageDigestList, peoples, {});
    this.clearAllSelectedItem();
  }

  createShareDialog() {
    if (this.state.addShareDialogShowedStatus) {
      return (
        <AddShareDialog
          caption="分享相片"
          content={ this.createShareContent() }
          style={{ width: 420, zIndex: 1200 }}
          foot={ this.createShareFoot() }
          orientation="custom"
          onClose={ function () {} }>
        </AddShareDialog>
      );
    }
  }

  createShareContent() {
    return (<div>1</div>);
  }

  createShareFoot() {
    return (<div>2</div>);
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
              <div className="action-btn" title="分享" onClick={ this.shareActionHandle.bind(this) }>
                <MenuItem
                  desktop={ true }
                  leftIcon={ svg.share() }>
                </MenuItem>
              </div>

              <div className="action-btn" title="相册" onClick={ this.albumActionHandle.bind(this) }>
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
    const nodelist = Array.from(document.querySelectorAll('.image-item'));
    nodelist.forEach(node => {
      node.classList.remove('active')
      node.classList.remove('show');
    });

    Object.keys(this.refs).forEach(key => {
      key.indexOf('select_datetime') >= 0 && this.refs[key].setState({ checked: false });
    });

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

      store.data = tmp.slice(0, 200);
      store.dateStr = store.dateStr.filter(date => !!store.data.find(obj => formatDate(obj.exifDateTime) === date));

      this.setState({
        imageGroup: store
      });
      // 每一时段显示多少个数据
      // timeShare(store.data, (medias) => {
      //   this.setState({
      //     imageGroup: {
      //       dateStr: store.dateStr,
      //       data: (this.state.imageGroup ? this.state.imageGroup.data : []).concat(medias)
      //     }
      //   });
      // }, () => {
      // }, 100, 300)();
    }
  }

  changedHandle(date, e) {
    const { dispatch } = this.props;
    const checkedEls = [];
    const currentYearNodeList = Array.from(document.querySelectorAll('[data-date="'+ date +'"]'));
    const allNodeList = Array.from(document.querySelectorAll('.image-item'));
    const node = e.currentTarget.querySelectorAll('span')[0];
    const className = node.classList.contains('selected-status-widget')
      ? 'unselected-status-widget'
      : 'selected-status-widget';

    node.classList.add('select-status-widget');
    node.classList.add(className);
    node.classList.remove(className === 'selected-status-widget' ? 'unselected-status-widget' : 'selected-status-widget');
    const checked = node.classList.contains('selected-status-widget');
    let checkedNodeList;

    dispatch(Action.clearFileInfo());

    allNodeList.forEach((node, index) => {
      if (node.dataset.date.indexOf(date) == 0) {
        if (!checked) {
          node.querySelector('span').classList.remove('select-status-widget');
          node.querySelector('span').classList.remove('selected-status-widget');
        } else {
          checkedEls.push(node);
          node.classList.add('active');
          node.querySelector('span').classList.add('select-status-widget');
          node.querySelector('span').classList.add('selected-status-widget');
        }
      } else {
        if (checked) {
          node.classList.add('active');
        }
      }
    });

    if (!checked) {
      checkedNodeList = allNodeList.filter(node => node.classList.contains('show'));

      allNodeList.forEach((node, index) => {
        if (!checkedNodeList.length) {
          node.classList.remove('active');
        }
      });
    }

    if (checked) {
      dispatch(Action.addDragImageList(checkedEls, date));
    } else {
      dispatch(Action.removeDragImageList(date));
    }
  }

  viewLargeImageHandle(date, currentThumbIndex, hash) {
    const { dispatch } = this.props;

    dispatch(Action.getLargeImageList(document.querySelectorAll('.image-item'), currentThumbIndex, date, hash));
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
              <div style={{ margin: '0 0 8px', fontFamily: 'helvetica', color: '#6d6d6d', fontSize: 12, lineHeight: '20px' }}>
                <div onClick={ this.changedHandle.bind(this, date) }>
                  <span ref={ "select_datetime" + '_' + date } className="status-widget select-status-widget unselected-status-widget">
                     <i></i>
                  </span>
                  <span style={{ marginLeft: 10 }}>{ date }</span>
                </div>

                {/*<Checkbox ref={ "select_datetime" + '_' + date }
                 key={ index }
                 value={ date }
                 text={ date }
                 onChange={ this.changedHandle.bind(this) }>
                </Checkbox>*/}
              </div>
              <div style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-start', marginBottom: 15 }}>
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
        { this.createShareDialog() }
        {/* right panel */}
        {/*<RightPanel ref="rightPanel" width={ 230 } dispatch={ this.props.dispatch } shareRadios={ this.props.shareRadios }></RightPanel>*/}

        <div style={ getStyles().root }>
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
     shareComponentEnterAnimateAble: state.shareComponentEnterAnimateAble,
     login: state.login
})

export default connect(mapStateToProps)(AllPhotos);
