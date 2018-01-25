import React from 'react'
import UUID from 'uuid'
import i18n from 'i18n'
import EventListener from 'react-event-listener'
import { CircularProgress, Paper, Avatar } from 'material-ui'
import ContentAdd from 'material-ui/svg-icons/content/add'

import NewBox from './NewBox'
import Tweets from './Tweets'
import SelectNas from './SelectNas'
import BoxUploadButton from './BoxUploadButton'

import FlatButton from '../common/FlatButton'
import { parseTime } from '../common/datetime'
import DialogOverlay from '../common/DialogOverlay'
import ScrollBar from '../common/ScrollBar'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

const imgUrl = 'http://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKQiahrEc8rUfECDTUq94WlcaNkTYTKzIKr3p5xgOPQO1juvtwO1YSUCHOPpup3oWo1AP3nOBVyPCw/132'

class Groups extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      view: '', // view of selecting upload files or media
      hover: -1,
      newBox: false
    }

    this.handleResize = () => this.forceUpdate()

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.toggleView = (view) => {
      console.log('view', view)
      this.setState({ view })
    }

    this.newBox = () => {
      console.log('this.newBox')
      this.setState({ newBox: true })
    }

    this.selectBox = (index) => {
      console.log('this.selectBox', index)
      if (!this.props.boxes[index]) return
      this.props.getTweets({ boxUUID: this.props.boxes[index].uuid })
    }

    this.localUpload = (args) => {
      console.log('this.localUpload', args)
      const { type, comment, boxUUID } = args
      const session = UUID.v4()
      this.props.ipcRenderer.send('BOX_UPLOAD', { session, type, comment, boxUUID, bToken: this.props.boxToken.token })
    }

    this.onLocalFinish = (event, args) => {
      const { session, boxUUID, success } = args
      if (this.props.currentBox && this.props.currentBox === boxUUID) {
        this.props.getTweets({ boxUUID })
      }
    }

    this.onScroll = top => this.refBar && (this.refBar.style.top = `${top}px`)
  }

  componentDidMount() {
    this.props.ipcRenderer.on('BOX_UPLOAD_RESULT', this.onLocalFinish)
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
    const { ltime, name, uuid, users, lcomment } = box
    const hovered = this.state.hover === index
    /* width: 376 = 2 + 32 + 40 + 16 + 142 + 120 + 24 + 16 */
    return (
      <div
        key={uuid}
        onTouchTap={() => this.selectBox(index)}
        onMouseMove={() => !hovered && this.setState({ hover: index })}
        onMouseLeave={() => hovered && this.setState({ hover: -1 })}
        style={{
          height: 72,
          width: 376,
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
        <div style={{ width: 142 }} >
          <div style={{ height: 30, display: 'flex', alignItems: 'center' }} >
            { name }
          </div>
          <div style={{ height: 24, fontSize: 14, display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,.54)' }}>
            { lcomment }
          </div>
        </div>
        <div style={{ width: 120, textAlign: 'right', fontSize: 12, color: 'rgba(0,0,0,.54)' }}>
          { parseTime(ltime) }
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
    const boxH = this.props.boxes && Math.min(window.innerHeight - 106, this.props.boxes.length * 72)
    const { boxes } = this.props
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
        <div style={{ width: 376, height: '100%', overflow: 'auto' }} key={window.innerHeight}>
          {
            !boxes ? this.renderLoading(32) : (
              <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#FAFAFA', overflow: 'hidden' }}>
                <div style={{ height: 8 }} />
                {/* new Box */}
                <div style={{ marginLeft: 32, height: 24 }}>
                  <FlatButton
                    style={{ lineHeight: '', height: 24 }}
                    label={i18n.__('New Box')}
                    onTouchTap={this.newBox}
                    icon={<ContentAdd color="rgba(0,0,0,.54)" style={{ marginLeft: 4 }} />}
                    labelStyle={{ fontSize: 12, color: 'rgba(0,0,0,.54)', marginLeft: -4 }}
                  />
                </div>

                {/* Boxes: react-virtualized with custom scrollBar */}
                {
                  boxes.length > 0 ?
                    <ScrollBar
                      key={window.innerHeight}
                      allHeight={72 * boxes.length}
                      style={{ outline: 'none', boxSizing: 'border-box', position: 'absolute', top: 0, left: 0 }}
                      height={boxH}
                      width={376}
                      rowCount={boxes.length}
                      rowHeight={72}
                      rowRenderer={({ index }) => this.renderBox(this.props.boxes[index], index)}
                    />
                    : this.renderNoBoxes()
                }
              </div>
            )
          }
        </div>

        {/* tweets */}
        <Tweets
          guid={this.props.guid}
          tweets={this.props.tweets}
          boxUUID={this.props.currentBox}
          ipcRenderer={this.props.ipcRenderer}
        />

        {/* FAB */}
        {
          this.props.currentBox &&
            <BoxUploadButton
              boxUUID={this.props.currentBox}
              toggleView={this.toggleView}
              localUpload={this.localUpload}
            />
        }
        {
          this.state.view &&
            <SelectNas
              view={this.state.view}
              ipcRenderer={this.props.ipcRenderer}
              primaryColor={this.props.primaryColor}
              boxUUID={this.props.currentBox}
              addMedia={this.addMedia}
              addFile={this.addFile}
              apis={this.props.apis}
              guid={this.props.guid}
              onRequestClose={() => this.setState({ view: '' })}
            />
        }
        {/* dialog */}
        <DialogOverlay open={!!this.state.newBox} onRequestClose={() => this.setState({ newBox: false })}>
          {
            this.state.newBox &&
            <NewBox
              apis={this.props.apis}
              guid={this.props.guid}
              refresh={this.props.refresh}
              title={i18n.__('Create Box Title')}
              hintText={i18n.__('Create Box Hint')}
              openSnackBar={this.props.openSnackBar}
            />
            }
        </DialogOverlay>
      </div>
    )
  }
}

export default Groups
