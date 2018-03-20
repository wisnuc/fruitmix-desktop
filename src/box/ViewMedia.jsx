import React from 'react'
import i18n from 'i18n'
import { IconButton } from 'material-ui'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import PhotoList from '../photo/PhotoList'
import { combineElement, removeElement } from '../common/array'

class SelectMedia extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedItems: [],
      media: this.props.media
    }

    this.selected = []

    this.keyChange = (event) => {
      this.getShiftStatus(event)
    }

    this.getShiftStatus = (event) => {
      if (event.shiftKey === this.state.shift) return
      this.setState({ shift: event.shiftKey })
    }

    this.addListToSelection = (digests) => {
      if (this.firstSelect) {
        this.ctx.openSnackBar(i18n.__('Shift Tips'))
        this.firstSelect = false
      }
      this.setState({ selectedItems: combineElement(digests, this.state.selectedItems).sort() })
    }

    this.removeListToSelection = (digests) => {
      this.setState({ selectedItems: removeElement(digests, this.state.selectedItems).sort() })
    }

    this.download = () => {
      this.props.startDownload(this.state.selectedItems)
      this.setState({ selectedItems: [] })
    }

    this.clearSelect = () => { this.setState({ selectedItems: [] }) }
    this.getHoverPhoto = (digest) => {
      if (!this.state.selectedItems.length) return
      const lastSelect = this.state.selectedItems[this.state.selectedItems.length - 1]
      const lastSelectIndex = this.state.media.findIndex(photo => photo.hash === lastSelect)
      const hoverIndex = this.state.media.findIndex(photo => photo.hash === digest)
      let shiftHoverPhotos = this.state.media.slice(lastSelectIndex, hoverIndex + 1)

      if (hoverIndex < lastSelectIndex) shiftHoverPhotos = this.state.media.slice(hoverIndex, lastSelectIndex + 1)
      this.setState({ shiftHoverItems: shiftHoverPhotos.map(photo => photo.hash) })
    }
  }

  componentDidMount () {
    document.addEventListener('keydown', this.keyChange)
    document.addEventListener('keyup', this.keyChange)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.keyChange)
    document.removeEventListener('keyup', this.keyChange)
  }

  render () {
    // console.log('ViewMedia', this.props, this.state, this.selected)
    return (
      <div style={{ position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, zIndex: 1000, backgroundColor: '#FFF' }}>
        {/* Selected Header */}
        <div
          style={{
            width: '100%',
            height: 64,
            backgroundColor: '#FFF',
            display: 'flex',
            alignItems: 'center',
            zIndex: 200,
            boxShadow: '0px 1px 4px rgba(0,0,0,0.27)'
          }}
        >
          <div style={{ width: 12 }} />
          <div ref={ref => (this.refClearSelected = ref)}>
            <IconButton onTouchTap={this.props.onRequestClose}>
              <CloseIcon color="rgba(0,0,0,0.54)" />
            </IconButton>
          </div>
          <div style={{ width: 12 }} />
          <div style={{ color: 'rgba(0,0,0,.54)', fontSize: 20, fontWeight: 500 }} >
            { this.props.author && i18n.__('Photo Shared From %s', this.props.author.nickName) }
          </div>
          <div style={{ flexGrow: 1 }} />
          {
            !!this.state.selectedItems && !!this.state.selectedItems.length &&
              <IconButton onTouchTap={this.download} tooltip={i18n.__('Download')}>
                <DownloadIcon color="rgba(0,0,0,.54)" />
              </IconButton>
          }
          <div style={{ width: 24 }} />
        </div>
        {/* content */}
        <div style={{ width: '100%', height: 'calc(100% - 64px)', display: 'flex', position: 'relative', marginTop: 8 }}>
          <div style={{ flexGrow: 1, height: '100%', backgroundColor: '#FFF', paddingLeft: 64, paddingTop: 2 }}>
            <PhotoList
              media={this.state.media}
              lookPhotoDetail={this.props.lookPhotoDetail}
              ipcRenderer={this.props.ipcRenderer}
              addListToSelection={this.addListToSelection}
              removeListToSelection={this.removeListToSelection}
              memoize={this.props.memoize}
              selectedItems={this.state.selectedItems}
              getHoverPhoto={this.getHoverPhoto}
              shiftStatus={{ shift: this.state.shift, items: this.state.shiftHoverItems }}
              headerHeight={66}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default SelectMedia
