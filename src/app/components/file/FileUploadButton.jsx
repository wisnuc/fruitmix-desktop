
import React from 'react'
import { FloatingActionButton, RaisedButton, Popover, Menu, MenuItem } from 'material-ui'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'

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
            <MenuItem primaryText='上传文件夹' leftIcon={<FileFolder />}/>
            <MenuItem primaryText='上传文件' leftIcon={<EditorInsertDriveFile />}/>
          </Menu>          
        </Popover>
      </div>
    )
  }
}

export default FileUploadButton

