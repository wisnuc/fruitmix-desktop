import React, { PureComponent } from 'react'
import { dialogBoxShadow } from '../common/boxShadow'

class DialogOverlay extends PureComponent {

  constructor(props) {
    super(props)
    this.distance = 16
    this.state = {
      status: 'closed' // opening, open, closing, closed
    }

    this.onRequestClose = dirty => {
      this.setState({ status: 'closing' })
      setTimeout(() => this.props.onRequestClose(dirty), 225)
    }
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.open === true && this.props.open === false) {
      this.setState({ status: 'opening'})
      setTimeout(() => this.setState({ status: 'open' }), 0)
    }
    else if (nextProps.open === false) {
      this.setState({ status: 'closed' })
    }
  }

  render() {

    const status = this.state.status
    if (status === 'closed') return null

    return (
      <div style={{
        position: 'fixed', 
        width: '100%', 
        height: `calc(100% + ${this.distance}px)`,
        top: (status === 'opening' || status === 'closing') ? - this.distance : 0, 
        left: 0,
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        opacity: (status === 'opening' || status === 'closing') ? 0 : 1,
        transition: status === 'opening' 
          ? `all 225ms cubic-bezier(0.0, 0.0, 0.2, 1)`
          : `all 195ms cubic-bezier(0.4, 0.0, 1, 1)`
      }}>
        <div style={{backgroundColor: 'white', boxShadow: dialogBoxShadow}}>
          { !!this.props.children && React.cloneElement(this.props.children, {onRequestClose: this.onRequestClose}) }
        </div>
        <div style={{height: '10%'}} />
      </div>
    )
  }
}

export default DialogOverlay
