import React from 'react'
import i18n from 'i18n'
import EventListener from 'react-event-listener'
import { IconButton, CircularProgress, Divider } from 'material-ui'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
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

class AssistantApp extends PhotoApp {
  render () {
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
              <div style={{ color: 'rgba(0,0,0,0.87)' }}> { i18n.__('Hide Photo Title') }</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.54)' }}>
                  { i18n.__('Hide Photo Amount Text %s', this.props.media ? this.props.media.length : 0) }
                </div>
                <div style={{ flex: '0 0 48px' }} />
                <FlatButton
                  label={this.state.showPhotos ? i18n.__('Hide') : i18n.__('Show')}
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
            !this.props.media
              ? (
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
                </div>
              )
              : this.props.media.length
                ? (
                  <PhotoList
                    media={this.props.media}
                    lookPhotoDetail={this.lookPhotoDetail}
                    ipcRenderer={this.props.ipcRenderer}
                    addListToSelection={this.props.addListToSelection}
                    removeListToSelection={this.props.removeListToSelection}
                    memoize={this.props.memoize}
                    selectedItems={this.props.selectedItems}
                    getHoverPhoto={this.props.getHoverPhoto}
                    shiftStatus={this.props.shiftStatus}
                    headerHeight={186}
                  />
                )
                : (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    { i18n.__('No Media Text 1') }
                  </div>
                )
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
          apis={this.props.apis}
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
                alignItems: 'center',
                zIndex: 200
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
                { i18n.__('%s Photo Selected', this.props.selectedItems.length) }
              </div>
              <div style={{ flexGrow: 1 }} />

              <IconButton onTouchTap={this.props.startDownload} tooltip={i18n.__('Download')}>
                <DownloadIcon color="#FFF" />
              </IconButton>

              {/*
              <IconButton onTouchTap={() => this.toggleDialog('deleteDialog')}>
                <DeleteIcon color="#FFF" />
              </IconButton>
              */}

              <IconButton onTouchTap={() => this.toggleDialog('hideDialog')} tooltip={i18n.__('Retrieve')}>
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
                    { i18n.__('Delete Photo Dialog Text 1') }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { i18n.__('Delete Photo Dialog Text 2') }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label={i18n.__('Cancel')} primary onTouchTap={() => this.toggleDialog('deleteDialog')} keyboardFocused />
                    <FlatButton
                      label={i18n.__('Remove')}
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
                    { i18n.__('Retrieve Photo Dialog Text 1') }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { i18n.__('Retrieve Photo Dialog Text 2') }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label={i18n.__('Cancel')} primary onTouchTap={() => this.toggleDialog('hideDialog')} keyboardFocused />
                    <FlatButton
                      label={i18n.__('Retrieve')}
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
