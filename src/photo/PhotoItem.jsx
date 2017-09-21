import React from 'react'
import UUID from 'node-uuid'
import Debug from 'debug'
import { Paper, Card, IconButton, CircularProgress } from 'material-ui'
import ZoomIn from 'material-ui/svg-icons/action/zoom-in'
import CheckIcon from 'material-ui/svg-icons/action/check-circle'
import { CircleIcon } from '../common/Svg'

const debug = Debug('component:photoApp:photoItem:')

class PhotoItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: this.props.selectedItems.findIndex(item => item === this.props.digest) >= 0,
      hover: false
    }

    this.path = ''

    this.onSelectIconButton = () => {
      if (!this.state.selected) {
        this.setState({ selected: true }, () => this.props.addListToSelection(this.props.digest))
      } else {
        this.setState({ selected: false }, () => this.props.removeListToSelection(this.props.digest))
      }
    }

    this.updatePath = (event, session, path) => {
      if (this.session === session) {
        this.path = path
        this.forceUpdate()
      }
    }

    this.touchImage = () => {
      // debug(this.props.selectedItems)
      if (this.props.selectedItems.length > 0) {
        /* shift is true */
        if (this.props.shiftStatus.shift) {
          this.setState({ selected: true })
          this.props.shiftStatus.items.forEach(item => this.props.addListToSelection(item))
        /* shift is false */
        } else if (this.state.selected) {
          this.setState({ selected: false }, () => this.props.removeListToSelection(this.props.digest))
        } else {
          this.setState({ selected: true }, () => this.props.addListToSelection(this.props.digest))
        }
      } else {
        this.props.lookPhotoDetail(this.props.digest)
      }
    }

    this.mouseEnter = () => {
      this.setState({ hover: true })
      if (!this.state.hover) {
        // debug('this.mouseEnter', this.props)
        this.props.getHoverPhoto(this.props.digest)
      }
    }
    this.mouseLeave = () => {
      this.setState({ hover: false })
    }
  }

  componentDidMount() {
    this.session = UUID.v4()
    this.props.ipcRenderer.send('mediaShowThumb', this.session, this.props.digest, 210, 210)
    this.props.ipcRenderer.on('getThumbSuccess', this.updatePath)
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedItems.length !== this.props.selectedItems.length) {
      this.setState({
        selected: nextProps.selectedItems.findIndex(item => item === nextProps.digest) >= 0
      })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true
    return (this.state !== nextState)
  }

  componentWillUnmount() {
    this.props.ipcRenderer.removeListener('getThumbSuccess', this.updatePath)
    this.props.ipcRenderer.send('mediaHideThumb', this.session)
  }

  render() {
    const { style, shiftStatus } = this.props
    this.showShiftOverlay = shiftStatus.shift && shiftStatus.items.includes(this.props.digest)
    // debug('Render PhotoItem this.props', this.props)
    return (
      <div style={style}>
        <div style={{ position: 'relative', height: '100%', width: '100%' }} >
          {/* render circle background */}
          {
            !this.state.selected && this.props.selectedItems.length > 0 && <div
              style={{
                position: 'absolute',
                zIndex: 100,
                width: 210,
                height: 56,
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
            this.props.selectedItems.length > 0 && !this.state.hover && <div
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
            (this.state.selected || this.state.hover) && <div
              style={{
                position: 'absolute',
                zIndex: 100,
                width: this.state.selected ? '' : '100%',
                height: 36,
                display: 'flex',
                alignItems: 'center',
                background: this.props.selectedItems.length > 0 ? '' : 'linear-gradient(0deg, rgba(0,0,0,0), rgba(0,0,0,0.26))'
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
            this.state.hover && this.props.selectedItems.length > 0 && <div
              style={{
                position: 'absolute',
                zIndex: 100,
                width: this.state.selected ? 180 : 210,
                height: 36,
                left: this.state.selected ? 15 : 0,
                bottom: this.state.selected ? 15 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                background: 'linear-gradient(0deg, rgba(0,0,0,0.26), rgba(0,0,0,0))'
              }}
              onMouseEnter={this.mouseEnter}
              onMouseLeave={this.mouseLeave}
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
              height={this.state.selected ? 180 : 210}
              width={this.state.selected ? 180 : 210}
              style={{ objectFit: 'cover' }}
            />
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
                  width: this.state.selected ? 180 : 210,
                  height: this.state.selected ? 180 : 210,
                  top: this.state.selected ? 15 : 0,
                  left: this.state.selected ? 15 : 0,
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
