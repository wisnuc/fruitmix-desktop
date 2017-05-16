
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
      <div style={{position: 'absolute', top: -36, left: 24}}>
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
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={() => this.setState({ open: false })} 
        >
          <Menu>
            <MenuItem primaryText='上传文件夹' leftIcon={<FileFolder />} onTouchTap={this.upload.bind(this, 'folder')}/>
            <MenuItem primaryText='上传文件' leftIcon={<EditorInsertDriveFile />} onTouchTap={this.upload.bind(this, 'file')}/>
          </Menu>          
        </Popover>
      </div>
    )
  }

  upload(type) {
    this.props.upload(type)
    this.setState({open: false})
  }
}

export default FileUploadButton

