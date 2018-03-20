import React from 'react'
import UUID from 'uuid'

class Thumb extends React.PureComponent {
  constructor (props) {
    super(props)

    this.path = ''

    this.updatePath = (event, session, path) => {
      if (this.session === session) {
        this.path = path
        this.forceUpdate()
      }
    }
  }

  componentDidMount () {
    this.session = UUID.v4()
    this.props.ipcRenderer.send('mediaShowThumb', this.session, this.props.digest, 200, 200, this.props.station)
    this.props.ipcRenderer.on('getThumbSuccess', this.updatePath)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.digest !== this.props.digest) {
      this.session = UUID.v4()
      this.props.ipcRenderer.send('mediaShowThumb', this.session, nextProps.digest, 200, 200, this.props.station)
    }
  }

  componentWillUnmount () {
    this.props.ipcRenderer.removeListener('getThumbSuccess', this.updatePath)
    this.props.ipcRenderer.send('mediaHideThumb', this.session)
  }

  render () {
    const style = Object.assign(
      { objectFit: this.props.full ? 'contain' : 'cover', transition: 'all 225ms cubic-bezier(0.0, 0.0, 0.2, 1)' },
      this.props.imgStyle || {}
    )
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: this.props.bgColor || '#FFF' }}>
        {
          this.path &&
            <img
              src={this.path}
              alt="img"
              height={this.props.height}
              width={this.props.width}
              style={style}
              draggable={false}
            />
        }
      </div>
    )
  }
}
export default Thumb
