/**
  相册
**/

import React, { Component, PropTypes } from 'react';

import NavigationBar from '../main/NavigationBar';
import AlbumItem from './AlbumItem';
import AlbumPhotoItem from '../common/AlbumPhotoItem';
import AddAlbumTopicDialog from '../common/Dialog';
import AddAlbumPhotoListDialog from '../common/Dialog';
import Input from '../../React-Redux-UI/src/components/partials/Input';
import Textarea from '../../React-Redux-UI/src/components/partials/Textarea';
import Button from '../../React-Redux-UI/src/components/partials/Button';
import AllPhotos from './AllPhotos';
import { formatDate } from '../../utils/datetime';
import Carousel from '../../React-Redux-UI/src/components/transitions/Carousel';
import Mask from '../../React-Redux-UI/src/components/partials/Mask';
import ImageSwipe from '../common/ImageSwipe';
import { MenuItem } from 'material-ui';

import svg from '../../utils/SVGIcon';
import Action from '../../actions/action';

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
    },
    input: {
      border: 0,
      border: '1px solid #e0e0e0',
      color: 'rgba(0,0,0,.87)',
      display: 'block',
      fontSize: 12,
      marginBottom: 24,
      padding: 10,
      width: '100%',
      boxSizing: 'border-box',
      resize: 'none'
    },
    button: {
      backgroundColor: '#37abb5',
      color: '#fff',
      fontSize: 12,
      height: 35,
      lineHeight: '35px',
      marginLeft: 10,
      width: 60,
    }
  }
}

export default class Albums extends Component {
  constructor() {
    super();

    this.state = {
      addAlbumIconShowedStatus: true,
      addAlbumTopicDialogShowedStatus: false,
      addAlbumPhotoListDialogShowedStatus: false
    }
  }

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

  clearAllSelectedItem() {
    const { dispatch } = this.props;

    dispatch(Action.clearDragImageItem());
  }

  viewLargeImageHandle(date, currentThumbIndex) {
    const { dispatch } = this.props;

    dispatch(Action.getLargeImageList(document.querySelectorAll('[data-date="'+ date +'"]'), currentThumbIndex, date));
  }

  selectAlbumPhotoItemHandle(index, el, date, checked) {
    const { dispatch } = this.props;

    if (checked) {
      Object
        .keys(this.refs)
        .forEach(key => this.refs[key].setState({ selectStatus: 'over' }));

      setTimeout(() => {
        dispatch(Action.addDragImageItem(el, date, index));
      }, 0);
    } else {
      dispatch(Action.removeDragImageItem(date, index));
    }
  }

  getPhotoList() {
    const { state: { media: { data } } } = this.props;
    return data.slice(0, 100).filter(l => !!l.datetime);
  }

  createAlbumItems() {
    const { state } = this.props;

    return state.media.mediaShare.map(album =>
      <AlbumItem key={ album.digest } info={ album } dispatch={ this.props.dispatch } state={ this.props.state }></AlbumItem>
    );
  }

  createAddAlbumIcon() {
    const { add } = getStyles();

    return (
      <div style={ add } onClick={ this.toggleShowed.bind(this, 'addAlbumPhotoListDialogShowedStatus') }>+</div>
    );
  }

  createAddAlbumPhotoListDialog() {
    return (
      <AddAlbumPhotoListDialog
        dialogWidth={ 1000 }
        caption="新建相册"
        onClose={ this.toggleShowed.bind(this, 'addAlbumPhotoListDialogShowedStatus') }
        content={ this.createAddAlbumPhotoListDialogContent() }
        foot={ this.createAddAlbumPhotoListDialogFoot() }>
      </AddAlbumPhotoListDialog>
    );
  }

  createAddAlbumPhotoListDialogContent() {
    const photoList = this.getPhotoList();

    return (
      <div style={{ height: 350, overflow: 'auto' }}>
        {
          photoList.map((photo, index) =>
            <AlbumPhotoItem
              refs={ photo.digest + index }
              dataIndex={ index }
              isViewAllPhoto={ true }
              date={ formatDate(photo.datetime) }
              key={ photo.digest }
              digest={ photo.digest }
              path={ photo.path }
              onViewLargeImage={ this.viewLargeImageHandle.bind(this) }
              onSelect={ this.selectAlbumPhotoItemHandle.bind(this) }>
            </AlbumPhotoItem>
          )
        }
      </div>
    );
  }

  createAddAlbumPhotoListDialogFoot() {
    const { button } = getStyles();

    return (
      <div className="clearfix">
        <div className="fr">
          <Button
            className="cancel-btn"
            style={ button }
            clickEventHandle={ this.toggleShowed.bind(this, 'addAlbumPhotoListDialogShowedStatus') }
            text="下一步">
          </Button>
        </div>
      </div>
    );
  }

  createAddAlbumTopicDialog() {
    return (
      <AddAlbumTopicDialog
        dialogWidth={ 560 }
        caption="新建相册"
        onClose={ this.toggleShowed.bind(this, 'addAlbumTopicDialogShowedStatus') }
        content={ this.createAlbumTopicDialogContent() }
        foot={ this.createAlbumTopicDialogFoot() }>
      </AddAlbumTopicDialog>
    );
  }

  createAlbumTopicDialogContent() {
    const { dialogContent, input } = getStyles();

    return (
      <div style={ dialogContent }>
        <Input
          placeholder="请输入相册名称"
          style={ input }>
        </Input>
        <Textarea
          placeholder="请输入描述"
          style={ input }>
        </Textarea>
      </div>
    );
  }

  createAlbumTopicDialogFoot() {
    const { button } = getStyles();

    return (
      <div className="clearfix">
        <div className="fr">
          <Button
            className="cancel-btn"
            style={ button }
            clickEventHandle={ this.toggleShowed.bind(this, 'addAlbumTopicDialogShowedStatus') }
            text="取消">
          </Button>
          <Button
            className="cancel-btn"
            style={ button }
            clickEventHandle={ this.submitAddAlbumHandle.bind(this) }
            text="确定">
          </Button>
        </div>
      </div>
    );
  }

  submitAddAlbumHandle() {

  }

  toggleShowed(mark) {
    const showedDialogState = { addAlbumIconShowedStatus: !this.state.addAlbumIconShowedStatus };

    if (mark) {
      showedDialogState[mark] = !this.state[mark];
    } else {
      showedDialogState['addAlbumTopicDialogShowedStatus'] = !this.state.addAlbumTopicDialogShowedStatus;
      showedDialogState['addAlbumPhotoListDialogShowedStatus'] = !this.state.addAlbumPhotoListDialogShowedStatus;
    }

    this.setState(showedDialogState);
  }

  render() {
    const { list } = getStyles();

    return (
      <div className="album-container">
        {/* navigationbar */}
        { this.createNavigationBar() }

        {/* 相册列表 */}
        <div className="album-list clearfix" style={ list }>
          { this.createAlbumItems() }
        </div>

        {/* add icon */}
        { this.state.addAlbumIconShowedStatus && this.createAddAlbumIcon() }

        {/* 新建相册主题对话框 */}
        { this.state.addAlbumTopicDialogShowedStatus && this.createAddAlbumTopicDialog() }

        {/* 新建相册所有照片对话框 */}
        { this.state.addAlbumPhotoListDialogShowedStatus && this.createAddAlbumPhotoListDialog() }
      </div>
    );
  }

  componentWillUnmount() {
    this.clearAllSelectedItem();
  }
}
