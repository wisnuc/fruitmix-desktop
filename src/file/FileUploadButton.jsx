import React from 'react'
import { FloatingActionButton, RaisedButton, Popover, Menu, MenuItem } from 'material-ui'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import { UploadFile, UploadFold } from '../common/Svg'

class FileUploadButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = { open: false }

    this.upload = (type) => {
      this.props.upload(type)
      this.setState({ open: false })
    }
  }

  render() {
    return (
      <div style={{ position: 'absolute', top: -36, left: 24, zIndex: 1000 }}>
        <FloatingActionButton
          backgroundColor="#2196F3"
          zDepth={3}
          onTouchTap={(e) => {
            e.preventDefault()
            this.setState({ open: true, anchorEl: e.currentTarget })
          }}
        >
          <FileFileUpload />
        </FloatingActionButton>
        <Popover
          open={this.state.open}
          animated
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={() => this.setState({ open: false })}
        >
          <Menu style={{ minWidth: 240 }}>
            <MenuItem
              primaryText="上传文件夹"
              leftIcon={<UploadFold />}
              onTouchTap={() => this.upload('directory')}
              style={{ fontSize: 13 }}
            />
            <MenuItem
              primaryText="上传文件"
              leftIcon={<UploadFile />}
              onTouchTap={() => this.upload('file')}
              style={{ fontSize: 13 }}
            />
          </Menu>
        </Popover>
      </div>
    )
  }
}

export default FileUploadButton

