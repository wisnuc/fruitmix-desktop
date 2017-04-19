import Debug from 'debug'
import React from 'react'
import ReactDom from 'react-dom'

const debug = Debug('component:photoApp:List:')

class List extends React.Component {
  constructor(props) {
    super(props)
    debug(this.props)
    const { height, width, rowCount, rowHeight, rowRenderer, style } = this.props

    this.rowHeightSum = 0
    for (let i = 0; i < this.props.rowCount; i++) {
      this.rowHeightSum += rowHeight({index: i})
    }
    debug('this.rowHeightSum', this.rowHeightSum)
    this.start = 0
    this.state = {
      scrollTop: 0
    }
  }
  renderNRow = (start) => {
    const list = []
    const end = this.props.rowCount < start ? this.props.rowCount : start + 10
    for (let i = start; i < end; i++) {
      list.push(this.props.rowRenderer({
        key: i.toString(),
        index: i,
        style: this.props.style,
        isScrolling: false
      }))
    }
    debug('list', list)
    return list
  }
  renderRow = () => {
    const list = []
    debug('list', list)
    for (let i = 0; i < this.props.rowCount; i++) {
      list.push(this.props.rowRenderer({
        key: i.toString(),
        index: i,
        style: this.props.style,
        isScrolling: true
      }))
    }
    debug('list', list)
    return list
  }
  onscroll = () => {
    this.start = Math.floor(this.node.scrollTop / 204)
    this.setState({ scrollTop: this.node.scrollTop })
  }
  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps !== this.props)
  }
  componentDidUpdate() {
    this.node.scrollIntoView()
  }
  render() {
    debug('renderList', this.props)
    // return <div>return</div>
    const { height, width, rowCount, rowHeight, rowRenderer, style } = this.props
    return (
      <div
        ref={node => (this.node = node)}
        onScroll={this.onscroll}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto'
        }}
      >
        <div
          scrollTop={}
          style={{
            width: '100%',
            height: this.rowHeightSum
          }}
        >
          {this.renderNRow(this.start)}
        </div>
      </div>
    )
  }
}
export default List
/*
  <List
  height={height}
  width={width}
  rowCount={this.props.photoMapDates.length}
  rowHeight={rowHeight}
  rowRenderer={rowRenderer}
  onScroll={() => this.onScroll(true)}
  scrollToIndex={this.scrollToIndex}
  overscanRowCount={6}
  style={{ padding: 16 }}
  estimatedRowSize={estimatedRowSize}
  />
*/
