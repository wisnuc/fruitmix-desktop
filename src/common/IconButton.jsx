import React from 'react'
import { IconButton } from 'material-ui'
import Tooltip from '../common/Tooltip'

class IconButtonWithTooltips extends React.PureComponent {
  render() {
    const props = Object.assign({}, this.props)
    delete props.tooltip
    return (
      <Tooltip tooltip={this.props.tooltip} >
        <IconButton {...props} />
      </Tooltip>
    )
  }
}

export default IconButtonWithTooltips
