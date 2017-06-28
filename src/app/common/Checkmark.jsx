import React from 'react'
import ReactDOM from 'react-dom'

class Checkmark extends React.Component {

  constructor(){
    super()
  }

  componentDidMount(){
    this.canvas = ReactDOM.findDOMNode(this.refs.canvas)
    setTimeout(() => this.animate(this.canvas), this.props.delay || 0)
  }

  componentWillUnmount(){
    this.unmounted = true
  }

  animate(canvas) {

    var start = 20;
    var mid = 40;
    var end = 80;
    var width = 8;
    var leftX = start;
    var leftY = start;
    var rightX = mid - (width / 2.7);
    var rightY = mid + (width / 2.7);

    var animationSpeed = 15;

    var ctx = canvas.getContext('2d');
    ctx.lineWidth = width;
    ctx.strokeStyle = this.props.color || 'rgba(0, 150, 0, 1)'

    for (var i = start; i < mid; i++) {
        var drawLeft = window.setTimeout(function () {
            if (this.unmounted) return;
            ctx.beginPath();
            ctx.moveTo(start, start);
            ctx.lineTo(leftX, leftY);
            ctx.stroke();
            leftX++;
            leftY++;
        }, 1 + (i * animationSpeed) / 3);
    }

    for (var i = mid; i < end; i++) {
        var drawRight = window.setTimeout(function () {
            if (this.unmounted) return;
            ctx.beginPath();
            ctx.moveTo(leftX, leftY);
            ctx.lineTo(rightX, rightY);
            ctx.stroke();
            rightX++;
            rightY--;
        }, 1 + (i * animationSpeed) / 3);
    }
  }

  render(){
    return <canvas width={96} height={48} ref="canvas" />
  }
}

export default Checkmark
