import React from 'react'
import i18n from 'i18n'
import { CircularProgress, Paper, Avatar } from 'material-ui'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'
import FileFolder from 'material-ui/svg-icons/file/folder'
import { AutoSizer } from 'react-virtualized'
import { parseTime } from '../common/datetime'
import Thumb from '../file/Thumb'
import DetailContainer from '../photo/DetailContainer'
import ScrollBar from '../common/ScrollBar'
import DialogOverlay from '../common/PureDialog'
import Preview from './Preview'
import ViewMedia from './ViewMedia'

const overlayStyle = {
  top: 0,
  left: 0,
  fontSize: 34,
  color: '#FFF',
  display: 'flex',
  fontWeight: 500,
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,.54)'
}

const getName = (photo) => {
  if (!photo.date && !photo.datetime) {
    return `IMG_UnkownDate-${photo.hash.slice(0, 5).toUpperCase()}-PC.${photo.m}`
  }
  const date = photo.date || photo.datetime
  return `IMG-${date.split(/\s+/g)[0].replace(/[:\s]+/g, '')}-${photo.hash.slice(0, 5).toUpperCase()}-PC.${photo.m}`
}

class Tweets extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      list: [],
      seqIndex: -1,
      openDetail: false
    }

    this.lookPhotoDetail = (digest) => {
      const seqIndex = this.state.list.findIndex(item => item.sha256 === digest)
      this.setState({ openDetail: true, seqIndex })
    }

    this.memoizeValue = {}

    this.memoize = (newValue) => {
      this.memoizeValue = Object.assign(this.memoizeValue, newValue)
      return this.memoizeValue
    }

    this.startDownload = () => {
      const list = [this.memoizeValue.downloadDigest]

      const { stationId, wxToken } = this.props.box
      const boxUUID = this.props.box.uuid
      const photos = list.map(digest => this.state.list.find(photo => photo.sha256 === digest))
        .map(photo => ({
          station: { boxUUID, stationId, wxToken },
          name: getName(Object.assign({ hash: photo.sha256 }, photo.metadata)),
          size: photo.size,
          type: 'file',
          uuid: photo.sha256
        }))

      this.props.ipcRenderer.send('DOWNLOAD', { entries: photos, dirUUID: 'media' })
    }

    this.openMediaMore = (e, list, author) => {
      e.stopPropagation()
      this.memoizeValue = {}
      this.setState({ viewMore: 'media', list, author })
    }
  }

  renderNoTweets() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ flexGrow: 1 }} />
        <div style={{ color: 'rgba(0,0,0,0.54)' }}> { i18n.__('No Tweets in Groups Text 1') } </div>
        <div style={{ height: 16 }} />
        <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.27)' }}> { i18n.__('No Tweets in Groups Text 2') } </div>
        <div style={{ flexGrow: 1 }} />
      </div>
    )
  }

  renderOffline() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ flexGrow: 1 }} />
        <div style={{ color: 'rgba(0,0,0,0.54)' }}> { i18n.__('Box Offline Text in Tweets') } </div>
        <div style={{ flexGrow: 1 }} />
      </div>
    )
  }

  renderMsg(msg) {
    return (
      <div style={{ height: 32, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }} >
        {
          msg &&
            <div style={{ fontSize: 12, color: '#FFF', backgroundColor: '#BDBDBD', padding: 4, borderRadius: 8 }} >
              { msg }
            </div>
        }
      </div>
    )
  }

  renderTweets({ index, key, style, rowCount }) {
    const { ctime, comment, uuid, author, list, box, type, msg } = this.props.tweets[index]
    const { stationId, wxToken } = box
    const boxUUID = box.uuid
    const isSelf = this.props.guid === author.id
    const isMedia = list && list.every(l => l.metadata)
    const isMany = list && list.length > 6
    const isFake = list && list[0] && list[0].fakedata
    const isFakeMedia = list && list.every(l => l.fakedata && l.fakedata.magic)
    const isMsg = type === 'boxmessage'
    const w = 120
    if (isMsg) return (<div key={key} style={style}> { this.renderMsg(msg) } </div>)
    return (
      <div key={key} style={style}>
        <div
          style={{
            padding: 24,
            width: '100%',
            display: 'flex',
            boxSizing: 'border-box',
            overflow: 'hidden',
            flexDirection: isSelf ? 'row-reverse' : 'row'
          }}
        >
          <div style={{ width: 32 }} />
          {/* Avatar */}
          <div style={{ height: 40, width: 40 }}>
            { author.avatarUrl ? <Avatar src={author.avatarUrl} size={40} /> :
              <ActionAccountCircle style={{ width: 40, height: 40, color: 'rgb(0, 137, 123)' }} /> }
          </div>
          <div style={{ width: 16 }} />
          <div>
            <div style={{ height: 30, display: 'flex', alignItems: 'center', flexDirection: isSelf ? 'row-reverse' : 'row' }}>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,.54)', fontWeight: 500 }}>
                { author.nickName }
              </div>
              <div style={{ width: 8 }} />
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,.54)' }}>
                { parseTime(ctime) }
              </div>
            </div>
            <div>
              {
                !list || !list.length ?
                  <Paper
                    style={{
                      fontSize: 16,
                      height: 44,
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 10,
                      backgroundColor: '#FFF',
                      padding: 10
                    }}
                  >
                    { comment }
                  </Paper>
                  : isMedia || isFakeMedia ?
                  <div style={{ width: 3 * w + 12, maxHeight: 400, filter: isFakeMedia ? 'brightness(0.7)' : '', position: 'relative' }}>
                    {
                      list.map((l, i) => {
                        const { sha256, filename } = l
                        // if (l.fakedata) console.log('l.fakedata', l.fakedata)
                        if (i > 5) return (<div key={sha256 + filename + i} />)
                        // const float = i > 2 || !isSelf ? 'left' : 'right'
                        const margin = isSelf && list.length < 3 && i === 0 ? `2px 2px 2px ${360 - list.length * 120 + 2}px` : 2
                        return (
                          <div
                            key={sha256 + filename + i}
                            onTouchTap={() => isMedia && this.setState({ openDetail: true, list, seqIndex: i })}
                            style={{ width: w, height: w, float: 'left', backgroundColor: '#FFF', margin, position: 'relative' }}
                          >
                            { isMedia &&
                              <Thumb
                                bgColor="rgba(0,0,0,.09)"
                                digest={sha256}
                                station={{ boxUUID, stationId, wxToken }}
                                ipcRenderer={this.props.ipcRenderer}
                                height={w}
                                width={w}
                              />
                            }

                            { isFakeMedia &&
                                <div style={{ width: w, height: w }}>
                                  <img src={l.fakedata.entry} width={w} height={w} alt={filename} style={{ objectFit: 'cover' }} />
                                </div>
                            }
                            {
                              i === 5 && isMany &&
                                <div
                                  style={Object.assign({ width: w, height: w }, overlayStyle)}
                                  onTouchTap={e => this.openMediaMore(e, list, author)}
                                >
                                  { `+ ${list.length - 6}` }
                                </div>
                            }
                          </div>
                        )
                      })
                    }
                    {
                      isFakeMedia &&
                        <div style={{ position: 'absolute', height: 120, width: 120, top: 2, right: 10 }}>
                          { this.renderLoading(32, '#FFF') }
                        </div>
                    }
                  </div>
                  :
                  <Paper
                    style={{ width: 3 * w + 12, height: 56, display: 'flex', alignItems: 'center', fontSize: 14, filter: isFake ? 'brightness(0.7)' : '' }}
                    onTouchTap={() => this.setState({ showFiles: true, list, author })}
                  >
                    <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', backgroundColor: '#FF9100', padding: 16 }}>
                      <FileFolder color="#FFF" />
                    </div>
                    <div style={{ width: 16 }} />
                    <div
                      style={{
                        maxWidth: !(list.length - 1) * w + 1.25 * w,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      { list[0].filename || i18n.__('Sending %s Files', list.length) }
                    </div>
                    <div style={{ width: 4 }} />
                    { !!list[0].filename && list.length > 1 && i18n.__n('And Other %s Items', list.length)}
                    {
                      isFake &&
                        <div style={{ position: 'absolute', height: 120, width: 120, top: 22, right: 460 }}>
                          { this.renderLoading(32, '#E0E0E0') }
                        </div>
                    }
                  </Paper>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderLoading(size, color) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={size || 64} color={color} />
      </div>
    )
  }

  renderError() {
    return (
      <div
        style={{
          flexGrow: 1,
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'rgba(0,0,0,.54)'
        }}
      >
        { i18n.__('Load Tweet Error Text') }
      </div>
    )
  }

  render() {
    const { tweets, box, tError } = this.props
    if (tError) return this.renderError()
    const boxUUID = box && box.uuid
    const isOffline = box && box.station && (!box.station.isOnline)
    const { stationId, wxToken } = (box || {})
    const rowCount = tweets && tweets.length || 0
    let allHeight = 0
    // 326, 202, 134
    const hs = []
    for (let i = 0; i < rowCount; i++) {
      const t = tweets[i]
      const isMedia = (t.list && t.list.length && t.list.every(l => l.metadata || (l.fakedata && l.fakedata.magic))) || t.isMedia
      const isMsg = t.type === 'boxmessage'
      const h = isMsg ? 48 : isMedia && t.list.length > 3 ? 326 : isMedia ? 202 : 134
      hs.push(h)
      allHeight += h
    }
    if (hs.length) {
      hs[hs.length - 1] += 100
      allHeight += 100
    }
    const rowHeight = ({ index }) => hs[index]

    return (
      <div
        ref={ref => (this.refContainer = ref)}
        style={{ flexGrow: 1, height: '100%', backgroundColor: '#FAFAFA', overflow: 'hidden' }}
      >
        { // add key to AutoSizer to force refresh List
          isOffline ? this.renderOffline() : !tweets ? this.renderLoading(32) : tweets.length > 0 ?
            <AutoSizer key={boxUUID}>
              {({ height, width }) => (
                <ScrollBar
                  scrollTop={Math.max(1, allHeight - height)}
                  style={{ outline: 'none' }}
                  allHeight={allHeight}
                  height={height}
                  width={width - 2}
                  rowCount={rowCount}
                  rowHeight={rowHeight}
                  rowRenderer={({ index, key, style }) => this.renderTweets({ index, key, style, rowCount })}
                />
              )}
            </AutoSizer>
            : this.renderNoTweets()
        }
        { tweets && tweets.length > 0 && <div style={{ height: 96 }} /> }

        <DialogOverlay open={!!this.state.showFiles} onRequestClose={() => this.setState({ showFiles: false })} >
          {
            this.state.showFiles &&
              <Preview
                station={{ boxUUID, stationId, wxToken }}
                ipcRenderer={this.props.ipcRenderer}
                list={this.state.list}
                author={this.state.author || {}}
                onRequestClose={() => this.setState({ showFiles: false })}
              />
          }
        </DialogOverlay>

        <DialogOverlay open={!!this.state.viewMore} onRequestClose={() => this.setState({ viewMore: false })}>
          {
            this.state.viewMore &&
            <ViewMedia
              author={this.state.author || {}}
              memoize={this.memoize}
              ipcRenderer={this.props.ipcRenderer}
              lookPhotoDetail={this.lookPhotoDetail}
              onRequestClose={() => this.setState({ viewMore: false })}
              media={this.state.list.map(l => Object.assign({ hash: l.sha256 }, l.metadata))}
            />
          }
        </DialogOverlay>

        {/* PhotoDetail */}
        <DetailContainer
          station={{ boxUUID, stationId, wxToken }}
          onRequestClose={() => this.setState({ openDetail: false })}
          open={this.state.openDetail}
          style={{ position: 'fixed', left: 0, top: 0, width: '100%', height: '100%' }}
          items={this.state.list && this.state.list.map(l => Object.assign({ hash: l.sha256 }, l.metadata))}
          seqIndex={this.state.seqIndex}
          ipcRenderer={this.props.ipcRenderer}
          setAnimation={() => {}}
          setAnimation2={() => {}}
          memoize={this.memoize}
          selectedItems={[]}
          addListToSelection={() => {}}
          removeListToSelection={() => {}}
          hideMedia={() => {}}
          removeMedia={() => {}}
          startDownload={this.startDownload}
          apis={this.props.apis}
        />
      </div>
    )
  }
}

export default Tweets
