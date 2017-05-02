import React, { PureComponent } from 'react'

class IconBox extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div style={this.props.style}>
        <div style={{
          width: this.props.size, height: this.props.size, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          { this.props.icon && <this.props.icon color='rgba(0,0,0,0.54)' /> }
        </div>
      </div>
    )
  }
}

export default IconBox

