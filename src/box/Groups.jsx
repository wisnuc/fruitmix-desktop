import React from 'react'
import i18n from 'i18n'
import EventListener from 'react-event-listener'
import { CircularProgress, Paper, Avatar } from 'material-ui'
import ContentAdd from 'material-ui/svg-icons/content/add'
import FlatButton from '../common/FlatButton'
import BoxUploadButton from './BoxUploadButton'
import Tweets from './Tweets'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

const imgUrl = 'http://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKQiahrEc8rUfECDTUq94WlcaNkTYTKzIKr3p5xgOPQO1juvtwO1YSUCHOPpup3oWo1AP3nOBVyPCw/132'

class Inbox extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      hover: -1,
      box: null
    }

    this.handleResize = () => this.forceUpdate()

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.newBox = () => {
      console.log('this.newBox')
    }

    this.selectBox = (index) => {
      console.log('this.selectBox', index)
      if (!this.props.boxes[index]) return
      this.setState({ box: this.props.boxes[index] }, () => this.props.getTweets({ boxUUID: this.props.boxes[index].uuid }))
    }
  }

  componentDidMount() {
  }

  renderNoBoxes() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ flexGrow: 1 }} />
        <div style={{ color: 'rgba(0,0,0,0.54)' }}> { i18n.__('No Boxes in Groups Text 1') } </div>
        <div style={{ height: 16 }} />
        <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.27)' }}> { i18n.__('No Boxes in Groups Text 2') } </div>
        <div style={{ flexGrow: 1 }} />
      </div>
    )
  }

  renderAvatars(users) {
    const n = Math.min(users.length, 5)
    const r = 20 * n / (2.5 * n - 1.5) // radius
    return (
      <div style={{ height: 40, width: 40, position: 'relative' }}>
        {
          users.map((u, i) => {
            if (i > n - 1) return <div key={u} />
            const deg = Math.PI * (i * 2 / n - 1 / 4)
            const top = (1 - Math.cos(deg)) * (20 - r)
            const left = (1 + Math.sin(deg)) * (20 - r)
            return (
              <Avatar
                key={u}
                src={imgUrl}
                style={{
                  position: 'absolute',
                  width: r * 2,
                  height: r * 2,
                  top,
                  left
                }}
              />
            )
          })
        }
      </div>
    )
  }

  renderBox(box, index) {
    const { mtime, name, uuid, users } = box
    const hovered = this.state.hover === index
    return (
      <div
        key={uuid}
        onTouchTap={() => this.selectBox(index)}
        onMouseMove={() => !hovered && this.setState({ hover: index })}
        onMouseLeave={() => hovered && this.setState({ hover: -1 })}
        style={{
          height: 72,
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          border: '1px solid #EEEEEE',
          backgroundColor: hovered ? '#EEEEEE' : ''
        }}
      >
        <div style={{ width: 32 }} />
        {/* Avatar */}
        { this.renderAvatars(users) }
        <div style={{ width: 16 }} />
        <div style={{ width: 200 }} >
          <div style={{ height: 30, display: 'flex', alignItems: 'center' }} >
            { name }
          </div>
          <div style={{ height: 24, fontSize: 14, display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,.54)' }} >
            {'我发了个大红包哦！'}
          </div>
        </div>
        <div style={{ width: 64, textAlign: 'right', fontSize: 12, color: 'rgba(0,0,0,.54)' }}>
          { '45分钟前' }
        </div>
        <div style={{ width: 24 }} />
      </div>
    )
  }

  renderLoading(size) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={size || 64} />
      </div>
    )
  }

  render() {
    // console.log('Group', this.props, this.state)
    const currentBox = this.state.box || (this.props.boxes && this.props.boxes[0]) || null
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          overflow: 'hidden',
          alignItems: 'center'
        }}
      >
        <EventListener target="window" onResize={this.handleResize} />

        {/* boxes */}
        <div style={{ width: 376, height: '100%', overflow: 'auto' }}>
          {
            !this.props.boxes ? this.renderLoading(32) : (
              <div style={{ width: '100%', minHeight: '100%', position: 'relative', backgroundColor: '#FAFAFA' }}>
                <div style={{ height: 8 }} />
                <div style={{ marginLeft: 32, height: 24 }}>
                  <FlatButton
                    style={{ lineHeight: '', height: 24 }}
                    label={i18n.__('New Box')}
                    onTouchTap={this.newBox}
                    icon={<ContentAdd color="rgba(0,0,0,.54)" style={{ marginLeft: 4 }} />}
                    labelStyle={{ fontSize: 12, color: 'rgba(0,0,0,.54)', marginLeft: -4 }}
                  />
                </div>
                {
                  this.props.boxes.length > 0 ? this.props.boxes.map((b, i) => this.renderBox(b, i)) : this.renderNoBoxes()
                }
                <div style={{ height: 24 }} />
              </div>
            )
          }
        </div>

        {/* tweets */}
        <Tweets tweets={this.props.tweets} />

        {/* FAB */}
        {
          currentBox &&
            <BoxUploadButton
              box={currentBox}
              uploadMedia={this.uploadMedia}
              uploadFiles={this.uploadFiles}
              localUpload={this.props.localUpload}
            />
        }
      </div>
    )
  }
}

export default Inbox
