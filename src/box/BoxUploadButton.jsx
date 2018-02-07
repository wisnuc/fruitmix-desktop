import React from 'react'
import i18n from 'i18n'
import { FloatingActionButton, RaisedButton, Popover, Menu, MenuItem } from 'material-ui'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import { UploadFile, UploadFold } from '../common/Svg'

class BoxUploadButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = { open: false }

    this.upload = (view) => {
      if (view) {
        this.setState({ open: false }, () => this.props.toggleView(view))
      } else {
        const type = 'list'
        const comment = '不知疲倦的翻越， 每一座山丘'
        const boxUUID = this.props.box.uuid
        const stationId = this.props.box.stationId
        this.props.localUpload({ type, comment, boxUUID, stationId })
        this.setState({ open: false })
      }
    }
  }

  render() {
    return (
      <div style={{ position: 'absolute', right: 48, bottom: 48, zIndex: 1000 }}>
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
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          onRequestClose={() => this.setState({ open: false })}
        >
          <Menu style={{ minWidth: 240 }}>
            <MenuItem
              primaryText={i18n.__('Upload Local Files')}
              leftIcon={<UploadFold />}
              onTouchTap={() => this.upload()}
              style={{ fontSize: 13 }}
            />
            <MenuItem
              primaryText={i18n.__('Upload NAS Files')}
              leftIcon={<UploadFile />}
              onTouchTap={() => this.upload('file')}
              style={{ fontSize: 13 }}
            />
            <MenuItem
              primaryText={i18n.__('Upload NAS Media')}
              leftIcon={<UploadFile />}
              onTouchTap={() => this.upload('media')}
              style={{ fontSize: 13 }}
            />
          </Menu>
        </Popover>
      </div>
    )
  }
}

export default BoxUploadButton
