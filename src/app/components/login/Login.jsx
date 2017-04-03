import Debug from 'debug'
const debug = Debug('component:Login')
import { TweenMax } from 'gsap'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import TransitionGroup from 'react-addons-transition-group'
import { indigo900, cyan500, cyan900, teal900, lightGreen900, lime900, yellow900 } from 'material-ui/styles/colors'

import InfoCard from './InfoCard'
import DeviceCard from './DeviceCard'
import { command } from '../../lib/command'

const colorArray = [ indigo900, cyan900, teal900, lightGreen900, lime900, yellow900 ]

class Login extends React.Component {

  constructor(props) {

    const duration = 0.4

    super(props)

    this.state = {
      selectIndex: -1,
      expanded: false,
      deviceName: null,
      dim: false
    }

    this.selectNextDevice = () => {

      let { devices } = this.props
      let { selectIndex } = this.state
      let index

      if (devices.length === 0)
        index = -1
      else if (selectIndex === -1)
        index = 0
      else if (selectIndex >= devices.length - 2)
        index = devices.length - 1
      else
        index = selectIndex + 1

      if (index === selectIndex) return

      let nextState = Object.assign({}, this.state, { selectIndex: index, expanded: false })
      this.setState(nextState)

      debug('select next device', selectIndex, index)
    }

    this.selectPrevDevice = () => {

      let { devices } = this.props
      let { selectIndex } = this.state
      let index

      if (devices.length === 0)
        index = -1
      else if (selectIndex <= 1)
        index = 0
      else
        index = selectIndex - 1

      if (index === selectIndex) return

      let nextState = Object.assign({}, this.state, { selectIndex: index, expanded: false })
      this.setState(nextState)

      debug('select prev device', selectIndex, index)
    }


    // for leaving children, there is no way to update props, but this state is required for animation
    // so we put it directly in container object, and pass callbacks which can access this state
    // to the children
    this.enter = 'right'

    this.cardWillEnter = (el, callback) => {

      if (this.enter === 'right') {
        TweenMax.from(el, duration, {
          delay: duration,
          opacity: 0,
          right: -150,
          onComplete: () => callback()
        })
      }
      else {
        TweenMax.from(el, duration, {
          delay: duration,
          opacity: 0,
          transformOrigin: 'left center',
          transform: 'translateZ(-64px) rotateY(45deg)',
          onComplete: () => callback()
        })
      }
    }

    this.cardWillLeave = (el, callback) => {

      if (this.enter === 'left') {
        TweenMax.to(el, duration, {
          opacity: 0,
          right: -150,
          onComplete: () => callback()
        })
      }
      else {
        TweenMax.to(el, duration, {
          opacity: 0,
          transformOrigin: 'left center',
          transform: 'translateZ(-64px) rotateY(45deg)',
          onComplete: () => callback()
        })
      }
    }

    this.navPrev = () => {
      this.enter = 'left'
      this.selectPrevDevice()
    }

    this.navNext = () => {
      this.enter = 'right'
      this.selectNextDevice()
    }

    this.onResize = resize => {
      if ((resize === 'HEXPAND' && !this.state.expanded) 
          || (resize === 'HSHRINK' && this.state.expanded))
        this.setState({ expanded: !this.state.expanded })
    }

    this.toggleDim = () => this.setState(state => ({ dim: !state.dim }))
  }

  componentWillReceiveProps(nextProps) {

    let curr = this.props.devices
    let next = nextProps.devices

    if (curr.length === 0 && next.length > 0) {
      this.setState({ selectIndex: 0 })
    }
    else if (curr.length > 0 && next.length === 0) {
      this.setState({ selectIndex: -1 })
    }
  }

  render() {

    let cardProps = {
			style: { position: 'absolute', width: '100%', height:'100%'},
			onWillEnter: this.cardWillEnter,
			onWillLeave: this.cardWillLeave
    }

    return (
      <div style={{ width: '100%', height: '100%', display:'flex', flexDirection: 'column', alignItems: 'center' }} >
        
        {/* bg image */}
        <img style={{ position: 'absolute', width: '100%', height: '100%', 
          zIndex: -1000 }} src='../src/assets/images/index/index.jpg' />
        
        {/* dim */}
        <div style={{ width: '100%', height: '100%', top: 0, position: 'absolute', 
          backgroundColor: '#000', zIndex: -999, opacity: this.state.dim ? 0.7 : 0, transition: 'opacity 300ms'}} />
        
        <div style={{ marginTop: 160, width: this.state.expanded ? 1024 : 448, backgroundColor: '#BBB', transition: 'width 300ms' }}>
          <div style={{width: '100%', position: 'relative', perspective: 1000}}>
            <TransitionGroup>
              { this.props.devices.length === 0 
                  ? <InfoCard {...cardProps} 
                      key='login-no-device' 
                      text='正在搜索网络上的WISNUC OS设备' 
                    /> 
                  : <DeviceCard {...cardProps}
                      key={`login-device-card-${this.state.selectIndex}`}
                      device={this.props.devices[this.state.selectIndex]}
                      backgroundColor={colorArray[this.state.selectIndex]}
                      onNavPrev={this.state.selectIndex === 0 ? null : this.navPrev}
                      onNavNext={this.state.selectIndex === this.props.devices.length - 1 ? null : this.navNext}
                      onResize={this.onResize}
                      toggleDim={this.toggleDim}
                    /> }
            </TransitionGroup>
          </div>
        </div>
      </div>
    )
  }
}

export default Login

