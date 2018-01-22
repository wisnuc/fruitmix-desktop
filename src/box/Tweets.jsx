import React from 'react'
import i18n from 'i18n'
import { CircularProgress, Paper, Avatar } from 'material-ui'
import { parseTime } from '../common/datetime'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

const imgUrl = 'http://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKQiahrEc8rUfECDTUq94WlcaNkTYTKzIKr3p5xgOPQO1juvtwO1YSUCHOPpup3oWo1AP3nOBVyPCw/132'

const imgRD = 'https://picsum.photos/200?image='

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

  componentDidUpdate() {
    this.scrollToBottom()
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
        <div style={{ width: 24 }} />
        <div>
          <div>
            <div style={{ height: 30, display: 'flex', alignItems: 'center', flexDirection: isSelf ? 'row-reverse' : 'row' }}>
              <div style={{ fontSize: 16, color: 'rgba(0,0,0,.54)', fontWeight: 500 }}>
                { Array.from({ length: Math.random() * 16 })
                  .map(() => String.fromCharCode(0x597D - Math.random() * 100)) }
              </div>
              <div style={{ width: 16 }} />
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
              :
              <div style={{ width: 572, maxHeight: 400 }}>
                {
                  list.map((l, i) => {
                    const { sha256, filename } = l
                    const float = i > 2 || !isSelf ? 'left' : 'right'
                    return (
                      <Paper
                        style={{ width: 186, height: 186, float, backgroundColor: '#FFF', margin: 2 }}
                        key={sha256}
                      >
                        <img
                          src={`${imgRD}${Math.round(Math.random() * 100)}`}
                          width={186}
                          height={186}
                          style={{ objectFit: 'cover' }}
                          alt={filename}
                        />
                      </Paper>
                    )
                  })
                }
              </div>
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
        style={{ flexGrow: 1, height: '100%', backgroundColor: '#FAFAFA', overflowY: 'auto' }}
      >
        {
          !this.props.tweets ? this.renderLoading(32) : this.props.tweets.length > 0
            ? this.props.tweets.map((t, i) => this.renderTweets(t, i)) : this.renderNoTweets()
        }
        <div style={{ height: 96 }} />
      </div>
    )
  }
}

export default Tweets
