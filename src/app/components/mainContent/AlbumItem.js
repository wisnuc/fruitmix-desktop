/**
  相册项
**/

import React, { Component, PropTypes } from 'react';
import Action from '../../actions/action';

function getStyles () {
  return {
    root: {
      backgroundColor: '#fff',
      boxShadow: '0 1px 0 #b0b0b0',
      borderRadius: 2,
      color: '#757575',
      fontSize: 12,
      height: 290,
      lineHeight: 1,
      margin: '0 5px 10px',
      width: 210
    },
    figureContainer: {
      height: 210
    },
    figure: {
      objectFit: 'cover'
    },
    inner: {
      padding: '0 20px'
    },
    caption: {
      color: '#212121',
      fontSize: 14,
      padding: '10px 0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    describe: {
      margin: 0,
      minHeight: 12,
      paddingBottom: 5,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    tail: {
      borderTop: '1px solid #e0e0e0',
      lineHeight: '30px'
    }
  }
}

export default class AlbumItem extends Component {
  toDate(timestamp) {
    const date = new Date();
    date.setTime(timestamp);

    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
  }

  getUserName(uuid) {
    const { login: { obj: { users } } } = this.props;
    let index = users.findIndex(user => user.uuid === uuid)
    if (index != -1) {
      return users[index].username
    }else {
      return null
    }

  }

  viewAlbumListHandle() {
    const { dispatch, info: { digest, doc: { album: { title = '武夷山' } } } } = this.props;

    dispatch(Action.changeSelectedNavItem('相册查看'));
    dispatch(Action.toggleNavigator([ '相册', title ]));
    dispatch(Action.getAlbumHash(digest));
  }

  render() {
    const {
      root,
      figureContainer,
      figure,
      inner,
      caption,
      describe,
      tail
    } = getStyles();

    const { info: { doc: { ctime, contents, author, album } } } = this.props;

    return (
      <div className="album-item fl" style={ root } onClick={ this.viewAlbumListHandle.bind(this) }>
        <div className="album-item-figure" style={ figureContainer }>
          <img src={ contents.length ? contents[0].path : '' } style={ figure } width="100%" height="100%" />
        </div>
        <div className="album-item-inner" style={ inner }>
          <div className="caption" style={ caption }>
          { album ? album.title : '武夷山' } * { contents.length }张
          </div>
          <p className="describe" style={ describe }>
            { album ? album.text : '这是相册的描述' }
          </p>
          <div className="clearfix" style={ tail }>
            <label className="fl" style={{ width: '50%', textAlign: 'left' }}>{ this.toDate(ctime) }</label>
            <label className="fr" style={{ width: '50%', textAlign: 'right' }}>{ this.getUserName(author) }</label>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    ipc.send('getAlbumThumb', this.props.info.doc.contents[0], this.props.info.digest);
  }
}

AlbumItem.propTypes = {
  /**
    相册信息
  **/
  info: PropTypes.object.isRequired
};
