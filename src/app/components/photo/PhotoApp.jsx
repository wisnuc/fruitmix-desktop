import Debug from 'debug'
import React from 'react'
import EventListener from 'react-event-listener'
import { Paper, Menu, MenuItem, Divider, IconButton, CircularProgress } from 'material-ui'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import DeviceStorage from 'material-ui/svg-icons/device/storage'
import { formatDate } from '../../utils/datetime'

import Carousel from './Carousel'
import PhotoDetail from './PhotoDetail'

import PhotoList from './PhotoList'

const debug = Debug('component:photoApp:')
const LEFTNAV_WIDTH = 72

class PhotoApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      openDetail: false,
      carouselItems: []
    }

    this.seqIndex = ''

    this.addListToSelection = (path) => {
      const hasPath = this.state.carouselItems.findIndex(item => item === path) >= 0

      !hasPath && this.setState(prevState => ({
        carouselItems: [
          ...prevState.carouselItems,
          path
        ]
      }))
    }
    this.removeListToSelection = (path) => {
      const hasPath = this.state.carouselItems.findIndex(item => item === path) >= 0

      hasPath && this.setState((prevState) => {
        const index = findPath(prevState.carouselItems, path)

        return {
          carouselItems: [
            ...prevState.carouselItems.slice(0, index),
            ...prevState.carouselItems.slice(index + 1)
          ]
        }
      })
    }

    this.lookPhotoDetail = (digest) => {
      this.seqIndex = this.props.media.findIndex(item => item[0] === digest)
      this.setState({ openDetail: true })
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
    debug('PhotoApp, store.media.data', this.props)
    return (
      <Paper>
        <EventListener
          target="window"
          onResize={this.handleResize}
        />
        {
          this.props.media ?
            <PhotoList
              style={{
                position: 'fixed',
                width: 'calc(100% - 72px)',
                height: 'calc(100% - 64px)',
                left: LEFTNAV_WIDTH,
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              {...this.props.setPhotoInfo(800, 1000, this.props.media)}
              media={this.props.media}
              lookPhotoDetail={this.lookPhotoDetail}
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
            >
              <CircularProgress />
            </div>
        }

        {/* 轮播 */}
        {
          this.state.carouselItems.length ?
            <Paper style={{ position: 'fixed', bottom: 15, width: '75%' }} >
              <Carousel
                ClearAll={() => this.setState({ carouselItems: [] })}
                removeListToSelection={this.removeListToSelection}
                style={{ backgroundColor: '#fff', height: 180, borderRadius: 4, boxShadow: '0 0 10px rgba(0,0,0,.3)' }}
                items={this.state.carouselItems}
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
            /> : <div />
        }



      </Paper>
    )
  }
}

export default PhotoApp
