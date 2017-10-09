import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { IconButton, MenuItem } from 'material-ui'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'

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
import { BreadCrumbItem, BreadCrumbSeparator } from '../common/BreadCrumb'

const debug = Debug('component:viewModel:Home: ')

class Trash extends Home {
  constructor(ctx) {
    super(ctx)
  }

  willReceiveProps(nextProps) {
    if (!nextProps.apis || !nextProps.apis.listNavDir) return
    const listNavDir = nextProps.apis.listNavDir
    if (listNavDir.isPending() || listNavDir.isRejected()) return
    this.updateState(listNavDir.value())
  }

  navGroup() {
    return 'trash'
  }

  menuName() {
    return '回收站'
  }

  menuIcon() {
    return DeleteIcon
  }

  quickName() {
    return '回收站'
  }

  quickIcon() {
    return DeleteIcon
  }

  /* renderers */
  renderTitle({ style }) {
    return (
      <div style={Object.assign({}, style, { marginLeft: '176px' })}>
        回收站
      </div>
    )
  }

  renderToolBar({ style }) {
    return (
      <div style={style} />
    )
  }

  renderContent({ toggleDetail, openSnackBar }) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FileContent
          home={this.state}
          select={this.state.select}
          entries={this.state.entries}
          listNavBySelect={this.listNavBySelect}
          showContextMenu={this.showContextMenu}
        />

        <ContextMenu
          open={this.state.contextMenuOpen}
          top={this.state.contextMenuY}
          left={this.state.contextMenuX}
          onRequestClose={this.hideContextMenu}
        >
          <MenuItem primaryText="详细信息" onTouchTap={toggleDetail} />
          <MenuItem primaryText="还原" onTouchTap={toggleDetail} />
          <MenuItem primaryText="永久刪除" onTouchTap={() => this.toggleDialog('delete')} />
        </ContextMenu>

        <DialogOverlay open={this.state.delete}>
          {
            this.state.delete &&
            <div style={{ width: 280, padding: '24px 24px 0px 24px' }}>
              <div style={{ color: 'rgba(0,0,0,0.54)' }}>确定删除？</div>
              <div style={{ height: 24 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('delete')} />
                <FlatButton
                  label="确认"
                  primary
                  onTouchTap={this.delete}
                />
              </div>
            </div>

          }
        </DialogOverlay>
      </div>
    )
  }
}

export default Trash
