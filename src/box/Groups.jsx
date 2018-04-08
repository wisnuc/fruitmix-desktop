import React from 'react'
import UUID from 'uuid'
import i18n from 'i18n'
import EventListener from 'react-event-listener'
import { CircularProgress, Avatar } from 'material-ui'
import InfoIcon from 'material-ui/svg-icons/action/info'
import ContentAdd from 'material-ui/svg-icons/content/add'

import UserSelect from './UserSelect'
import Tweets from './Tweets'
import SelectFile from './SelectFile'
import SelectMedia from './SelectMedia'
import BoxUploadButton from './BoxUploadButton'

import FlatButton from '../common/FlatButton'
import { parseFullTime, parseTime } from '../common/datetime'
import DialogOverlay from '../common/DialogOverlay'
import ScrollBar from '../common/ScrollBar'

/*
 * Rules to show timestamp
 *
 * 1. First tweet
 * 2. last tweets's time is more than 3 min ago and is newer than the latest timestamp
 * 3. last timestamp is more than 5 min ago
 *
 */
const addTweetsTime = (tweets) => {
  /* if not array or length eq 0, return the input */
  if (!Array.isArray(tweets) || !tweets.length) return tweets
  /* add the time msg */
  let lt = 0 // last timestamp
  const adjTweets = tweets.reduce((acc, cur, idx, arr) => {
    if (!idx || (cur.ctime - arr[idx - 1].ctime > 3 * 60 * 1000 && cur.ctime > lt) || cur.ctime - lt > 5 * 60 * 1000) {
      const msg = Object.assign({}, cur, { type: 'boxmessage', msg: parseFullTime(cur.ctime) })
      acc.push(msg)
      lt = cur.ctime
    }
    acc.push(cur)
    return acc
  }, [])
  return adjTweets
}

