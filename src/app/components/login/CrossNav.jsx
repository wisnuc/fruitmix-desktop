import { TweenMax } from 'gsap'
import React, { Component } from 'react'
import TransitionGroup from 'react-addons-transition-group'

class CrossNav extends React.Component {

  constructor(props) {
    super()
  }

  cardWillEnter(el, callback) {

    const { enter, duration } = this.props

    if (enter === 'right') {
      TweenMax.from(el, duration, {
        delay: duration,
        opacity: 0,
        right: -374,
        onComplete: () => callback()
      })
    }
    else if (enter === 'left') {
      TweenMax.from(el, duration, {
        delay: duration,
        opacity: 0,
        transformOrigin: 'left center',
        transform: 'translateZ(-64px) rotateY(45deg)',
        onComplete: () => callback()
      })
    }
    else if (enter === 'bottom') {
      TweenMax.from(el, duration, {
        delay: duration,
        opacity: 0,
        top: 60,
        onComplete: () => callback()
      })
    }
    else if (enter === 'top') {
      TweenMax.from(el, duration, {
        delay: duration,
        opacity: 0,
        top: -60,
        onComplete: () => callback()
      })
    }
  }

  cardWillLeave(el, callback) {

    const { enter, duration } = this.props

    if (enter === 'left') {
      TweenMax.to(el, duration, {
        opacity: 0,
        right: -374,
        onComplete: () => callback()
      })
    }
    else if (enter === 'right') {
      TweenMax.to(el, duration, {
        opacity: 0,
        transformOrigin: 'left center',
        transform: 'translateZ(-64px) rotateY(45deg)',
        onComplete: () => callback()
      })
    }
    else if (enter === 'bottom') {
      TweenMax.to(el, duration, {
        opacity: 0,
        top: -60,
        onComplete: () => callback() 
      })
    }
    else if (enter === 'top') {
      TweenMax.to(el, duration, {
        opacity: 0,
        top: 60,
        onComplete: () => callback()
      })
    }
  }

  render() {

    let cardProps = {
			style: { position: 'absolute', width: 448, right: -224, 
        display: 'flex', flexDirection: 'column', alignItems: 'center' },
			onWillEnter: this.cardWillEnter.bind(this),
			onWillLeave: this.cardWillLeave.bind(this)
    }

    return (
      <div style={{perspective: 1000}}>
        <TransitionGroup component='div'>
          { React.cloneElement(this.props.children, cardProps) }
        </TransitionGroup>
      </div>
    )
  }
}

export default CrossNav

