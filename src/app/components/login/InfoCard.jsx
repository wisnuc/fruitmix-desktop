import React from 'react'
import ReactDOM from 'react-dom'
import { LinearProgress } from 'material-ui'

class InfoCard extends React.Component {

  constructor(props) {
    super(props)
  }

  componentWillEnter(callback) {
    this.props.onWillEnter(ReactDOM.findDOMNode(this), callback) 
  }

  componentWillLeave(callback) {
    this.props.onWillLeave(ReactDOM.findDOMNode(this), callback)
  }

  render() {
    return (
      <div style={this.props.style}>
        <div style={{width: '100%', height: 288, backgroundColor: 'rgba(128, 128, 128, 0.8)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontSize: 21, color:'#FFF'}}>{this.props.text}</div>
          <div style={{flex: '0 0 24px'}} />
          <div style={{width: '70%'}}><LinearProgress /></div>
        </div>
      </div>
    )
  }
}

export default InfoCard

