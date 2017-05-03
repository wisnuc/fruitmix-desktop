import Debug from 'debug'
import React from 'react'
import EventListener from 'react-event-listener'
import { FloatingActionButton, Paper, Menu, MenuItem, Divider, IconButton, CircularProgress } from 'material-ui'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import DeviceStorage from 'material-ui/svg-icons/device/storage'
import { formatDate } from '../../utils/datetime'

import Carousel from './Carousel'
import PhotoDetail from './PhotoDetail'
import PhotoList from './PhotoList'

const debug = Debug('component:photoApp:')
const findPath = (items, path) => items.findIndex(item => item === path)

class PhotoApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      openDetail: false,
      selectedItems: []
    }

    this.seqIndex = ''

    this.addListToSelection = (digest) => {
      debug('this.addListToSelection this.state.selectedItems', this.state.selectedItems)
      const hadDigest = this.state.selectedItems.findIndex(item => item === digest) >= 0
      if (!hadDigest) {
        this.setState(prevState => ({ selectedItems: [...prevState.selectedItems, digest]
        }))
      }
    }
    this.removeListToSelection = (digest) => {
      debug('this.removeListToSelection this.state.selectedItems', this.state.selectedItems)
      const hadDigest = this.state.selectedItems.findIndex(item => item === digest) >= 0
      if (hadDigest) {
        this.setState((prevState) => {
          const index = prevState.selectedItems.findIndex(item => item === digest)
          return {
            selectedItems: [
              ...prevState.selectedItems.slice(0, index),
              ...prevState.selectedItems.slice(index + 1)
            ]
          }
        })
      }
    }

    this.lookPhotoDetail = (digest) => {
      this.seqIndex = this.props.media.findIndex(item => item[0] === digest)
      this.setState({ openDetail: true })
    }

    this.creatAlbum = (items, title, text) => {
      /* maintainers, viewers, medias, album */
      debug('this.creatAlbum', this.props, items, title, text)
      const users = [this.props.apis.account.data.uuid]
      const contents = items.map(item => ({
        digest: item,
        creator: this.props.apis.account.data.uuid,
        ctime: Date.now()
      }))
      this.props.ipcRenderer.send('createMediaShare', users, users, items, { title, text })
      setTimeout(() => this.props.requestData('mediaShare'), 1000)
    }
  }

  /*
  shouldComponentUpdate(nextProps, nextState) {
    return (this.state !== nextState)
  }
  */

  handleResize = () => {
    this.forceUpdate()
  }

  render() {
    debug('PhotoApp, this.props', this.props)
    return (
      <Paper>
        <EventListener
          target="window"
          onResize={this.handleResize}
        />

        {/* 图片列表 */}
        {
          !this.props.media ?
            <div
              style={{
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'calc(100% - 72px)',
                height: 'calc(100% - 64px)'
              }}
            >
              <CircularProgress />
            </div> :
            this.props.media.length ?
              <PhotoList
                style={{
                  position: 'fixed',
                  width: 'calc(100% - 72px)',
                  height: 'calc(100% - 64px)',
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
                addListToSelection={this.addListToSelection}
                removeListToSelection={this.removeListToSelection}
              /> :
              <div
                style={{
                  position: 'fixed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'calc(100% - 72px)',
                  height: 'calc(100% - 64px)'
                }}
              >啥都没有啊！</div>
        }

        {/* 轮播 */}
        {
          this.state.selectedItems.length ?
            <Paper style={{ position: 'fixed', bottom: 15, width: '75%' }} >
              <Carousel
                ClearAll={() => this.setState({ selectedItems: [] })}
                removeListToSelection={this.removeListToSelection}
                style={{ backgroundColor: '#fff', height: 180, borderRadius: 4, boxShadow: '0 0 10px rgba(0,0,0,.3)' }}
                items={this.state.selectedItems}
                creatAlbum={this.creatAlbum}
              />
            </Paper> : <div />
        }

        {/* 查看大图 */}
        {
          this.state.openDetail ?
            <PhotoDetail
              closePhotoDetail={() => this.setState({ openDetail: false })}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%'
              }}
              items={this.props.media}
              seqIndex={this.seqIndex}
              ipcRenderer={this.props.ipcRenderer}
            /> : <div />
        }

        {/* 上传图片 */}
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
      </Paper>
    )
  }
}

export default PhotoApp
