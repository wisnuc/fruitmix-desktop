// AlbumOrPhotoShare

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Action from '../../actions/action';

import NavigationBar from '../main/NavigationBar';
import PhotoSubject from '../common/PhotoSubject';
import PhotoMain from '../common/PhotoMain';

function getStyles() {
  return {
    rootStyle: {
      paddingTop: 52
    },
    shareItemStyle: {
      borderRadius: 4,
      margin: '0 auto 10px',
      width: 690
    },
    shareItemSubjectStyle: {
      padding: '10px 20px',
      backgroundColor: '#fff'
    },
    shareItemMainStyle: {
      backgroundColor: '#fff',
      maxHeight: 458,
      overflow: 'hidden'
    },
    shareItemEndManyPhotoStyle: {
      backgroundColor: '#fff',
      fontSize: 12,
      lineHeight: '30px',
      textAlign: 'right',
      padding: '0 20px',
      color: '#666'
    },
    shareItemEndSinglePhotoStyle: {
      backgroundColor: '#fff',
      padding: '0 20px'
    },
    caption: {
      color: '#212121',
      fontSize: 14,
      padding: '10px 0'
    },
    describe: {
      color: '#757575',
      margin: 0,
      minHeight: 12,
      fontSize: 12,
      paddingBottom: 5,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    tail: {
      borderTop: '1px solid #e0e0e0',
      color: '#757575',
      fontSize: 12,
      lineHeight: '30px'
    }
  }
}

class AlbumOrPhotoShare extends Component {
  createPhotoSubject(author, ctime) {
    return (
      <PhotoSubject
        author={ author }
        ctime={ ctime }>
      </PhotoSubject>
    );
  }

  createPhotoMain(media) {
    // 如果存在album那么就是相册
    const { doc: { album, contents } } = media;
    const isAlbum = !!album;
    const isSinglePhoto = contents.length === 1;

    return (
      <PhotoMain
        dispatch={ this.props.dispatch }
        isSingle={ isAlbum || isSinglePhoto }
        albumDigest={ media.digest }
        photoList={ contents.slice(0, 6) }>
      </PhotoMain>
    )
  }

  createNavigationBar() {
    const { navigationBarTitleTexts, dispatch } = this.props;

    return (
      <NavigationBar
        dispatch={ dispatch }
        navigationBarTitleTexts={ navigationBarTitleTexts }
        navigationBarHorizontalPadding={ 18 }>
      </NavigationBar>
    );
  }

  viewMoreHandle(digest) {
    const { dispatch } = this.props;
    dispatch(Action.changeSelectedNavItem('分享查看'));
    dispatch(Action.getAlbumHash(digest));
  }

  makePhotoEnd(media, digest) {
    const { doc: { album, contents, ctime, author } } = media;
    const {
      shareItemEndSinglePhotoStyle, shareItemEndManyPhotoStyle,
      caption, describe, tail
    } = getStyles();
    const isAlbum = !!album;
    const isManyChildPhoto = contents.length > 6;

    if (isManyChildPhoto) {
      return (
        <div style={ shareItemEndManyPhotoStyle } onClick={ this.viewMoreHandle.bind(this, digest) }>更多</div>
      );
    } else {
      if (isAlbum) {
        if (contents.length === 1) {
          return (
            <div style={ shareItemEndSinglePhotoStyle }>
              <div className="caption" style={ caption }>
              { album ? album.title : '' }
              </div>
              <p className="describe" style={ describe }>
                { album ? album.text : '' }
              </p>
              <div className="clearfix" style={ tail }>
                <label className="fl" style={{ width: '50%', textAlign: 'left' }}>{ this.toDate(ctime) }</label>
                <label className="fr" style={{ width: '50%', textAlign: 'right' }}>{ this.getUserName(author) }</label>
              </div>
            </div>
          );
        }
      }
    }
  }

  toDate(timestamp) {
    const date = new Date();
    date.setTime(timestamp);

    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
  }

  getUserName(uuid) {
    const { users } = this.props;

    let index = users.findIndex(user => user.uuid === uuid)
    if (index != -1) {
      return users[index].username
    }else {
      return null
    }
  }

  render() {
    const { rootStyle, shareItemStyle, shareItemSubjectStyle, shareItemMainStyle } = getStyles();
    const { mediaShare, uuid, navigationBarTitleTexts } = this.props;

    const photoComponents = mediaShare.map(media => {
      const { doc: { author, ctime } } = media;

      return (
        <div key={ media.digest } style={ shareItemStyle }>
          {/* PhotoSubject */}
          <div style={ shareItemSubjectStyle }>
            { this.createPhotoSubject(author, ctime) }
          </div>
          {/* PhotoMain */}
          <div style={ shareItemMainStyle }>
            { this.createPhotoMain(media) }
          </div>
          {/* PhotoEnd */}
          { this.makePhotoEnd(media, media.digest) }
        </div>
      );
    });

    return (
      <div style={ rootStyle }>
        { photoComponents }
        { this.createNavigationBar() }
      </div>
    );
  }
}

const mapStateToProps = ({ media: { mediaShare }, login: { obj: { uuid, users } }, navigationBarTitleTexts }) => ({
  mediaShare,
  uuid,
  users,
  navigationBarTitleTexts
});

export default connect(mapStateToProps)(AlbumOrPhotoShare);