class Groups extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      view: '', // view of selecting upload files or media
      hover: -1,
      newBox: false
    }

    this.tcQueue = [] // the tweet creating queue

    this.pushQueue = (uuid) => {
      const index = this.tcQueue.indexOf(uuid)
      if (index === -1) this.tcQueue.push(uuid)
    }

    this.popQueue = (uuid) => {
      const index = this.tcQueue.indexOf(uuid)
      if (index > -1) this.tcQueue.splice(index, 1)
    }

    /* set failed, excepting : 1. not fake, 2. finished, 3. running */
    this.setFakeTweetState = ts => ts && ts.map(t => ((!t.faked || t.finished || this.tcQueue.indexOf(t.uuid) > -1) ? t
      : Object.assign({}, t, { failed: true })))

    this.sessions = {} // store tweets for local upload

    this.WIP = null // Working in Process for requesting new tweet

    this.handleResize = () => this.forceUpdate()

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.toggleView = (view) => {
      this.setState({ view })
    }

    this.openNewBox = () => {
      if (!window.navigator.onLine) this.props.openSnackBar(i18n.__('Offline Text'))
      else this.setState({ newBox: true })
    }

    this.newBox = (users) => {
      const stationId = this.props.station.id
      const args = { name: '', users: [this.props.guid, ...(users.map(u => u.id))], stationId }
      this.props.apis.pureRequest('createBox', args, (err, res) => {
        this.setState({ newBox: false })
        if (err) this.props.openSnackBar(i18n.__('Create Box Failed'))
        else this.props.openSnackBar(i18n.__('Create Box Success'))
        if (res && res.uuid) this.props.refresh({ boxUUID: res.uuid })
      })
    }

    this.createNasTweets = (args, retryTweet) => {
      const { list, boxUUID, isMedia } = args
      const box = this.props.boxes.find(b => b.uuid === boxUUID)
      const fakeList = list.map(l => Object.assign({ fakedata: {} }, l))
      /* create the fake tweet */
      const tweet = retryTweet || this.updateFakeTweet({ fakeList, box, isMedia, raw: { type: 'indrive', args } })
      this.pushQueue(tweet.uuid)
      this.props.apis.pureRequest('nasTweets', args, (err, res) => {
        if (err || !res || !res.uuid) {
          console.error('create nasTweets error', err)
          const newTweet = Object.assign({}, tweet, { failed: true })
          this.popQueue(tweet.uuid)
          this.updateDraft(newTweet)
        } else {
          // console.log('create nasTweets success', res)
          const newTweet = Object.assign({}, tweet, { trueUUID: res.uuid, finished: true })
          this.popQueue(tweet.uuid)
          this.updateDraft(newTweet)
        }
      })
    }

    this.updateDraft = (tweet) => {
      this.props.ada.updateDraft(tweet.boxUUID, tweet)
        .catch(error => console.error('this.updateDraft error', error))
      const index = this.state.tweets.findIndex(t => t.uuid === tweet.uuid)
      const tweets = [...this.state.tweets.slice(0, index), tweet, ...this.state.tweets.slice(index + 1)]
      if (index > -1) this.setState({ tweets })
    }

    this.retryLocalUpload = (entries, args, tweet) => {
      const session = UUID.v4()
      this.sessions[session] = tweet
      this.pushQueue(tweet.uuid)
      this.props.ipcRenderer.send('BOX_RETRY_UPLOAD', { entries, args: Object.assign(args, { session }) })
    }

    this.retry = (tweet) => {
      const { raw } = tweet
      const newTweet = Object.assign({}, tweet, { failed: false })
      const { type, args, entries } = raw
      if (type === 'indrive') this.createNasTweets(args, tweet)
      else this.retryLocalUpload(entries, args, tweet)
      this.updateDraft(newTweet)
    }

    this.getTweets = (box, showLoading) => {
      if (showLoading) this.setState({ tweets: null, tError: false }) // show loading state, such as the selected box changed

      this.props.ada.removeAllListeners('tweets')
      this.props.ada.getTweets(box.uuid).then((tweets) => {
        this.WIP = null
        this.updateTweets(box, tweets)
      }).catch((e) => {
        console.error('loadTweets error', e)
        this.WIP = null
        this.setState({ tError: true })
      })
    }

    this.updateTweets = (box, tweets) => {
      this.preBox = box
      const getAuthor = id => box.users.find(u => u.id === id) || { id, nickName: i18n.__('Leaved Member') }
      this.setState({
        tError: false,
        tweets: (tweets || [])
          .map(t => Object.assign({ author: getAuthor(t.tweeter.id), box, msg: this.props.getMsg(t, box) }, t))
          .filter(t => t.type !== 'boxmessage' || (t.msg && t.author.avatarUrl)),
        currentBox: box
      })
    }

    this.updateFakeTweet = ({ fakeList, box, isMedia, raw }) => {
      // console.log('this.updateFakeTweet', this.state)
      const author = box.users.find(u => u.id === this.props.guid) || { id: this.props.guid }
      const uuid = UUID.v4()
      const tweet = {
        raw, // the original request args
        uuid,
        author,
        isMedia,
        tweeter: author,
        box,
        boxUUID: box.uuid,
        comment: '',
        ctime: new Date().getTime(),
        rtime: new Date().getTime(),
        index: this.state.tweets.length - 1,
        list: fakeList,
        msg: '',
        stationId: this.props.currentBox.stationId,
        type: 'list',
        faked: true,
        _id: uuid
      }

      this.props.ada.createDraft(tweet).catch(e => console.error('this.updateDraft error', e))
      setImmediate(() => this.setState({ tweets: [...this.state.tweets, tweet] })) // set new state after tcQueue updated
      return tweet
    }

    this.localUpload = (args) => {
      const session = UUID.v4()
      this.props.ipcRenderer.send('BOX_UPLOAD', Object.assign({ session }, args))
    }

    this.onFakeData = (event, args) => {
      const { session, box, success, fakeList, raw } = args
      // const { session, box, success, fakeList, raw, error } = args
      if (!success) {
        const text = i18n.__('Read Local Files Failed')

        /* TODO
        if (error && error.code === 'ELARGE') text = i18n.__('Too Large File in Box Uploading')
        else if (error && error.code === 'ENOTFILE') text = i18n.__('Unsupported File Type in Box Uploading')
        */

        this.props.openSnackBar(text)
      } else {
        const tweet = this.updateFakeTweet({ fakeList, box, raw })
        this.pushQueue(tweet.uuid)
        this.sessions[session] = tweet
      }
    }

    this.onLocalFinish = (event, args) => {
      const { session, box, success, data } = args
      const tweet = this.sessions[session]
      if (!tweet) return
      if (!success) {
        this.props.openSnackBar(i18n.__('Send Tweets with Local Files Failed'))
        const newTweet = Object.assign({}, tweet, { failed: true, boxUUID: box.uuid })
        this.popQueue(tweet.uuid)
        this.updateDraft(newTweet)
      } else {
        // console.log('create tweets via local success', data)
        const newTweet = Object.assign({}, tweet, { finished: true, trueUUID: data.uuid, boxUUID: box.uuid })
        this.popQueue(tweet.uuid)
        this.updateDraft(newTweet)
      }
    }

    this.onScroll = top => this.refBar && (this.refBar.style.top = `${top}px`)
  }

  componentDidMount () {
    this.props.ipcRenderer.on('BOX_UPLOAD_FAKE_DATA', this.onFakeData)
    this.props.ipcRenderer.on('BOX_UPLOAD_RESULT', this.onLocalFinish)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.currentBox) {
      /* check if change box */
      const nextBoxUUID = nextProps.currentBox && nextProps.currentBox.uuid
      const currBoxUUID = this.preBox && this.preBox.uuid
      const showLoading = !(nextBoxUUID && currBoxUUID && nextBoxUUID === currBoxUUID)

      /* check if have new stored tweets */
      const lti = nextProps.currentBox.ltsst && nextProps.currentBox.ltsst.index // last tweet's rtime
      const currentTweet = this.state.tweets && this.state.tweets.slice(-1)[0]
      const cti = currentTweet && currentTweet.index // current latest tweet's ctime
      // console.log('before getTweets', nextProps.currentBox, currentTweet)
      if ((!showLoading && lti && lti <= cti) || this.WIP === nextBoxUUID) return // same box and no new tweets
      // console.log('will getTweets', showLoading, lti, cti, this.WIP)
      this.WIP = nextBoxUUID
      this.getTweets(nextProps.currentBox, showLoading)
    }
  }

  componentWillUnmount () {
    this.props.ipcRenderer.removeAllListeners('BOX_UPLOAD_FAKE_DATA')
    this.props.ipcRenderer.removeAllListeners('BOX_UPLOAD_RESULT')
  }

  renderNoBoxes () {
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

  renderAvatars (users) {
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

  renderBox ({ key, index, style }) {
    const box = this.props.boxes[index]
    const { ltime, name, uuid, users, lcomment, nmc, station, deleted } = box
    const isOffline = !(station && station.isOnline)
    const selected = this.props.currentBox && (this.props.currentBox.uuid === uuid)
    const hovered = this.state.hover === index
    const newMsg = !selected && (nmc || 0)

    /* width: 376 = 2 + 32 + 40 + 16 + 142 + 120 + 24 + 16 */
    return (
      <div key={key} style={style}>
        <div
          onTouchTap={() => this.props.selectBox(index)}
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
          <div>
            <div style={{ height: 30, display: 'flex', alignItems: 'center' }} >
              <div style={{ width: 160, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                { name || users.slice(0, 4).map(u => u.nickName).join(', ') }
              </div>
              <div style={{ width: 100, textAlign: 'right', fontSize: 12, color: 'rgba(0,0,0,.54)' }}>
                { deleted ? i18n.__('Deleted Box') : isOffline ? i18n.__('Offline') : parseTime(ltime) }
              </div>
            </div>
            <div style={{ width: 262, display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 238,
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
              {
                newMsg > 0 &&
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      fontSize: 11,
                      color: '#FFF',
                      fontWeight: 500,
                      backgroundColor: 'red',
                      borderRadius: 9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    { newMsg < 99 ? newMsg : 99 }
                  </div>
              }
            </div>
          </div>
          <div style={{ width: 24 }} />
        </div>
      </div>
    )
  }

  renderLoading (size) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={size || 64} />
      </div>
    )
  }

  render () {
    const { boxes, currentBox, station, guid, ipcRenderer, apis } = this.props
    if (!boxes) return this.renderLoading(32)
    const { primaryColor, openSnackBar, getUsers } = this.props
    const { tweets, tError } = this.state
    const boxH = (boxes && Math.min(window.innerHeight - 106 - (this.props.boxError ? 32 : 0), boxes.length * 72)) || 0
    const boxUUID = currentBox && currentBox.uuid
    const currentUser = (currentBox && currentBox.users.find(u => u.id === guid)) || {}
    const stationId = currentBox && currentBox.stationId
    const diffStation = !station || station.id !== stationId
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
        <div style={{ width: 376, height: '100%', position: 'relative', backgroundColor: '#FFF', overflow: 'hidden' }}>
          <div style={{ height: 8 }} />
          {/* new Box */}
          <div style={{ marginLeft: 32, height: 24, display: 'flex', alignItems: 'center' }}>
            <FlatButton
              style={{ lineHeight: '', height: 24 }}
              label={i18n.__('New Box')}
              onTouchTap={this.openNewBox}
              disabled={!station || !station.id}
              icon={<ContentAdd color="rgba(0,0,0,.54)" style={{ marginLeft: 4, marginTop: -2 }} />}
              labelStyle={{ fontSize: 12, color: 'rgba(0,0,0,.54)', marginLeft: -4 }}
            />
            <div style={{ width: 228 }} />
            { this.props.boxLoading && <CircularProgress size={16} thickness={1.5} /> }
          </div>

          {
            this.props.boxError &&
              <div style={{ height: 32, backgroundColor: '#FFCDD2', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 40 }} />
                <InfoIcon color="#F44336" />
                <div style={{ width: 20 }} />
                <div style={{ fontSize: 12 }}> { i18n.__('Get Boxes Error') } </div>
              </div>
          }

          {/* Boxes: react-virtualized with custom scrollBar */}
          {
            boxes.length > 0
              ? <ScrollBar
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

        {/* tweets */}
        {
          currentBox &&
            <Tweets
              retry={this.retry}
              tError={tError}
              guid={guid}
              tweets={addTweetsTime(this.setFakeTweetState(tweets))}
              box={currentBox}
              ipcRenderer={ipcRenderer}
              apis={apis}
            />
        }

        {/* FAB */}
        {
          boxUUID &&
            <BoxUploadButton
              box={currentBox}
              stationId={stationId}
              toggleView={this.toggleView}
              localUpload={this.localUpload}
              offline={false}
              diffStation={diffStation}
              openSnackBar={openSnackBar}
            />
        }

        {
          this.state.view === 'file' &&
            <SelectFile
              apis={apis}
              guid={guid}
              currentUser={currentUser}
              boxUUID={boxUUID}
              stationId={stationId}
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
              currentUser={currentUser}
              boxUUID={boxUUID}
              stationId={stationId}
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
              nolenlmt
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
