import React from 'react'
import { Paper, Dialog, TextField } from 'material-ui'
import Debug from 'debug'
import SlideToAnimate from './SlideToAnimate'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:photoApp:Carousel:')
const MARGIN_DISTANCE = 60
const PART_HEIGHT = 45

export default class Carousel extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      open: false
    }

    this.handleOpen = () => {
      this.setState({ open: true })
    }

    this.handleClose = () => {
      this.setState({ open: false })
    }
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
          <FlatButton label="分享" disabled />
          <FlatButton
            label="创建相册"
            onTouchTap={() => this.setState({ open: true })}
          />
          <FlatButton label="下载" disabled />
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
    const mediaPath = '../media/'
    debug('items', items)
    return (
      <div style={style}>
        { items.map(item => (
          <div style={{ flexShrink: 0, flexGrow: 0, marginRight: 10 }} key={item.toString()} >
            <div style={{ borderRadius: 4, width: 90, height: 90, overflow: 'hidden' }}>
              <img
                alt="img"
                src={`${mediaPath}${item}&height=210&width=210`}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
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

  render() {
    const { style, items } = this.props
    const actions = [
      <FlatButton
        label="取消"
        primary
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="确定"
        primary
        keyboardFocused
        onTouchTap={() => {
          this.props.creatAlbum(this.props.items, this.refTitle, this.refText)
          this.props.ClearAll()
          this.handleClose()
        }}
      />
    ]
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
        <Dialog
          title="创建相册"
          actions={actions}
          modal
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          <span>相册名称:</span>
          <br />
          <TextField
            hintText="标题"
            onChange={(event, value) => (this.refTitle = value)}
          />
          <br />
          <span>相册说明:</span>
          <br />
          <TextField
            hintText="说明"
            onChange={(event, value) => (this.refText = value)}
          />
        </Dialog>
      </div>
    )
  }
}
