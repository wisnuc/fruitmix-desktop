import React from 'react'
import ReactDOM from 'react-dom'

import Radium from 'radium'

import NavigationChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'

@Radium
class HoverNav extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    const style = {

      width: '100%',
      height: '100%',

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      opacity: 0.5,

      ':hover': { 
        background: '#212121', // gray900
        opacity: 0.7
      }
    }

    const enabled = !!this.props.onTouchTap

    return (
      <div style={this.props.style}>
        { enabled &&
          <div style={style} onTouchTap={this.props.onTouchTap}>
            { this.props.direction === 'left' && 
              <NavigationChevronLeft style={{ width: 32, height: 32}} color='#FFF' /> }
            { this.props.direction === 'right' &&
              <NavigationChevronRight style={{width: 32, height: 32}} color='#FFF' /> }
          </div> }
      </div>
    )
  }
}

export default HoverNav

