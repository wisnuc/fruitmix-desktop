/**
  根据日期操作图片
**/

import React, { Component, PropTypes } from 'react';

import Checkbox from '../../React-Redux-UI/src/components/partials/Checkbox';
import Action from '../../actions/action';
import loadingIcon from '../../../assets/images/index/loading.gif';

function getStyles () {
  return {
    itemStyle: {
      boxSizing: 'border-box',
      border: '1px solid #e5e5e5',
      position: 'relative',
      flexBasis: 150,
      height: 158,
      marginRight: 6,
      marginBottom: 6
    },
    selectStatusStyle: {
      display: 'none',
      position: 'absolute',
      left: 10,
      top: 10
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

export default class ImageByDate extends Component {
  constructor(props) {
    super(props);

    this.overedHandle = this.overedHandle.bind(this);
    this.outedHandle = this.outedHandle.bind(this);
    this.selectedItemHandle = this.selectedItemHandle.bind(this);
    this.changedHandle = this.changedHandle.bind(this);
    this.lookLargePhotoHandle = this.lookLargePhotoHandle.bind(this);

    this.state = {
      checked: false
    };
  }

  overedHandle() {
    this.el.classList.add('active');
  }

  outedHandle() {
    const nodeList = Array.from(document.querySelectorAll('.image-item')).map(node => node.querySelector('span'));
    const hasSelected = nodeList.some(node => node.classList.contains('selected-status-widget'))

    if (this.el.querySelector('span').classList.contains('selected-status-widget') || hasSelected) {
      return;
    }

    this.el.classList.remove('active');
  }

  selectedItemHandle(e) {
    const { onSelectedItem, date, dataIndex } = this.props;
    const el = e.currentTarget;
    const className = el.classList.contains('selected-status-widget')
      ? 'status-widget'
      : 'selected-status-widget';

    if (el.classList.contains('selected-status-widget')) {
      el.classList.remove('select-status-widget');
      el.classList.remove('selected-status-widget');
    } else {
      el.classList.add('select-status-widget');
      el.classList.add('selected-status-widget');
    }

    onSelectedItem(dataIndex, el.parentNode, date, el.classList.contains('selected-status-widget'));
    e.stopPropagation();
  }

  lookLargePhotoHandle(e) {
    const el = e.currentTarget;
    const {
      date, detectImageItemActive, onCancelSelectedItem,
      dataIndex, onViewLargeImage, onSelectedItem, hash
    } = this.props;
    const nodeList = Array.from(document.querySelectorAll('.image-item')).map(node => node.querySelector('span'));
    const hasSelected = nodeList.some(node => node.classList.contains('selected-status-widget'))

    if (el.classList.contains('active') && !el.querySelector('span').classList.contains('selected-status-widget') && hasSelected) {
      el.querySelector('span').classList.add('select-status-widget');
      el.querySelector('span').classList.add('selected-status-widget');
      onSelectedItem(dataIndex, el, date, true);
    } else if (el.classList.contains('active') && el.querySelector('span').classList.contains('selected-status-widget') && hasSelected) {
      el.querySelector('span').classList.remove('select-status-widget');
      el.querySelector('span').classList.remove('selected-status-widget');
      onCancelSelectedItem(dataIndex, date);

      // if (!detectImageItemActive(date)) {
      //     Array
      //    .prototype
      //    .slice
      //    .call(
      //      document.querySelectorAll('[data-date="'+ date +'"]')
      //    ).forEach(el => {
      //      el.classList.remove('show');
      //    });
      // }
    } else {
      //this.props.dispatch(Action.toggleMedia(true))
      onViewLargeImage(date, dataIndex, hash);
      ipc.send('getMediaImage', hash);
    }
  }

  changedHandle(value, checked) {
    this.setState({
      checked
    });
  }

  createFigureComponent(figureItem) {
    const { figureStyle, loadingStyle } = getStyles();

    if (figureItem.path) {
      // let thumbStyle
      // if (figureItem.width < 136 && figureItem.height<136) {
      //   thumbStyle = {
      //     maxWidth:'100%',
      //     maxHeight: '100%',
      //     margin:'auto',
      //     display: 'block'}
      // }else {
      //   if (figureItem.width > figureItem.height) {
      //     thumbStyle = {
      //       width:'100%',
      //       position:'relative',
      //       top:figureItem.width/250
      //     }
      //   }
      // }
      return (
        <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={ figureItem.path } />
      );
    } else {
      return (
        <img style={ loadingStyle } src={ loadingIcon } />
      );
    }
  }

  render() {
    const { date, state, dataIndex, figureItem, hash } = this.props;
    let { itemStyle, selectStatusStyle } = getStyles();

    return (
      <div ref={ el => this.el = el } data-type={ figureItem.type } data-size={ figureItem.size } data-exifDateTime={ figureItem.exifDateTime } data-width={ figureItem.width } data-height={ figureItem.height } data-hash={ hash } data-date={ date } data-index={ dataIndex } className="image-item" style={ itemStyle }
        onClick={ this.lookLargePhotoHandle } onMouseOver={ this.overedHandle } onMouseOut={ this.outedHandle }>
        <div className="selected-mask"></div>

        {/* 生成缩略图 */}
        { this.createFigureComponent(figureItem) }

        { figureItem.path && ( <span className="status-widget" style={ selectStatusStyle } onClick={ this.selectedItemHandle }><i></i></span> ) }
      </div>
    );
  }

  componentDidMount() {
    const { figureItem } = this.props;

    ipc.send('getThumb', figureItem);
  }
}

ImageByDate.propTypes = {
  /**
    选中项回调
  **/
  onSelectedItem: PropTypes.func.isRequired,

  /**
    取消选中处理函数
  **/
  onCancelSelectedItem: PropTypes.func.isRequired,

  /**
    点击查看大图
  **/
  onViewLargeImage: PropTypes.func.isRequired,

  // /**
  //   图片加载状态
  // **/
  // status: PropTypes.string,

  /**
    检查当前这一组是否active
  **/
  detectImageItemActive: PropTypes.func
};
