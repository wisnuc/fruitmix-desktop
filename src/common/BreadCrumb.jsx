import React from 'react'
import RightIcon from 'material-ui/svg-icons/navigation/chevron-right'

export class BreadCrumbItem extends React.PureComponent {
  constructor(props) {
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
  render() {
    /* adjust the different lineHeight of Noto and Roboto */
    const pureRoboto = !this.props.text.replace(/[a-zA-Z0-9`~!@#$%^&()-_=+{}[\];', ]/g, '').length
    return (
      <div
        style={{
          cursor: 'pointer',
          borderRadius: 2, // mimic a flat button
          height: 32,
          paddingLeft: this.state.dropable ? 6 : 8,
          paddingRight: this.state.dropable ? 6 : 8,
          paddingTop: pureRoboto ? 4 : 0,
          display: 'flex',
          alignItems: 'center',
          border: this.state.dropable ? '2px #FAFAFA solid' : '',
          backgroundColor: this.state.isDrop ? 'transparent' : this.state.hover ? 'rgba(255,255,255,0.28)' : 'transparent'
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
  render() {
    return (
      <div style={{ height: 32, width: 24, display: 'flex', alignItems: 'center', marginTop: 4 }}>
        <RightIcon color="#FFFFFF" />
      </div>
    )
  }
}
