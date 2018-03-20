import React from 'react'
import { List } from 'react-virtualized'

class ScrollBar extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {}

    this.scrollTop = 0

    this.mouseDown = false
    this.onMouseDown = (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.mouseDown = true
      this.startY = event.clientY
      this.startScrollTop = this.scrollTop
    }

    this.onMouseUp = () => (this.mouseDown = false)

    this.onMouseMove = (event) => {
      if (!this.refBar || !this.mouseDown) return
      const { allHeight, height } = this.props
      const barH = Math.max(height * height / allHeight, 48)
      const diff = event.clientY - this.startY
      const percent = diff / (height - barH)
      const scrollTop = Math.min(allHeight - height, Math.max(0, percent * (allHeight - height) + this.startScrollTop))
      this.scrollToPosition(scrollTop)
      this.onHover()
    }

    this.onScroll = (top, scrollTop) => {
      this.scrollTop = scrollTop
      if (!this.refBar) return
      this.onHover()
      this.refBar.style.top = `${top}px`
      if (this.props.onScroll) this.props.onScroll({ scrollTop })
    }

    this.onHover = () => {
      this.setState({ hover: true })
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.setState({ hover: false })
      }, 1000)
    }
  }

  componentDidMount () {
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  }

  componentWillReceiveProps (nextProps) {
    const { height, allHeight, scrollTop } = nextProps
    if (scrollTop) {
      const barH = Math.max(height * height / allHeight, 48)
      const top = (height - barH) * scrollTop / (allHeight - height)
      this.onScroll(top, nextProps.scrollTop)
    }
  }

  componentWillUnmount () {
    clearTimeout(this.timer)
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  scrollToPosition (scrollTop) {
    if (this.refList) this.refList.scrollToPosition(scrollTop)
  }

  scrollToRow (index) {
    if (this.refList) this.refList.scrollToRow(index)
  }

  render () {
    const { width, height, allHeight } = this.props
    const barH = Math.max(height * height / allHeight, 48) || 48
    const barStyle = {
      top: 0,
      right: 0,
      width: 8,
      borderRadius: 4,
      position: 'absolute',
      transition: 'opacity 225ms',
      opacity: this.state.hover ? 1 : 0,
      display: barH < height ? '' : 'none'
    }
    return (
      <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
        <div
          style={{ position: 'absolute', width: width + 16, height, overflowY: 'scroll', overflowX: 'hidden', top: 0, left: 0 }}
          onMouseMove={this.onHover}
        >
          <List
            {...this.props}
            style={Object.assign({ outline: 'none' }, this.props.style)}
            ref={ref => (this.refList = ref)}
            width={width + 16}
            onScroll={({ scrollTop }) => this.onScroll((height - barH) * scrollTop / (allHeight - height), scrollTop)}
          />
        </div>
        {/* scrollBar background */}
        <div
          ref={ref => (this.refBg = ref)}
          style={Object.assign({ backgroundColor: '#EEEEEE', height }, barStyle)}
          onMouseMove={this.onHover}
        />
        {/* scrollBar */}
        <div
          role="presentation"
          onMouseMove={this.onHover}
          onMouseDown={this.onMouseDown}
          ref={ref => (this.refBar = ref)}
          style={Object.assign({ backgroundColor: '#BDBDBD', height: barH }, barStyle)}
        />
      </div>
    )
  }
}

export default ScrollBar
