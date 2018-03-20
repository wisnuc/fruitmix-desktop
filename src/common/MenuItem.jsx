import React from 'react'
import { MenuItem } from 'material-ui'

export default (props) => {
  let style = { fontSize: 13, minHeight: 32, height: 32, lineHeight: '32px' }
  if (props.style) style = Object.assign({}, props.style, style)

  return <MenuItem {...props} style={style} />
}
