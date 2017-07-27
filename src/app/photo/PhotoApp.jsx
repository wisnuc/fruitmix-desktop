import Debug from 'debug'
import React from 'react'
import EventListener from 'react-event-listener'
import { TweenMax } from 'gsap'
import { IconButton, CircularProgress } from 'material-ui'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import UploadIcon from 'material-ui/svg-icons/file/cloud-upload'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'

import PhotoDetail from './PhotoDetail'
import PhotoList from './PhotoList'

const debug = Debug('component:photoApp:')

class PhotoApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      openDetail: false,
      shift: '',
      deleteDialog: false,
      hideDialog: false
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

    this.setAnimation2 = (component, status) => {
      if (component === 'ClearSelected') {
        /* add animation to ClearSelected */
        const transformItem = this.refClearSelected
        const time = 0.4
        const ease = global.Power4.easeOut
        if (status === 'In') {
          TweenMax.to(transformItem, time, { rotation: 180, opacity: 1, ease })
        }
        if (status === 'Out') {
          TweenMax.to(transformItem, time, { rotation: -180, opacity: 0, ease })
        }
      }
    }

    this.keyChange = (event) => {
      this.props.getShiftStatus(event)
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyChange)
    document.addEventListener('keyup', this.keyChange)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyChange)
    document.removeEventListener('keyup', this.keyChange)
  }

  renderNoMedia() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#FAFAFA'
          }}
        >
          {/* <UploadIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} /> */}
          <div style={{ fontSize: 24, color: 'rgba(0,0,0,0.27)', height: 56 }}> { '没有照片或视频' } </div>
          <div style={{ color: 'rgba(0,0,0,0.27)' }}> { '请点击上传按钮' } </div>
        </div>
      </div>
    )
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
                getHoverPhoto={this.props.getHoverPhoto}
                shiftStatus={this.props.shiftStatus}
                headerHeight={66}
              /> :
              this.renderNoMedia()
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
          setAnimation2={this.setAnimation2}
          memoize={this.props.memoize}
          selectedItems={this.props.selectedItems}
          addListToSelection={this.props.addListToSelection}
          removeListToSelection={this.props.removeListToSelection}
          hideMedia={this.props.hideMedia}
          removeMedia={this.props.removeMedia}
          startDownload={this.props.startDownload}
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
              <div style={{ width: 12 }} />
              <div ref={ref => (this.refClearSelected = ref)}>
                <IconButton onTouchTap={this.props.clearSelect}>
                  <CloseIcon color="#FFF" />
                </IconButton>
              </div>
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

              <IconButton onTouchTap={() => this.toggleDialog('hideDialog')}>
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

        {/* dialog */}
        <DialogOverlay open={!!this.state.hideDialog}>
          <div>
            {
              this.state.hideDialog &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { '要将照片隐藏吗？' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { '内容被隐藏后，我的照片内将不显示，可在智能助理中恢复。' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('hideDialog')} keyboardFocused />
                    <FlatButton
                      label="隐藏"
                      primary
                      onTouchTap={() => {
                        this.toggleDialog('hideDialog')
                        this.props.hideMedia()
                      }}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>
      </div>
    )
  }
}

export default PhotoApp
