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
      float: 'left',
      position: 'relative',
      width: 140,
      height: 140,
      marginRight: 10,
      marginBottom: 10
    },
    selectStatusStyle: {
      borderRadius: '100%',
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
    this.el.classList.add('show');
  }

  outedHandle() {
    if (this.el.classList.contains('active')) {
      return;
    }

    this.el.classList.remove('show');
  }

  selectedItemHandle(e) {
    const { onSelectedItem, date, dataIndex } = this.props;
    const el = e.currentTarget.parentNode;

    el.classList.toggle('active');
    el.classList.toggle('show');
    onSelectedItem(dataIndex, el, date, el.classList.contains('active'));
    e.stopPropagation();
  }

  lookLargePhotoHandle(e) {
    const el = e.currentTarget;
    const { date, detectImageItemActive, onCancelSelectedItem, dataIndex, onViewLargeImage } = this.props;

    if (el.classList.contains('active')) {
      el.classList.remove('active');
      onCancelSelectedItem(dataIndex, date);

      if (!detectImageItemActive(date)) {
          Array
         .prototype
         .slice
         .call(
           document.querySelectorAll('[data-date="'+ date +'"]')
         ).forEach(el => {
           el.classList.remove('show');
         });
      }
    } else {
      //this.props.dispatch(Action.toggleMedia(true))
      onViewLargeImage(date, dataIndex);
      ipc.send('getMediaImage',this.props.hash);
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
      return (
        <img src={ figureItem.path } style={ figureStyle }/>
      );
    } else {
        // c.log(this.props.state.media.map.size)
         //c.log(this.props.state.media.map.get(figureItem.digest))
        //c.log(figureItem)
      return (
        <img style={ loadingStyle } src={ loadingIcon } />
      );
    }
  }

  render() {
    const { date, state, dataIndex, figureItem, hash } = this.props;
    let { itemStyle, selectStatusStyle } = getStyles();

    return (
      <div ref={ el => this.el = el } data-hash={ hash } data-date={ date } data-index={ dataIndex } className="image-item" style={ itemStyle }
        onClick={ this.lookLargePhotoHandle } onMouseOver={ this.overedHandle } onMouseOut={ this.outedHandle }>
        <div className="selected-mask"></div>

        {/* 生成缩略图 */}
        { this.createFigureComponent(figureItem) }

        { figureItem.path && ( <i style={ selectStatusStyle } onClick={ this.selectedItemHandle }></i> ) }
      </div>
    );
  }

  componentDidMount() {
    const { figureItem } = this.props;

    ipc.send('getThumb',figureItem);
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
