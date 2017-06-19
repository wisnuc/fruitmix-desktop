import Debug from 'debug'
import React from 'react'
import EventListener from 'react-event-listener'
import { FloatingActionButton, Paper, Menu, MenuItem, Divider, IconButton, CircularProgress } from 'material-ui'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import DeviceStorage from 'material-ui/svg-icons/device/storage'
import { formatDate } from '../common/datetime'

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

        {/* Media Upload */}
        {/*
          this.props.media ?
            <div style={{ position: 'absolute', right: 96, bottom: 48 }}>
              <FloatingActionButton
                backgroundColor="#2196F3"
                zDepth={3}
                onTouchTap={() => {}}
              >
                <FileFileUpload />
              </FloatingActionButton>
            </div> : <div />
        */}
      </div>
    )
  }
}

export default PhotoApp
