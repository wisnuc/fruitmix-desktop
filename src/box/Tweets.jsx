import React from 'react'
import i18n from 'i18n'
import { CircularProgress, Paper, Avatar } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import { parseTime } from '../common/datetime'
import Thumb from '../file/Thumb'
import DetailContainer from '../photo/DetailContainer'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

const imgUrl = 'http://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKQiahrEc8rUfECDTUq94WlcaNkTYTKzIKr3p5xgOPQO1juvtwO1YSUCHOPpup3oWo1AP3nOBVyPCw/132'

const imgRD = 'https://picsum.photos/200?image='

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

class Tweets extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {}

    this.scrollToBottom = () => {
      this.refContainer.scrollTop = this.refContainer.scrollHeight
    }
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.boxUUID !== this.props.boxUUID) this.scrollToBottom()
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

  renderTweets(tweet, i) {
    const { ctime, comment, uuid, tweeter, list, index } = tweet
    const isSelf = this.props.guid === tweeter.id
    const isMedia = list && list.every(l => l.metadata)
    const isMany = list && list.length > 6
    const w = 120
    return (
      <div
        key={uuid}
        style={{
          width: '100%',
          display: 'flex',
          boxSizing: 'border-box',
          padding: 24,
          flexDirection: isSelf ? 'row-reverse' : 'row'
        }}
      >
        <div style={{ width: 32 }} />
        {/* Avatar */}
        <div style={{ height: 40, width: 40 }}>
          <Avatar src={imgUrl} size={40} />
        </div>
        <div style={{ width: 16 }} />
        <div>
          <div>
            <div style={{ height: 30, display: 'flex', alignItems: 'center', flexDirection: isSelf ? 'row-reverse' : 'row' }}>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,.54)', fontWeight: 500 }}>
                { Array.from({ length: Math.random() * 16 })
                  .map(() => String.fromCharCode(0x674e - Math.random() * 100)) }
              </div>
              <div style={{ width: 8 }} />
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,.54)' }}>
                { parseTime(ctime) }
              </div>
            </div>
          </div>
          {
            !list ?
              <Paper
                style={{
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: '#FFF',
                  padding: 10
                }}
              >
                { comment }
              </Paper>
              : isMedia ?
              <div style={{ width: 3 * w + 12, maxHeight: 400 }}>
                {
                  list.map((l, i) => {
                    const { sha256, filename } = l
                    if (i > 5) return (<div key={sha256 + filename} />)
                    // const float = i > 2 || !isSelf ? 'left' : 'right'
                    const margin = isSelf && list.length < 3 && i === 0 ? `2px 2px 2px ${360 - list.length * 120 + 2}px` : 2
                    return (
                      <Paper
                        key={sha256 + filename}
                        onTouchTap={() => this.setState({ openDetail: true, list, seqIndex: i })}
                        style={{ width: w, height: w, float: 'left', backgroundColor: '#FFF', margin, position: 'relative' }}
                      >
                        <Thumb
                          digest={sha256}
                          boxUUID={this.props.boxUUID}
                          ipcRenderer={this.props.ipcRenderer}
                          height={w}
                          width={w}
                        />
                        {
                          i === 5 && isMany &&
                            <div style={Object.assign({ width: w, height: w }, overlayStyle)} >
                              { `+ ${list.length - 6}` }
                            </div>
                        }
                      </Paper>
                    )
                  })
                }
              </div>
              :
              <Paper style={{ width: 3 * w + 12, height: 56, display: 'flex', alignItems: 'center', fontSize: 14 }}>
                <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', backgroundColor: '#FF9100', padding: 16 }}>
                  <FileFolder color="#FFF" />
                </div>
                <div style={{ width: 16 }} />
                <div style={{ maxWidth: 1 * w, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  { list[0].filename }
                </div>
                <div style={{ width: 4 }} />
                { list.length > 1 && i18n.__n('And Other %s Items', list.length)}
              </Paper>
          }
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
    console.log('render tweets', this.props)
    return (
      <div
        ref={ref => (this.refContainer = ref)}
        style={{ flexGrow: 1, height: '100%', backgroundColor: '#FAFAFA', overflow: 'auto' }}
      >
        {
          !this.props.tweets ? this.renderLoading(32) : this.props.tweets.length > 0
            ? this.props.tweets.map((t, i) => this.renderTweets(t, i)) : this.renderNoTweets()
        }
        { this.props.tweets.length > 0 && <div style={{ height: 96 }} /> }

        {/* PhotoDetail */}
        <DetailContainer
          boxUUID={this.props.boxUUID}
          onRequestClose={() => this.setState({ openDetail: false })}
          open={this.state.openDetail}
          style={{ position: 'fixed', left: 0, top: 0, width: '100%', height: '100%' }}
          items={this.state.list && this.state.list.map(l => Object.assign({ hash: l.sha256 }, l.metadata))}
          seqIndex={this.state.seqIndex}
          ipcRenderer={this.props.ipcRenderer}
          setAnimation={() => {}}
          setAnimation2={() => {}}
          memoize={() => {}}
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
