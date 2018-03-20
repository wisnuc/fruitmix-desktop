import React from 'react'
import { TweenMax } from 'gsap'
import TransitionGroup from 'react-transition-group/TransitionGroup'

class CrossNav extends React.Component {
  cardWillEnter (el, callback) {
    const { enter, duration } = this.props

    if (enter === 'right') {
      TweenMax.from(el, duration, {
        delay: duration,
        opacity: 0,
        right: -374,
        onComplete: () => callback()
      })
    } else if (enter === 'left') {
      TweenMax.from(el, duration, {
        delay: duration,
        opacity: 0,
        transformOrigin: 'left center',
        transform: 'translateZ(-64px) rotateY(45deg)',
        onComplete: () => callback()
      })
    } else if (enter === 'bottom') {
      TweenMax.from(el, duration, {
        delay: duration,
        opacity: 0,
        top: 60,
        onComplete: () => callback()
      })
    } else if (enter === 'top') {
      TweenMax.from(el, duration, {
        delay: duration,
        opacity: 0,
        top: -60,
        onComplete: () => callback()
      })
    } else if (enter === 'none') {
      TweenMax.from(el, duration, {
        delay: duration,
        opacity: 0,
        onComplete: () => callback()
      })
    }
  }

  cardWillLeave (el, callback) {
    const { enter, duration } = this.props

    if (enter === 'left') {
      TweenMax.to(el, duration, {
        opacity: 0,
        right: -374,
        onComplete: () => callback()
      })
    } else if (enter === 'right') {
      TweenMax.to(el, duration, {
        opacity: 0,
        transformOrigin: 'left center',
        transform: 'translateZ(-64px) rotateY(45deg)',
        onComplete: () => callback()
      })
    } else if (enter === 'bottom') {
      TweenMax.to(el, duration, {
        opacity: 0,
        top: -60,
        onComplete: () => callback()
      })
    } else if (enter === 'top') {
      TweenMax.to(el, duration, {
        opacity: 0,
        top: 60,
        onComplete: () => callback()
      })
    }
  }

  render () {
    const cardProps = {
      style: { position: 'absolute',
        width: 380,
        right: -190,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center' },
      onWillEnter: this.cardWillEnter.bind(this),
      onWillLeave: this.cardWillLeave.bind(this)
    }

    return (
      <div style={{ perspective: 1000 }}>
        <TransitionGroup component="div">
          { React.cloneElement(this.props.children, cardProps) }
        </TransitionGroup>
      </div>
    )
  }
}

export default CrossNav
