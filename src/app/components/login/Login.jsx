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

// props.overly: dim, white, or whatever
class Background extends React.PureComponent {

  render() {
    return (
      <div style={{position: 'absolute', width: '100%', height: '100%'}}> 
        <img style={{ position: 'absolute', width: '100%', height: '100%', 
          zIndex: -1000 }} src='../src/assets/images/index/index.jpg' />
        <div style={{ position: 'absolute', width: '100%', height: '100%', 

          backgroundColor: this.props.overlay === 'white'
            ? 'rgba(255,255,255,1)' 
            : this.props.overlay === 'dim'
              ? 'rgba(0,0,0,0.7)'
              : 'rgba(0,0,0,0)',

          zIndex: -999, transition: 'backgroundColor 300ms'
        }}/>
      </div>
    )
   }
}

// autoLogin, autoLoginTimeout, preferredLanding
// 
class Login extends React.Component {

  constructor(props) {

    super(props)

    this.duration = 0.4

    this.state = {

      stage: 'entering', // 'entered', 'leaving'
      selectIndex: -1,
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

      let nextState = Object.assign({}, this.state, { selectIndex: index })
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

      let nextState = Object.assign({}, this.state, { selectIndex: index })
      this.setState(nextState)

      debug('select prev device', selectIndex, index)
    }


    // for leaving children, there is no way to update props, but this state is required for animation
    // so we put it directly in container object, and pass callbacks which can access this state
    // to the children
    this.enter = 'bottom'

    this.navPrev = () => {
      this.enter = 'left'
      this.selectPrevDevice()
    }

    this.navNext = () => {
      this.enter = 'right'
      this.selectNextDevice()
    }

    this.navUp = () => {
      this.enter = 'bottom'
    }

    this.navDown = () => {
      this.enter = 'top'
    }

    this.toggleDim = () => this.setState(state => ({ dim: !state.dim }))
  }

  cardWillEnter(el, callback) {

    if (this.enter === 'right') {
      TweenMax.from(el, this.duration, {
        delay: this.duration,
        opacity: 0,
        right: -374,
        onComplete: () => callback()
      })
    }
    else if (this.enter === 'left') {
      TweenMax.from(el, this.duration, {
        delay: this.duration,
        opacity: 0,
        transformOrigin: 'left center',
        transform: 'translateZ(-64px) rotateY(45deg)',
        onComplete: () => callback()
      })
    }
    else if (this.enter === 'bottom') {
      TweenMax.from(el, this.duration, {
        delay: this.duration,
        opacity: 0,
        top: 50,
        onComplete: () => callback()
      })
    }
    else if (this.enter === 'top') {
      TweenMax.from(el, this.duration, {
        delay: this.duration,
        opacity: 0,
        top: -50,
        onComplete: () => callback()
      })
    }
  }

  cardWillLeave(el, callback) {

    if (this.enter === 'left') {
      TweenMax.to(el, this.duration, {
        opacity: 0,
        right: -374,
        onComplete: () => callback()
      })
    }
    else if (this.enter === 'right') {
      TweenMax.to(el, this.duration, {
        opacity: 0,
        transformOrigin: 'left center',
        transform: 'translateZ(-64px) rotateY(45deg)',
        onComplete: () => callback()
      })
    }
    else if (this.enter === 'bottom') {
      TweenMax.to(el, this.duration, {
        opacity: 0,
        top: -50,
        onComplete: () => callback() 
      })
    }
    else if (this.enter === 'top') {
      TweenMax.to(el, this.duration, {
        opacity: 0,
        top: 50,
        onComplete: () => callback()
      })
    }
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
			style: { position: 'absolute', width: 448, right: -224, display: 'flex', flexDirection: 'column', alignItems: 'center' },
			onWillEnter: this.cardWillEnter.bind(this),
			onWillLeave: this.cardWillLeave.bind(this)
    }

    return (
      <div style={{width: '100%', height: '100%'}}>

        <Background overlay={this.state.dim ? 'dim' : 'none'} />

        <div style={{width: '100%', height: '100%', display:'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{flexBasis: '160px'}} />
          <div style={{perspective: 1000}}>
            <TransitionGroup component='div'>
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

