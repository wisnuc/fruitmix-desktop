import React from 'react'
import { AutoSizer } from 'react-virtualized'
import Thumb from '../file/Thumb'
import ScrollBar from '../common/ScrollBar'

class Grid extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      hover: ''
    }
  }

  renderGrid (digest, size) {
    // console.log('renderGrid', digest)
    const hovered = this.state.hover === digest
    return (
      <div
        style={{ width: size, height: size, marginRight: 4, cursor: 'pointer', filter: hovered ? 'brightness(0.5)' : '' }}
        onTouchTap={() => this.props.action(digest)}
        onMouseMove={() => !hovered && this.setState({ hover: digest })}
        onMouseLeave={() => this.setState({ hover: '' })}
      >
        <Thumb
          digest={digest}
          ipcRenderer={this.props.ipcRenderer}
          station={this.props.station}
          height={size}
          width={size}
        />
      </div>
    )
  }

  renderRow ({ index, key, style }) {
    const { items, size, num } = this.props
    const f = index * num
    return (
      <div style={style} key={key}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { Array.from({ length: num }).map((v, i) => items[f + i]).filter(i => !!i).map(d => this.renderGrid(d, size)) }
        </div>
      </div>
    )
  }

  render () {
    const { items, size, num } = this.props
    const rowCount = Math.ceil(items.length / num)
    const rowHeight = size + 4

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <AutoSizer>
          {({ height, width }) => (
            <ScrollBar
              allHeight={rowCount * rowHeight}
              height={height}
              width={width}
              rowCount={rowCount}
              rowHeight={rowHeight}
              rowRenderer={({ index, key, style }) => this.renderRow({ index, key, style })}
            />
          )}
        </AutoSizer>
      </div>
    )
  }
}

export default Grid
