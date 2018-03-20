import React from 'react'
import RightIcon from 'material-ui/svg-icons/navigation/chevron-right'

export class BreadCrumbItem extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = { hover: false, isDrop: false }
    this.onMouseMove = () => {
      if (this.state.hover) return

      /* not in '...' */
      if (this.props.text !== '...') this.props.onHoverHeader(this.props.node)
      this.setState({ hover: true, isDrop: this.props.isDrop(), dropable: !!this.props.dropable() })
    }

    this.onMouseLeave = () => {
      this.props.onHoverHeader(null)
      this.setState({ hover: false, isDrop: false, dropable: false })
    }
  }
  render () {
    /* alt: small version and bgColor is white */
    const { alt, text } = this.props

    /* adjust the different lineHeight of Noto and Roboto */
    const pureRoboto = !text.replace(/[a-zA-Z0-9`~!@#$%^&()-_=+{}[\];', ]/g, '').length

    const bgColor = alt ? 'rgba(0,0,0,.09)' : 'rgba(255,255,255,0.28)'

    return (
      <div
        style={{
          cursor: 'pointer',
          borderRadius: 2, // mimic a flat button
          height: alt ? 24 : 32,
          paddingLeft: (this.state.dropable) || alt ? 6 : 8,
          paddingRight: (this.state.dropable || alt) ? 6 : 8,
          fontSize: alt ? 12 : 20,
          fontWeight: 500,
          paddingTop: pureRoboto ? 4 : alt ? 2 : 0,
          color: alt ? 'rgba(0,0,0,.54)' : '#FFF',
          display: 'flex',
          alignItems: 'center',
          border: this.state.dropable ? '2px #FAFAFA solid' : '',
          backgroundColor: this.state.isDrop ? 'transparent' : this.state.hover ? bgColor : 'transparent'
        }}
        onTouchTap={this.props.onTouchTap}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.onMouseLeave}
      >
        <div style={{ maxWidth: 144, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} >
          { this.props.text }
        </div>
      </div>
    )
  }
}

export class BreadCrumbSeparator extends React.PureComponent {
  render () {
    const { alt } = this.props
    return (
      <div
        style={{
          height: alt ? 24 : 32,
          width: alt ? 16 : 24,
          display: 'flex',
          alignItems: 'center',
          marginTop: alt ? 2 : 4,
          justifyContent: 'center',
          color: 'rgba(0,0,0,.54)'
        }}
      >
        { alt ? '>' : <RightIcon color="#FFFFFF" /> }
      </div>
    )
  }
}
