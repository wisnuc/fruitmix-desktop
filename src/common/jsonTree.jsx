import React from 'react'
import JSONTree from 'react-json-tree'

/**
@props {object} style
@props {object} data
*/

class Tree extends React.PureComponent {
  render () {
    const theme = {
      scheme: 'wisnuc',
      author: 'lxw',
      base00: '#1d1f21',
      base01: '#282a2e',
      base02: '#373b41',
      base03: '#969896',
      base04: '#b4b7b4',
      base05: '#c5c8c6',
      base06: '#e0e0e0',
      base07: '#ffffff',
      base08: '#CC342B',
      base09: '#F96A38',
      base0A: '#FBA922',
      base0B: '#00897b',
      base0C: '#3971ED',
      base0D: '#3971ED',
      base0E: '#A36AC7',
      base0F: '#3971ED'
    }
    const style = { width: '100%', height: '100%' }
    const data = this.props.data || {}
    if (this.props.style) Object.assign(style, this.props.style)
    return (
      <div style={style}>
        <JSONTree
          hideRoot
          theme={theme}
          data={data}
          shouldExpandNode={() => true}
          getItemString={type => (<span style={{ userSelect: 'text' }}>{ type }</span>)}
          valueRenderer={raw => <span style={{ userSelect: 'text' }}>{raw}</span>}
        />
      </div>
    )
  }
}

export default Tree
