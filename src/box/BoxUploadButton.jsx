import React from 'react'
import i18n from 'i18n'
import { FloatingActionButton, Popover, Menu, MenuItem } from 'material-ui'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import { FromPC, FromMedia, FromFiles } from '../common/Svg'

class BoxUploadButton extends React.Component {
  constructor (props) {
    super(props)
    this.state = { open: false }

    this.upload = (view) => {
      if (view) {
        this.setState({ open: false }, () => this.props.toggleView(view))
      } else {
        const type = 'list'
        const comment = ''
        this.props.localUpload({ type, comment, box: this.props.box })
        this.setState({ open: false })
      }
    }

    this.openPopover = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (!window.navigator.onLine) this.props.openSnackBar(i18n.__('Offline Text'))
      else this.setState({ open: true, anchorEl: e.currentTarget })
    }
  }

  render () {
    // console.log('BoxUploadButton.jsx', this.props)
    const { offline, diffStation } = this.props
    const noNas = offline || diffStation
    return (
      <div style={{ position: 'absolute', right: 48, bottom: 48, zIndex: 1000 }}>
        <FloatingActionButton
          backgroundColor="#2196F3"
          zDepth={3}
          onTouchTap={this.openPopover}
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
              leftIcon={<FromPC color={offline ? 'rgba(0,0,0,.18)' : 'rgba(0,0,0,.54)'} />}
              disabled={offline}
              onTouchTap={() => this.upload()}
              style={{ fontSize: 13 }}
            />
            <MenuItem
              primaryText={i18n.__('Upload NAS Files')}
              leftIcon={<FromFiles color={noNas ? 'rgba(0,0,0,.18)' : 'rgba(0,0,0,.54)'} />}
              disabled={noNas}
              onTouchTap={() => this.upload('file')}
              style={{ fontSize: 13 }}
            />
            <MenuItem
              primaryText={i18n.__('Upload NAS Media')}
              leftIcon={<FromMedia color={noNas ? 'rgba(0,0,0,.18)' : 'rgba(0,0,0,.54)'} />}
              disabled={noNas}
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
