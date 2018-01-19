import React from 'react'
import i18n from 'i18n'
import { CircularProgress, Paper, Avatar } from 'material-ui'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

const imgUrl = 'http://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKQiahrEc8rUfECDTUq94WlcaNkTYTKzIKr3p5xgOPQO1juvtwO1YSUCHOPpup3oWo1AP3nOBVyPCw/132'

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
    return (
      <div
        key={uuid}
        style={{ width: '100%', display: 'flex', alignItems: 'center', boxSizing: 'border-box', padding: 24 }}
      >
        <div style={{ width: 32 }} />
        {/* Avatar */}
        <div style={{ height: 40, width: 40 }}>
          <Avatar src={imgUrl} size={40} />
        </div>
        <div style={{ width: 24 }} />
        <div>
          <div style={{ width: 200 }} >
            <div style={{ height: 30, display: 'flex', alignItems: 'center' }} >
              <div style={{ fontSize: 16, color: 'rgba(0,0,0,.54)', fontWeight: 500 }}>
                { tweeter.id.slice(0, 4) }
              </div>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,.54)', marginLeft: 16 }}>
                { '45分钟前' }
              </div>
            </div>
          </div>
          <Paper style={{ fontSize: 20, display: 'flex', alignItems: 'center', borderRadius: 10, backgroundColor: '#FFF', padding: 10 }} >
            { comment }
          </Paper>
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
        <div style={{ height: 24 }} />
      </div>
    )
  }
}

export default Tweets
