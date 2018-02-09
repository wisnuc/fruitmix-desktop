import React from 'react'
import UUID from 'uuid'
import i18n from 'i18n'
import EventListener from 'react-event-listener'
import { CircularProgress, Paper, Avatar } from 'material-ui'
import ContentAdd from 'material-ui/svg-icons/content/add'

import UserSelect from './UserSelect'
import Tweets from './Tweets'
import SelectFile from './SelectFile'
import SelectMedia from './SelectMedia'
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

    this.newBox = (users) => {
      const stationId = this.props.station.id
      const args = { name: '', users: [this.props.guid, ...(users.map(u => u.id))], stationId }
      this.props.apis.pureRequest('createBox', args, (err, res) => {
        console.log('this.newBox', args, err, res)
        this.setState({ newBox: false })
        if (err) this.props.openSnackBar(i18n.__('Create Box Failed'))
        else this.props.openSnackBar(i18n.__('Create Box Success'))
        this.props.refresh()
      })
    }

    this.createNasTweets = (args) => {
      this.props.apis.pureRequest('nasTweets', args, (err, res) => {
        if (err) {
          console.log('create nasTweets error', err)
          this.props.openSnackBar(i18n.__('Send Tweets with Nas Files Failed'))
        }
        this.props.refresh()
      })
    }

    this.selectBox = (index) => {
      console.log('this.selectBox', index)
      if (!this.props.boxes[index]) return
      this.props.getTweets(this.props.boxes[index], true)
    }

    this.localUpload = (args) => {
      console.log('this.localUpload', args)
      const { type, comment, box } = args
      const session = UUID.v4()
      this.props.ipcRenderer.send('BOX_UPLOAD', Object.assign({ session }, args))
    }

    this.onFakeData = (event, args) => {
      const { session, boxUUID, success, fakeList } = args
      console.log('this.onFakeData', args)
      if (!success) {
        this.props.openSnackBar(i18n.__('Read Local Files Failed'))
      } else {
        this.props.updateFakeTweet({ fakeList, boxUUID })
      }
    }

    this.onLocalFinish = (event, args) => {
      const { session, boxUUID, success } = args
      if (!success) {
        this.props.openSnackBar(i18n.__('Send Tweets with Local Files Failed'))
      } else if (this.props.currentBox && this.props.currentBox.uuid === boxUUID) {
        // console.log('this.onLocalFinish success')
        this.props.getTweets(this.props.currentBox)
      }
    }

    this.onScroll = top => this.refBar && (this.refBar.style.top = `${top}px`)
  }

  componentDidMount() {
    this.props.ipcRenderer.on('BOX_UPLOAD_FAKE_DATA', this.onFakeData)
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
            if (i > n - 1) return <div key={u.id} />
            const deg = Math.PI * (i * 2 / n - 1 / 4)
            const top = (1 - Math.cos(deg)) * (20 - r)
            const left = (1 + Math.sin(deg)) * (20 - r)
            return (
              <Avatar
                key={u.id}
                src={u.avatarUrl}
                style={{
                  position: 'absolute', width: r * 2, height: r * 2, boxSizing: 'border-box', top, left, border: 'solid 1px #FFF'
                }}
              />
            )
          })
        }
      </div>
    )
  }

  renderBox({ key, index, style }) {
    const box = this.props.boxes[index]
    const { ltime, name, uuid, users, lcomment } = box
    const selected = this.props.currentBox && (this.props.currentBox.uuid === uuid)
    const hovered = this.state.hover === index

    /* width: 376 = 2 + 32 + 40 + 16 + 142 + 120 + 24 + 16 */
    return (
      <div key={key} style={style}>
        <div
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
            backgroundColor: selected ? '#EEEEEE' : hovered ? '#F5F5F5' : ''
          }}
        >
          <div style={{ width: 32 }} />
          {/* Avatar */}
          { this.renderAvatars(users) }
          <div style={{ width: 16 }} />
          <div style={{ width: 142 }} >
            <div style={{ height: 30, display: 'flex', alignItems: 'center' }} >
              <div style={{ width: 142, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                { name || i18n.__('Group Chat (%d)', users.length) }
              </div>
            </div>
            <div
              style={{
                width: 144,
                height: 24,
                fontSize: 14,
                color: 'rgba(0,0,0,.54)',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              { lcomment }
            </div>
          </div>
          <div style={{ width: 120, textAlign: 'right', fontSize: 12, color: 'rgba(0,0,0,.54)' }}>
            { parseTime(ltime) }
          </div>
          <div style={{ width: 24 }} />
        </div>
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
    const { boxes, currentBox, station, guid, tweets, ipcRenderer, apis } = this.props
    const { primaryColor, refresh, openSnackBar, getUsers, tError } = this.props
    const boxH = boxes && Math.min(window.innerHeight - 106, boxes.length * 72) || 0
    const boxUUID = currentBox && currentBox.uuid
    const stationId = currentBox && currentBox.stationId
    return (
      <div
        style={{
          position: 'relative',
          width: 'calc(100% + 8px)',
          height: 'calc(100% + 8px)',
          marginLeft: -8,
          marginTop: -8,
          display: 'flex',
          overflow: 'hidden',
          alignItems: 'center'
        }}
      >
        <EventListener target="window" onResize={this.handleResize} />

        {/* boxes */}
        <div style={{ width: 376, height: '100%', overflow: 'auto' }}>
          {
            !boxes ? this.renderLoading(32) : (
              <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#FFF', overflow: 'hidden' }}>
                <div style={{ height: 8 }} />
                {/* new Box */}
                <div style={{ marginLeft: 32, height: 24 }}>
                  <FlatButton
                    style={{ lineHeight: '', height: 24 }}
                    label={i18n.__('New Box')}
                    onTouchTap={() => this.setState({ newBox: true })}
                    disabled={!station || !station.id}
                    icon={<ContentAdd color="rgba(0,0,0,.54)" style={{ marginLeft: 4 }} />}
                    labelStyle={{ fontSize: 12, color: 'rgba(0,0,0,.54)', marginLeft: -4 }}
                  />
                </div>

                {/* Boxes: react-virtualized with custom scrollBar */}
                {
                  boxes.length > 0 ?
                    <ScrollBar
                      style={{ outline: 'none' }}
                      allHeight={72 * boxes.length}
                      height={boxH}
                      width={376}
                      rowCount={boxes.length}
                      rowHeight={72}
                      rowRenderer={({ index, key, style }) => this.renderBox({ index, key, style })}
                    />
                    : this.renderNoBoxes()
                }
              </div>
            )
          }
        </div>

        {/* tweets */}
        <Tweets
          tError={tError}
          guid={guid}
          tweets={tweets}
          box={currentBox}
          ipcRenderer={ipcRenderer}
          apis={apis}
        />

        {/* FAB */}
        {
          boxUUID &&
            <BoxUploadButton
              box={currentBox}
              stationId={stationId}
              toggleView={this.toggleView}
              localUpload={this.localUpload}
              offline={false}
              diffStation={station && station.id !== stationId}
            />
        }

        {
          this.state.view === 'file' &&
            <SelectFile
              apis={apis}
              guid={guid}
              boxUUID={boxUUID}
              stationId={stationId}
              refresh={refresh}
              ipcRenderer={ipcRenderer}
              primaryColor={primaryColor}
              openSnackBar={openSnackBar}
              createNasTweets={this.createNasTweets}
              onRequestClose={() => this.setState({ view: '' })}
            />
        }

        {
          this.state.view === 'media' &&
            <SelectMedia
              apis={apis}
              guid={guid}
              boxUUID={boxUUID}
              stationId={stationId}
              refresh={refresh}
              ipcRenderer={ipcRenderer}
              primaryColor={primaryColor}
              openSnackBar={openSnackBar}
              createNasTweets={this.createNasTweets}
              onRequestClose={() => this.setState({ view: '' })}
            />
        }
        {/* dialog */}
        <DialogOverlay open={!!this.state.newBox} onRequestClose={() => this.setState({ newBox: false })}>
          {
            this.state.newBox &&
            <UserSelect
              fire={this.newBox}
              defaultUsers={[guid]}
              primaryColor={primaryColor}
              actionLabel={i18n.__('Create')}
              title={i18n.__('Create New Box')}
              getUsers={getUsers}
            />
            }
        </DialogOverlay>
      </div>
    )
  }
}

export default Groups
