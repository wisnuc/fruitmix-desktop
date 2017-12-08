import React from 'react'
import i18n from 'i18n'
import Radium from 'radium'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { Avatar, Divider, MenuItem } from 'material-ui'
import HardwareDeveloperBoard from 'material-ui/svg-icons/hardware/developer-board'
import FileFolder from 'material-ui/svg-icons/file/folder'

import Base from './Base'
import FileContent from '../file/FileContent'
import ListSelect from '../file/ListSelect'
import MoveDialog from '../file/MoveDialog'
import FileDetail from '../file/FileDetail'
import { BreadCrumbItem, BreadCrumbSeparator } from '../common/BreadCrumb'
import ContextMenu from '../common/ContextMenu'
import DialogOverlay from '../common/DialogOverlay'
import { HDDIcon } from '../common/Svg'

const debug = Debug('component:view:Physical:')

class Physical extends Base {
  constructor(ctx) {
    super(ctx)
  }

  menuName() {
    return i18n.__('Physical Menu Name')
  }

  quickName() {
    return i18n.__('Physical Quick Name')
  }

  menuIcon() {
    return HardwareDeveloperBoard
  }

  appBarStyle() {
    return 'colored'
  }

  prominent() {
    return true
  }

  hasDetail() {
    return true
  }

  detailEnabled() {
    return true
  }

  renderContent() {
    return (
      <div style={{ width: '100%', height: '100%' }} />
    )
  }
}

export default Physical
