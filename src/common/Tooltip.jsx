import React from 'react'

class Tooltip extends React.PureComponent {
  constructor(props) {
    super(props)
    this.distance = 8
    this.dur = 120
    this.state = {
      status: 'closed' // opening, open, closing, closed
    }

    this.leave = () => {
      if (['closing', 'closed'].includes(this.state.status)) return
      clearTimeout(this.timer)
      this.setState({ status: 'closing' })
      this.timer = setTimeout(() => this.setState({ status: 'closed' }), this.dur)
    }

    this.enter = () => {
      if (['opening', 'open'].includes(this.state.status)) return
      clearTimeout(this.timer)
      this.setState({ status: 'opening' })
      this.timer = setTimeout(() => this.setState({ status: 'open' }), this.dur)
    }
  }

  render() {
    const status = this.state.status

    const style = Object.assign({
      position: 'absolute',
      top: (status === 'opening' || status === 'closing') ? -this.distance : 0,
      zIndex: 100,
      fontSize: 10,
      color: '#F5F5F5',
      marginTop: 52,
      marginLeft: 8,
      backgroundColor: '#757575',
      padding: '2px 7px 3px 7px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: (['opening', 'closing', 'closed'].includes(status)) ? 0 : 1,
      transition: status === 'opening'
        ? `all ${this.dur}ms cubic-bezier(0.0, 0.0, 0.2, 1)`
        : `all ${this.dur}ms cubic-bezier(0.4, 0.0, 1, 1)`
    }, this.props.style)

    const listeners = {
      onMouseMove: this.enter,
      onMouseLeave: this.leave
    }

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div style={style} {...listeners} >
          { this.props.tooltip }
        </div>
        { React.cloneElement(this.props.children, listeners) }
      </div>
    )
  }
}

export default Tooltip
