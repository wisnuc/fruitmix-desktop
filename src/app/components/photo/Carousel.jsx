import React, { Component, PropTypes } from 'react'
import { Paper } from 'material-ui'
import SlideToAnimate from './SlideToAnimate'
import FlatButton from '../common/FlatButton'

const MARGIN_DISTANCE = 60
const PART_HEIGHT = 45

export default class Carousel extends Component {
  constructor(props) {
    super(props)
  }
  CarouselTopBar = () => (
    <div
      style={{
        marginLeft: MARGIN_DISTANCE,
        marginRight: MARGIN_DISTANCE,
        height: PART_HEIGHT,
        lineHeight: `${PART_HEIGHT}px`
      }}
    >
      <div style={{ clear: 'both' }}>
        <div style={{ float: 'left' }}>
          <FlatButton label="分享" />
          <FlatButton label="相册" />
          <FlatButton label="下载" />
        </div>
        <div style={{ float: 'right' }}>
          <FlatButton
            label="清除全部"
            onTouchTap={this.props.ClearAll}
          />
        </div>
      </div>
    </div>
  )
  CarouselList = (props) => {
    const { style, items } = props
    return (
      <div style={style}>
        { items.map(item => (
          <div style={{ flexShrink: 0, flexGrow: 0, marginRight: 10 }} key={item.toString()} >
            <div style={{ borderRadius: 4, width: 90, height: 90, overflow: 'hidden' }}>
              <img src={item} alt="img" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </div>
          </div>
        ))
        }
      </div>
    )
  }

  CarouselBottomBar = (props) => {
    const { style, count } = props
    return (
      <div style={style}>
        <span style={{ fontSize: 14, opacity: 0.87 }}>选中<b>{ count }</b>张照片</span>
      </div>
    )
  }

  shouldComponentUpdate(nextProps) {
    return this.props !== nextProps
  }
  render() {
    const { style, items } = this.props
    return (
      <div style={style}>
        <div style={{ width: '100%' }}>
          <this.CarouselTopBar />

          <SlideToAnimate
            style={{
              marginLeft: MARGIN_DISTANCE,
              marginRight: MARGIN_DISTANCE,
              height: 90
            }}
            direLeft={-45}
            direRight={-45}
            translateCount={items.length}
            translateGrep={10}
            translateDistance={90}
          >
            <this.CarouselList items={items} style={{ display: 'flex', flexFlow: 'row nowrap', justifyContent: 'flex-start' }} />
          </SlideToAnimate>
          <this.CarouselBottomBar
            style={{
              marginLeft: MARGIN_DISTANCE,
              marginRight: MARGIN_DISTANCE,
              textAlign: 'center',
              height: PART_HEIGHT,
              lineHeight: `${PART_HEIGHT}px`
            }}
            count={items.length}
          />
        </div>
      </div>
    )
  }
}

Carousel.propTypes = {
  style: PropTypes.objectOf(React.PropTypes.string).isRequired,
  items: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
}
