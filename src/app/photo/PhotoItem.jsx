import React from 'react'
import UUID from 'node-uuid'
import Debug from 'debug'
import { Paper, Card, IconButton, CircularProgress } from 'material-ui'
import ZoomIn from 'material-ui/svg-icons/action/zoom-in'
import CheckIcon from 'material-ui/svg-icons/action/check-circle'

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
      debug(this.props.selectedItems)
      if (this.props.selectedItems.length > 0) {
        if (this.state.selected) {
          this.setState({ selected: false }, () => this.props.removeListToSelection(this.props.digest))
        } else {
          this.setState({ selected: true }, () => this.props.addListToSelection(this.props.digest))
        }
      } else {
        this.props.lookPhotoDetail(this.props.digest)
      }
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
    const { style } = this.props
    // debug('Render PhotoItem this.props', this.props)
    return (
      <div style={style}>
        <div style={{ position: 'relative', height: '100%', width: '100%' }} >
          {/* renderHoverCheck */}
          {
            (this.state.selected || this.state.hover) && <div
              style={{
                position: 'absolute',
                zIndex: 100,
                left: 5,
                top: 5,
                width: 18,
                height: 18,
                backgroundColor: this.state.selected ? '#FFF' : ''
              }}
              onTouchTap={(e) => { this.onSelectIconButton(); e.stopPropagation() }}
              onMouseEnter={() => this.setState({ hover: true })}
              onMouseLeave={() => this.setState({ hover: false })}
            >
              <CheckIcon
                hoverColor={this.state.selected ? '#1E88E5' : '#FFF'}
                color={this.state.selected ? '#1E88E5' : 'rgba(255,255,255,0.54)'}
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
                color: 'blue',
                left: this.state.selected ? 15 : 0,
                bottom: this.state.selected ? 15 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                background: 'linear-gradient(0deg, rgba(0,0,0,0.54), rgba(0,0,0,0))'
              }}
              onTouchTap={(e) => { this.props.lookPhotoDetail(this.props.digest); e.stopPropagation() }}
              onMouseEnter={() => this.setState({ hover: true })}
              onMouseLeave={() => this.setState({ hover: false })}
            >
              <ZoomIn
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
            onMouseMove={() => this.setState({ hover: true })}
            onMouseLeave={() => this.setState({ hover: false })}
          >
            {
              this.path &&
              <img
                src={this.path}
                alt="img"
                height={this.state.selected ? 180 : 210}
                width={this.state.selected ? 180 : 210}
                style={{ objectFit: 'cover', transition: 'all 225ms cubic-bezier(0.0, 0.0, 0.2, 1)' }}
              />
            }
          </div>
        </div>
      </div>
    )
  }
}

export default PhotoItem
