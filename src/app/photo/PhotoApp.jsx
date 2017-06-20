import Debug from 'debug'
import React from 'react'
import EventListener from 'react-event-listener'
import { Paper, Menu, MenuItem, Divider, IconButton, CircularProgress } from 'material-ui'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import DeviceStorage from 'material-ui/svg-icons/device/storage'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import { formatDate } from '../common/datetime'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'

import PhotoDetail from './PhotoDetail'
import PhotoList from './PhotoList'

const debug = Debug('component:photoApp:')
const findPath = (items, path) => items.findIndex(item => item === path)

class PhotoApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      openDetail: false
    }

    this.seqIndex = ''

    this.lookPhotoDetail = (digest) => {
      this.seqIndex = this.props.media.findIndex(item => item[0] === digest)
      this.setState({ openDetail: true })
    }

    this.handleResize = () => {
      this.forceUpdate()
    }

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })
  }

  render() {
    // debug('PhotoApp, this.props', this.props)
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <EventListener target="window" onResize={this.handleResize} />

        {/* PhotoList */}
        {
          !this.props.media ?
            <div
              style={{
                position: 'relative',
                marginTop: -7,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CircularProgress />
            </div> :
            this.props.media.length ?
              <PhotoList
                style={{
                  position: 'relative',
                  marginTop: -7,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                setPhotoInfo={this.props.setPhotoInfo}
                media={this.props.media}
                lookPhotoDetail={this.lookPhotoDetail}
                getTimeline={this.props.getTimeline}
                ipcRenderer={this.props.ipcRenderer}
                addListToSelection={this.props.addListToSelection}
                removeListToSelection={this.props.removeListToSelection}
                memoize={this.props.memoize}
                selectedItems={this.props.selectedItems}
              /> :
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >没有照片！</div>
        }

        {/* PhotoDetail */}
        <PhotoDetail
          onRequestClose={() => this.setState({ openDetail: false })}
          open={this.state.openDetail}
          style={{ position: 'fixed', left: 0, top: 0, width: '100%', height: '100%' }}
          items={this.props.media}
          seqIndex={this.seqIndex}
          ipcRenderer={this.props.ipcRenderer}
          setAnimation={this.props.setAnimation}
          memoize={this.props.memoize}
        />

        {/* Selected Header */}
        {
          !!this.props.selectedItems.length &&
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: 64,
                backgroundColor: this.props.primaryColor,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <IconButton onTouchTap={this.props.clearSelect} style={{ marginLeft: 12 }} >
                <CloseIcon color="#FFF" />
              </IconButton>
              <div style={{ width: 12 }} />
              <div style={{ color: '#FFF', fontSize: 20, fontWeight: 500 }} >
                { `选择了 ${this.props.selectedItems.length} 张照片` }
              </div>
              <div style={{ flexGrow: 1 }} />

              <IconButton onTouchTap={this.props.startDownload}>
                <DownloadIcon color="#FFF" />
              </IconButton>

              <IconButton onTouchTap={() => this.toggleDialog('deleteDialog')}>
                <DeleteIcon color="#FFF" />
              </IconButton>

              <IconButton onTouchTap={this.props.clearSelect}>
                <VisibilityOff color="#FFF" />
              </IconButton>
              <div style={{ width: 24 }} />

            </div>
        }

        {/* dialog */}
        <DialogOverlay open={!!this.state.deleteDialog}>
          <div>
            {
              this.state.deleteDialog &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { '要将照片移动到回收站吗？' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { '内容被移到回收站后，文件中的相应内容也会被移除。' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('deleteDialog')} keyboardFocused />
                    <FlatButton
                      label="移除"
                      primary
                      onTouchTap={() => {
                        this.toggleDialog('deleteDialog')
                        this.props.removeMedia()
                      }}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>
        {/* Media Upload */}
      </div>
    )
  }
}

export default PhotoApp
