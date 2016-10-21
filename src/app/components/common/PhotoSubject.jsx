// 照片主题

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { replaceTemplate } from '../../React-Redux-UI/src/utils/stringDeal';

function getStyles () {
  return {
    rootStyle: {
      backgroundColor: '#fff',
      color: '#212121',
      lineHeight: '36px'
    },

    userCaptionStyle: {
      fontSize: 14
    },

    userIconStyle: {
      borderRadius: '100%',
      color: '#fff',
      display: 'inline-block',
      marginRight: 10,
      lineHeight: '36px',
      height: 36,
      textAlign: 'center',
      width: 36
    },

    timeStyle: {
      color: '#999',
      fontSize: 12
    }
  };
}

class PhotoSubject extends Component {
  createUserCaption() {
    const { username, backgroundColor } = this.getUserInfo()
    let { userCaptionStyle, userIconStyle } = getStyles();

    userIconStyle = Object.assign({}, userIconStyle, { backgroundColor });

    return (
      <div className="fl" style={ userCaptionStyle }>
        <div style={ userIconStyle }>{ username.charAt(0).toUpperCase() }</div>
        <span>{ username }</span>
      </div>
    );
  }

  createTimeBar() {
    const { timeStyle } = getStyles();

    return (
      <div className="fr" style={ timeStyle }>{ this.formatRelativeDatetime() }</div>
    );
  }

  getUserInfo() {
    const { users, author } = this.props;
    const user = users.find(usr => usr.uuid === author);

    return user ? { username: user.username, backgroundColor: user.color } : {};
  }

  getCurrentDaySection() {
    const { ctime } = this.props;
    const currentTimestamp = Date.now();
    const hourToTimestamp = 3600000;
    const diffTimestamp = Math.abs(currentTimestamp - ctime);

    return {
      ctime,
      currentTimestamp,
      isMinute: diffTimestamp <= hourToTimestamp,
      isHour: diffTimestamp <= hourToTimestamp * 5,
      isDay: diffTimestamp <= hourToTimestamp * 24
    };
  }

  formatRelativeDatetime() {
    const mapRelativeToText = {
      isMinute: '${minute}分钟前',
      isHour: '${hour}小时前',
      isDay: '${year}-${month}-${day}'
    };

    const currentDaySection = this.getCurrentDaySection();
    const { ctime, currentTimestamp } = currentDaySection;
    const conditi = Object.keys(currentDaySection).find(key => key !== 'ctime' && key !== 'currentTimestamp' && !!currentDaySection[key]);

    if (conditi) {
      const mapDatetime = {};

      if (conditi === 'isDay') {
        const tempDate = new Date;
        tempDate.setTime(currentTimestamp);
        mapDatetime.year = tempDate.getFullYear();
        mapDatetime.month = tempDate.getMonth() + 1;
        mapDatetime.day = tempDate.getDate();
      } else if (conditi === 'isMinute') {
        mapDatetime.minute = Math.floor((currentTimestamp - ctime) / 60000);
      } else {
        mapDatetime.hour = Math.floor((currentTimestamp - ctime) / 3600000);
      }

      return replaceTemplate(mapRelativeToText[conditi], mapDatetime);
    } else {
      const diffTimestamp = currentTimestamp - ctime;
      const diffDay = Math.abs(diffTimestamp / (24 * 3600000));

      if (diffDay <= 30) {
        return Math.floor(diffDay) + '天前'
      } else if(diffDay > 30 && diffDay <= 335) {
        return Math.floor(diffDay / 30) + '月前';
      } else {
        return Math.floor(diffDay / 30) + '年前';
      }
    }
  }

  render() {
    const { rootStyle } = getStyles();

    return (
      <div className="photo-subject clearfix" style={ rootStyle }>
        {/* 用户信息 */}
        { this.createUserCaption() }
        {/* 分享时间 */}
        { this.createTimeBar() }
      </div>
    );
  }
}

PhotoSubject.propTypes = {
  author: PropTypes.string.isRequired,
  ctime: PropTypes.number
};

const mapStateToProps = ({
  login: { obj: { users } }
}) => ({ users });

export default connect(mapStateToProps)(PhotoSubject);
