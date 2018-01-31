import React from 'react'
import { List } from 'react-virtualized'

const mousePosition = (ev) => {
  if (ev.pageX || ev.pageY) {
    return { x: ev.pageX, y: ev.pageY }
  }
  return {
    x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
    y: ev.clientY + document.body.scrollTop - document.body.clientTop
  }
}

class ScrollBar extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {}

    this.mouseDown = false
    this.onMouseDown = (event) => {
      this.mouseDown = true
      this.startY = event.clientY
      this.startScrollTop = this.getScrollTop() || 0
    }

    this.onMouseUp = () => (this.mouseDown = false)

    this.onMouseMove = (event) => {
      if (!this.refBar || !this.mouseDown) return
      const { allHeight, height } = this.props
      const barH = Math.max(height * height / allHeight, 48)
      const diff = event.clientY - this.startY
      const percent = Math.min(1, diff / (height - barH))
      const scrollTop = Math.max(0, percent * (allHeight - height) + this.startScrollTop)
      this.setScrollTop(scrollTop)
      this.onHover()
    }

    this.onScroll = (top, scrollTop) => {
      Object.assign(this.state, { scrollTop })
      if (!this.refBar) return
      this.onHover()
      this.refBar.style.top = `${top}px`
      if (this.props.onScroll) this.props.onScroll({ scrollTop })
    }

    this.getScrollTop = () => (this.state.scrollTop || 0)

    this.setScrollTop = scrollTop => this.setState({ scrollTop })

    this.onHover = () => {
      this.setState({ hover: true })
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.setState({ hover: false })
      }, 1000)
    }
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  render() {
    const { width, height, allHeight } = this.props
    const barH = Math.max(height * height / allHeight, 48)
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
    console.log('ScrollBar', this.props)
    return (
      <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
        <div
          style={{ position: 'absolute', width: width + 16, height, overflowY: 'scroll', overflowX: 'hidden', top: 0, left: 0 }}
          onMouseMove={this.onHover}
        >
          <List
            {...this.props}
            width={width + 16}
            scrollTop={this.state.scrollTop}
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
          ref={ref => (this.refBar = ref)}
          onMouseDown={this.onMouseDown}
          style={Object.assign({ backgroundColor: '#BDBDBD', height: barH }, barStyle)}
          onMouseMove={this.onHover}
        />
      </div>
    )
  }
}

export default ScrollBar
