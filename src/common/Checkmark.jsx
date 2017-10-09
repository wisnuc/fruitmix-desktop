import React from 'react'
import ReactDOM from 'react-dom'

class Checkmark extends React.Component {
  constructor() {
    super()
  }

  componentDidMount() {
    this.canvas = ReactDOM.findDOMNode(this.refs.canvas)
    setTimeout(() => this.animate(this.canvas), this.props.delay || 0)
  }

  componentWillUnmount() {
    this.unmounted = true
  }

  animate(canvas) {
    const start = 20
    const mid = 40
    const end = 80
    const width = 8
    let leftX = start
    let leftY = start
    let rightX = mid - (width / 2.7)
    let rightY = mid + (width / 2.7)

    const animationSpeed = 15

    const ctx = canvas.getContext('2d')
    ctx.lineWidth = width
    ctx.strokeStyle = this.props.color || '#009688'

    for (var i = start; i < mid; i++) {
      const drawLeft = window.setTimeout(function () {
        if (this.unmounted) return
        ctx.beginPath()
        ctx.moveTo(start, start)
        ctx.lineTo(leftX, leftY)
        ctx.stroke()
        leftX++
        leftY++
      }, 1 + (i * animationSpeed) / 3)
    }

    for (var i = mid; i < end; i++) {
      const drawRight = window.setTimeout(function () {
        if (this.unmounted) return
        ctx.beginPath()
        ctx.moveTo(leftX, leftY)
        ctx.lineTo(rightX, rightY)
        ctx.stroke()
        rightX++
        rightY--
      }, 1 + (i * animationSpeed) / 3)
    }
  }

  render() {
    return <canvas width={96} height={48} ref="canvas" />
  }
}

export default Checkmark
