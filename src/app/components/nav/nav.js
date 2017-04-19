import React from 'react'

import FileFolder from 'material-ui/svg-icons/file/folder'
import FileFolderShared from 'material-ui/svg-icons/file/folder-shared'
import SocialPeople from 'material-ui/svg-icons/social/people'
import SocialShare from 'material-ui/svg-icons/social/share'
import DeviceStorage from 'material-ui/svg-icons/device/storage'
import FileCloudUpload from 'material-ui/svg-icons/file/cloud-upload'
import FileCloudDownload from 'material-ui/svg-icons/file/cloud-download'
import ActionSwapHoriz from 'material-ui/svg-icons/action/swap-horiz'
import ActionDashboard from 'material-ui/svg-icons/action/dashboard'
import ActionExtension from 'material-ui/svg-icons/action/extension'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'

import FileTitle from '../file/FileTitle'
import FileToolBar from '../file/FileToolBar'
import FileContent from '../file/FileContent'
import FileDetail from '../file/FileDetail'

export const navMap = new Map([
  ['HOME_DRIVE', {
    text: '我的文件',
    icon: FileFolder,
    prominent: () => true,
    title: FileTitle, 
    toolbar: FileToolBar,
    content: FileContent,
    detail: FileDetail
  }],
  ['PUBLIC_DRIVES', {
    text: '公共文件',
    icon: FileFolderShared,
    prominent: () => true,
    toolbar: FileToolBar,
    content: FileContent,
    detail: FileDetail,
  }],
  ['FSHARED_WITH_ME', {
    text: '分享给我',
    icon: SocialPeople
  }],
  ['FSHARED_WITH_OTHERS', {
    text: '我的分享',
    icon: SocialShare,
  }],
  ['EXT_DRIVES', {
    text: '全部磁盘',
    icon: DeviceStorage,
  }],
  ['UPLOADING', {
    text: '正在上传',
    icon: FileCloudUpload,
  }],
  ['DOWNLOADING', {
    text: '正在下载',
    icon: FileCloudDownload,
  }],
  ['COPY_MOVE', {
    text: '复制移动',
    icon: ActionSwapHoriz,
  }],
  ['MEDIA', {
    text: '照片',
    icon: FileFolder,
  }],
  ['MEDIA_ALBUM', {
    text: '相册',
    icon: FileFolderShared,
  }],
  ['MEDIA_SHARE', {
    text: '分享',
    icon: SocialShare,
  }],
  ['APP_MARKET', {
    text: '应用市场',
    icon: ActionDashboard
  }],
  ['INSTALLED_APPS', {
    text: '我的应用',
    icon: ActionExtension
  }],
  ['SETTINGS_APPS', {
    text: '设置',
    icon: ActionSettings
  }],
  ['LOGOUT', {
    text: '退出',
    icon: ActionExitToApp,
  }]
])

export const fileNavGroup = ['HOME_DRIVE', 'PUBLIC_DRIVES', 'FSHARED_WITH_ME', 
  'FSHARED_WITH_OTHERS', 'EXT_DRIVES', 'UPLOADING', 'DOWNLOADING', 'COPY_MOVE' ]

export const mediaNavGroup = ['MEDIA', 'MEDIA_ALBUM', 'MEDIA_SHARE']
export const appifiNavGroup = ['APP_MARKET', 'INSTALLED_APPS']

