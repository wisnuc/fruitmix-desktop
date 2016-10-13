/**
  相册
**/

import React, { Component, PropTypes } from 'react';

import NavigationBar from '../main/NavigationBar';
import AlbumItem from './AlbumItem';
import AddAlbumDialog from '../common/Dialog';
import Input from '../../React-Redux-UI/src/components/partials/Input';
import Textarea from '../../React-Redux-UI/src/components/partials/Textarea';
import Button from '../../React-Redux-UI/src/components/partials/Button';

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

    this.toggleShowed = this.toggleShowed.bind(this);
    this.state = {
      addAlbumIconShowedStatus: true,
      addAlbumDialogShowedStatus: false
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

  createAlbumItems() {
    const { state } = this.props;

    return state.media.mediaShare.map(album =>
      <AlbumItem key={ album.digest } info={ album } dispatch={ this.props.dispatch } state={ this.props.state }></AlbumItem>
    );
  }

  createAddAlbumIcon() {
    const { add } = getStyles();

    return (
      <div style={ add } onClick={ this.toggleShowed }>+</div>
    );
  }

  createAddAlbumDialog() {
    return (
      <AddAlbumDialog
        dialogWidth={ 560 }
        caption="新建相册"
        onClose={ this.toggleShowed }
        content={ this.createAlbumDialogContent() }
        foot={ this.createAlbumDialogFoot() }>
      </AddAlbumDialog>
    );
  }

  createAlbumDialogContent() {
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

  createAlbumDialogFoot() {
    const { button } = getStyles();

    return (
      <div className="clearfix">
        <div className="fr">
          <Button
            className="cancel-btn"
            style={ button }
            clickEventHandle={ this.clickHandle.bind(this) }
            text="取消">
          </Button>
          <Button
            className="cancel-btn"
            style={ button }
            clickEventHandle={ this.clickHandle.bind(this) }
            text="确定">
          </Button>
        </div>
      </div>
    );
  }

  toggleShowed() {
    this.setState({
      addAlbumIconShowedStatus: !this.state.addAlbumIconShowedStatus,
      addAlbumDialogShowedStatus: !this.state.addAlbumDialogShowedStatus
    })
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

        {/* 新建相册对话框 */}
        { this.state.addAlbumDialogShowedStatus && this.createAddAlbumDialog() }
      </div>
    );
  }
}
