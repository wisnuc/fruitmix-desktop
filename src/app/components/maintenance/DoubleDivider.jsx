import React from 'react'
import { Divider } from 'material-ui'
import muiThemeable from 'material-ui/styles/muiThemeable'

// grayLeft and colorLeft

@muiThemeable()
export default class DoubleDivider extends React.PureComponent {

  render() {
    const primary1Color = this.props.muiTheme.palette.primary1Color
    const accent1Color = this.props.muiTheme.palette.accent1Color

    return (
      <div>
        { this.props.grayLeft &&
          <Divider
            style={{
              marginLeft: this.props.grayLeft,
              transition: 'margin 300ms'
            }}
          /> }

        { this.props.colorLeft &&
          <Divider
            style={{
              marginLeft: this.props.colorLeft,
              backgroundColor: accent1Color,
              transition: 'margin 300ms'
            }}
          /> }
      </div>
    )
  }
}
