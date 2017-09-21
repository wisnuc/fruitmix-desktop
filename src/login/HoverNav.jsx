import React from 'react'
import { Avatar } from 'material-ui'
import NavigationChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'

class HoverNav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hover: false
    }
  }

  renderIcon(Icon) {
    return (
      <Avatar
        icon={<Icon style={{ width: 32, height: 32 }} color="#FFF" />}
        backgroundColor={this.state.hover ? '#9E9E9E' : '#FAFAFA'}
      />
    )
  }

  render() {
    const enabled = !!this.props.onTouchTap
    return (
      <div style={this.props.style}>
        {
          enabled &&
          <div
            style={{ width: '100%', height: '100%' }}
            onTouchTap={this.props.onTouchTap}
            onMouseMove={() => this.setState({ hover: true })}
            onMouseLeave={() => this.setState({ hover: false })}
          >
            <div style={{ height: 76 }} />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              { this.props.direction === 'left' && this.renderIcon(NavigationChevronLeft) }
              { this.props.direction === 'right' && this.renderIcon(NavigationChevronRight) }
            </div>
          </div>
        }
      </div>
    )
  }
}

export default HoverNav
