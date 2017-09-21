import Debug from 'debug'
import React from 'react'
import EventListener from 'react-event-listener'
import { TweenMax } from 'gsap'
import { IconButton, CircularProgress, Divider } from 'material-ui'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import Visibility from 'material-ui/svg-icons/action/visibility'
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import DownIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-down'
import UpIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'

import PhotoApp from './PhotoApp'
import DetailContainer from './DetailContainer'
import PhotoList from './PhotoList'

const debug = Debug('component:AssistantApp:')

class AssistantApp extends PhotoApp {
  constructor(props) {
    super(props)
  }

  render() {
    // debug('PhotoApp, this.props', this.props)
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <EventListener target="window" onResize={this.handleResize} />

        <div style={{ height: 16 }} />
        <div style={{ width: '100%' }}>
          <div style={{ height: 72, display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ flex: '0 0 24px' }} />
            <div style={{ flex: '0 0 56px' }} >
              <VisibilityOff color={this.props.primaryColor} />
            </div>
            <div style={{ flex: '0 0 540px' }}>
              <div style={{ color: 'rgba(0,0,0,0.87)' }}> 隐藏的照片 </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.54)' }}> { `数量: ${this.props.media.length}` }</div>
                <div style={{ flex: '0 0 48px' }} />
                <FlatButton
                  label="查看"
                  labelPosition="before"
                  disabled={!!this.props.selectedItems.length}
                  primary
                  icon={
                    this.state.showPhotos
                      ? <DownIcon color={!this.props.selectedItems.length ? this.props.primaryColor : 'rgba(0,0,0,0.54)'} />
                      : <UpIcon color={this.props.primaryColor} />
                  }
                  onTouchTap={() => this.toggleDialog('showPhotos')}
                />
              </div>
            </div>
            <div style={{ flexGrow: 1 }} />
          </div>
          <div style={{ height: 16 }} />
          <Divider style={{ width: 760, marginLeft: 80 }} />
          <div style={{ height: 16 }} />
        </div>

        {/* PhotoList */}
        <div style={{ height: 'calc(100% - 120px)', marginLeft: 80, display: this.state.showPhotos ? '' : 'none' }}>
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
                headerHeight={186}
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
        </div>

        {/* PhotoDetail */}
        <DetailContainer
          type="hidden"
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

              <IconButton onTouchTap={this.props.startDownload} tooltip="下载">
                <DownloadIcon color="#FFF" />
              </IconButton>

              {/*
              <IconButton onTouchTap={() => this.toggleDialog('deleteDialog')}>
                <DeleteIcon color="#FFF" />
              </IconButton>
              */}

              <IconButton onTouchTap={() => this.toggleDialog('hideDialog')} tooltip="恢复">
                <Visibility color="#FFF" />
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
                    { '要将照片恢复显示吗？' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { '恢复后，这些照片将在我的照片内显示' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('hideDialog')} keyboardFocused />
                    <FlatButton
                      label="恢复"
                      primary
                      onTouchTap={() => {
                        this.toggleDialog('hideDialog')
                        this.props.hideMedia(true)
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

export default AssistantApp
