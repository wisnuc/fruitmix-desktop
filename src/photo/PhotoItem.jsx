import React from 'react'
import UUID from 'uuid'
import ZoomIn from 'material-ui/svg-icons/action/zoom-in'
import CheckIcon from 'material-ui/svg-icons/action/check-circle'
import PlayIcon from 'material-ui/svg-icons/av/play-circle-filled'
import { CircleIcon, GIFFont } from '../common/Svg'

class PhotoItem extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selected: this.props.selectedItems.includes(this.props.digest),
      hover: false
    }

    this.path = ''

    this.onSelectIconButton = () => {
      if (!this.state.selected) {
        this.setState({ selected: true }, () => this.props.addListToSelection([this.props.digest]))
      } else {
        this.setState({ selected: false }, () => this.props.removeListToSelection([this.props.digest]))
      }
    }

    this.updatePath = (event, session, path) => {
      if (this.session === session) {
        this.path = path
        this.forceUpdate()
      }
    }

    this.touchImage = () => {
      if (this.props.selectedItems.length > 0 || this.props.selecting) {
        /* shift is true */
        if (this.props.shiftStatus.shift) {
          this.setState({ selected: true })
          this.props.addListToSelection(this.props.shiftStatus.items)
        /* shift is false */
        } else if (this.state.selected) {
          this.setState({ selected: false }, () => this.props.removeListToSelection([this.props.digest]))
        } else {
          this.setState({ selected: true }, () => this.props.addListToSelection([this.props.digest]))
        }
      } else {
        this.props.lookPhotoDetail(this.props.digest)
      }
    }

    this.mouseEnter = () => {
      this.setState({ hover: true })
      if (!this.state.hover) {
        this.props.getHoverPhoto(this.props.digest)
      }
    }
    this.mouseLeave = () => {
      this.setState({ hover: false })
    }

    this.parseDur = (dur) => {
      const h = Math.floor(dur / 3600)
      let m = Math.floor((dur - h * 3600) / 60)
      let s = Math.floor(dur - h * 3600 - m * 60)
      if (s < 10) s = `0${s}`
      if (h > 0 && m < 10) m = `0${m}`
      return (h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`)
    }
  }

  componentDidMount () {
    this.session = UUID.v4()
    this.props.ipcRenderer.send('mediaShowThumb', this.session, this.props.digest, 200, 200)
    this.props.ipcRenderer.on('getThumbSuccess', this.updatePath)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.selectedItems.length !== this.props.selectedItems.length) {
      this.setState({
        selected: nextProps.selectedItems.includes(nextProps.digest)
      })
    }
  }

  componentWillUnmount () {
    this.props.ipcRenderer.removeListener('getThumbSuccess', this.updatePath)
    this.props.ipcRenderer.send('mediaHideThumb', this.session)
  }

  render () {
    const { style, shiftStatus, size, item } = this.props
    this.showShiftOverlay = shiftStatus.shift && shiftStatus.items.includes(this.props.digest)

    const selectMode = this.props.selectedItems.length > 0 || this.props.selecting

    const { m, dur } = item

    const videoMagic = ['3GP', 'MP4', 'MOV']
    const isGIF = (m === 'GIF')
    const isVideo = videoMagic.includes(m)

    return (
      <div style={style}>
        <div style={{ position: 'relative', height: '100%', width: '100%' }} >
          {/* render circle background */}
          {
            !this.state.selected && selectMode && <div
              style={{
                position: 'absolute',
                zIndex: 100,
                width: size,
                height: 36,
                left: 0,
                top: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                background: 'linear-gradient(0deg, rgba(0,0,0,0), rgba(0,0,0,0.26))'
              }}
              onMouseEnter={this.mouseEnter}
              onMouseLeave={this.mouseLeave}
            />
          }

          {/* renderSelectCircle */}
          {
            selectMode && !this.state.hover &&
              <div
                style={{
                  position: 'absolute',
                  zIndex: 100,
                  width: 24,
                  height: 20,
                  display: 'flex',
                  margin: 8,
                  alignItems: 'center'
                }}
                onTouchTap={(e) => { this.onSelectIconButton(); e.stopPropagation() }}
                onMouseEnter={this.mouseEnter}
                onMouseLeave={this.mouseLeave}
              >
                <CircleIcon />
              </div>
          }

          {/* renderSelectedBackground */}
          {
            this.state.selected && <div
              style={{
                position: 'absolute',
                zIndex: 100,
                width: 18,
                height: 18,
                margin: '9px 0px 0px 11px',
                borderRadius: '9px',
                backgroundColor: '#FFF'
              }}
            />
          }

          {/* renderHoverCheck */}
          {
            (this.state.selected || this.state.hover) &&
              <div
                style={{
                  position: 'absolute',
                  zIndex: 100,
                  width: this.state.selected ? '' : '100%',
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  background: selectMode ? '' : 'linear-gradient(0deg, rgba(0,0,0,0), rgba(0,0,0,0.26))'
                }}
                onTouchTap={this.touchImage}
                onMouseEnter={this.mouseEnter}
                onMouseLeave={this.mouseLeave}
              >
                <CheckIcon
                  style={{ margin: 8 }}
                  hoverColor={this.state.selected ? '#1E88E5' : '#FFF'}
                  color={this.state.selected ? '#1E88E5' : 'rgba(255,255,255,0.54)'}
                  onTouchTap={(e) => { this.onSelectIconButton(); e.stopPropagation() }}
                />
              </div>
          }

          {/* render hover opendetial */}
          {
            this.state.hover && selectMode && !this.props.selecting &&
              <div
                style={{
                  position: 'absolute',
                  zIndex: 100,
                  width: this.state.selected ? 180 : size,
                  height: 36,
                  left: this.state.selected ? (size - 180) / 2 : 0,
                  bottom: this.state.selected ? (size - 180) / 2 : 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.26), rgba(0,0,0,0))'
                }}
                onMouseEnter={this.mouseEnter}
                onMouseLeave={this.mouseLeave}
                onTouchTap={(e) => { this.onSelectIconButton(); e.stopPropagation() }}
              >
                <ZoomIn
                  onTouchTap={(e) => { this.props.lookPhotoDetail(this.props.digest); e.stopPropagation() }}
                  style={{ margin: 8 }}
                  hoverColor="#FFF"
                  color="rgba(255,255,255,0.54)"
                />
              </div>
          }

          {/* renderImage */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#eeeeee'
            }}
            onTouchTap={this.touchImage}
            onMouseMove={this.mouseEnter}
            onMouseLeave={this.mouseLeave}
          >
            <img
              src={this.path}
              alt="img"
              height={this.state.selected ? 180 : size}
              width={this.state.selected ? 180 : size}
              style={{ objectFit: 'cover' }}
            />
            { /* video or GIF icon */
              this.path && (isVideo || isGIF) &&
                <div
                  style={{
                    position: 'absolute',
                    height: 36,
                    width: '100%',
                    top: 0,
                    left: 0,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    background: 'linear-gradient(0deg, rgba(0,0,0,0), rgba(0,0,0,0.26))'
                  }}
                >
                  {
                    isVideo &&
                      <div style={{ margin: this.state.selected ? (size - 180) / 2 : 8, display: 'flex', alignItems: 'center' }}>
                        <div style={{ color: '#FFFFFF', fontSize: 13, marginRight: 8, fontWeight: 500 }} >
                          { this.parseDur(dur) }
                        </div>
                        <PlayIcon color="#FFFFFF" />
                      </div>
                  }
                  {
                    isGIF &&
                      <div style={{ margin: this.state.selected ? (size - 180) / 2 : 8, display: 'flex', alignItems: 'center' }}>
                        <div style={{ color: '#FFFFFF', fontSize: 13, marginRight: 8, fontWeight: 600 }} >
                          <GIFFont color="#FFFFFF" />
                        </div>
                      </div>
                  }
                </div>
            }
            <div
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                top: 0,
                left: 0,
                opacity: this.path ? 0 : 1,
                backgroundColor: '#eeeeee',
                transition: 'all 225ms cubic-bezier(0.0, 0.0, 0.2, 1)'
              }}
            />
          </div>

          {/* render Shift Blue Hover */}
          {
            this.showShiftOverlay &&
              <div
                style={{
                  position: 'absolute',
                  zIndex: 100,
                  width: this.state.selected ? 180 : size,
                  height: this.state.selected ? 180 : size,
                  top: this.state.selected ? (size - 180) / 2 : 0,
                  left: this.state.selected ? (size - 180) / 2 : 0,
                  backgroundColor: 'rgba(30, 136, 229, 0.26)'
                }}
                onTouchTap={this.touchImage}
                onMouseMove={this.mouseEnter}
                onMouseLeave={this.mouseLeave}
              />
          }
        </div>
      </div>
    )
  }
}

export default PhotoItem
