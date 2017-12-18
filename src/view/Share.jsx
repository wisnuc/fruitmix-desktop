import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { IconButton, Divider, CircularProgress } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh'
import ListIcon from 'material-ui/svg-icons/action/list'
import GridIcon from 'material-ui/svg-icons/action/view-module'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import InfoIcon from 'material-ui/svg-icons/action/info'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import CopyIcon from 'material-ui/svg-icons/content/content-copy'
import MoveIcon from 'material-ui/svg-icons/content/forward'
import ShareIcon from 'material-ui/svg-icons/social/person-add'
import EditIcon from 'material-ui/svg-icons/editor/border-color'

import Home from './Home'
import FileDetail from '../file/FileDetail'
import ListSelect from '../file/ListSelect'
import MoveDialog from '../file/MoveDialog'
import FileContent from '../file/FileContent'
import RenameDialog from '../file/RenameDialog'
import NewFolderDialog from '../file/NewFolderDialog'
import FileUploadButton from '../file/FileUploadButton'
import ContextMenu from '../common/ContextMenu'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'
import MenuItem from '../common/MenuItem'
import sortByType from '../common/sort'
import { BreadCrumbItem, BreadCrumbSeparator } from '../common/BreadCrumb'
import { UploadFile, UploadFold } from '../common/Svg'

const debug = Debug('component:viewModel:Share: ')

class Share extends Home {
  constructor(ctx) {
    super(ctx)

    this.title = i18n.__('Share Title')
  }

  navEnter(target) {
    this.isNavEnter = true
    const apis = this.ctx.props.apis
    if (!apis || !apis.drives || !apis.drives.data) return
    if (target && target.driveUUID) { // jump to specific dir
      const { driveUUID, dirUUID } = target
      apis.request('listNavDir', { driveUUID, dirUUID })
      this.setState({ loading: true })
    } else {
      const drive = apis.drives.data.find(d => d.tag === 'built-in')
      apis.request('listNavDir', { driveUUID: drive.uuid, dirUUID: drive.uuid })
    }
  }

  navGroup() {
    return 'public'
  }

  menuName() {
    return i18n.__('Share Menu Name')
  }

  menuIcon() {
    return FileFolder
  }
}

export default Share
