
import React from 'react'
import { FloatingActionButton, RaisedButton, Popover, Menu, MenuItem } from 'material-ui'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import { command } from '../../lib/command'

class FileUploadButton extends React.Component {

  constructor(props) {
    super(props)
    this.state = { open: false }
  }

  render() {

    return (
      <div style={{position: 'absolute', right:48, bottom:48}}>
        <FloatingActionButton 
          backgroundColor='#2196F3'
          zDepth={3}
          onTouchTap={e => {
            e.preventDefault()
            this.setState({ open: true, anchorEl: e.currentTarget })
          }}
        >
          <FileFileUpload />
        </FloatingActionButton>
        <Popover 
          open={this.state.open}
          animated={true}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          onRequestClose={() => this.setState({ open: false })} 
        >
          <Menu>
            <MenuItem primaryText='上传文件夹' leftIcon={<FileFolder />} onTouchTap={this.upload.bind(this, 'UPLOAD_FOLDER')}/>
            <MenuItem primaryText='上传文件' leftIcon={<EditorInsertDriveFile />} onTouchTap={this.upload.bind(this, 'UPLOAD_FILE')}/>
          </Menu>          
        </Popover>
      </div>
    )
  }

  upload(cm) {
    let path = this.props.path
    if (!path.length) return
    let folderUUID = path[path.length - 1].uuid
    let type = cm=='UPLOAD_FOLDER'?'folder':'file'
    command('fileapp', cm, {folderUUID:folderUUID,type:type})
    this.setState({
      open : false
    })
  }
}

export default FileUploadButton

