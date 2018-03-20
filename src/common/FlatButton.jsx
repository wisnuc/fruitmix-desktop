import React from 'react'
import { FlatButton } from 'material-ui'

export default (props) => {
  let style = { minWidth: 64 }
  if (props.style) style = Object.assign({}, props.style, style)
  if (style.marginRight === undefined) style.marginRight = 8

  let labelStyle = { verticalAlign: undefined, fontWeight: 500, fontSize: 15, paddingLeft: 8, paddingRight: 8 }
  if (props.labelStyle) labelStyle = Object.assign({}, labelStyle, props.labelStyle)

  return <FlatButton {...props} style={style} labelStyle={labelStyle} />
}
