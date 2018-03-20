import React from 'react'

class Checkmark extends React.Component {
  componentDidMount () {
    setTimeout(() => this.animate(this.canvas), this.props.delay || 0)
  }

  componentWillUnmount () {
    this.unmounted = true
  }

  animate (canvas) {
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

    const drawLeft = (i) => {
      setTimeout(() => {
        if (this.unmounted) return
        ctx.beginPath()
        ctx.moveTo(start, start)
        ctx.lineTo(leftX, leftY)
        ctx.stroke()
        leftX += 1
        leftY += 1
      }, 1 + (i * animationSpeed) / 3)
    }

    const drawRight = (i) => {
      setTimeout(() => {
        if (this.unmounted) return
        ctx.beginPath()
        ctx.moveTo(leftX, leftY)
        ctx.lineTo(rightX, rightY)
        ctx.stroke()
        rightX += 1
        rightY -= 1
      }, 1 + (i * animationSpeed) / 3)
    }

    for (let i = start; i < mid; i++) {
      drawLeft(i)
    }

    for (let i = mid; i < end; i++) {
      drawRight(i)
    }
  }

  render () {
    return <canvas width={96} height={48} ref={ref => (this.canvas = ref)} />
  }
}

export default Checkmark
