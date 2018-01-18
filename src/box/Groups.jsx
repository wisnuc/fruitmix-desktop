import React from 'react'
import i18n from 'i18n'
import EventListener from 'react-event-listener'
import { TweenMax } from 'gsap'
import { IconButton, CircularProgress, Paper, Avatar } from 'material-ui'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import UploadIcon from 'material-ui/svg-icons/file/cloud-upload'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

const imgUrl = 'http://cn.bing.com/th?id=ABT1B401B62BAA3194420276E294380581BC45A4292AE1FF991F97E75ED74A511A1&w=608&h=200&c=2&rs=1&pid=SANGAM'

class Inbox extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: -1
    }

    this.handleResize = () => this.forceUpdate()

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.selectBox = (index) => {
      console.log('this.selectBox', index)
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

  renderBox(box, index) {
    const { mtime, name, uuid, users } = box
    return (
      <div
        key={uuid}
        onTouchTap={() => this.selectBox(index)}
        style={{ height: 72, boxSizing: 'border-box', display: 'flex', alignItems: 'center', border: '1px solid #EEEEEE' }}
      >
        <div style={{ width: 32 }} />
        {/* Avatar */}
        <div style={{ height: 40, width: 40 }}>
          <Avatar src={imgUrl} />
        </div>
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

  renderTweets(tweet, i) {
    const { ctime, comment, uuid, tweeter, list, index } = tweet
    return (
      <div
        key={uuid}
        onTouchTap={() => this.selectBox(index)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', margin: 24 }}
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
          <div style={{ fontSize: 20, display: 'flex', alignItems: 'center', borderRadius: 10, backgroundColor: '#FFF', padding: 10 }} >
            { comment }
          </div>
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
    console.log('Group', this.props, this.state)
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
                <div style={{ height: 24, fontSize: 12, color: 'rgba(0,0,0,.54)', display: 'flex', alignItems: 'center' }}>
                  { '新建' }
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
        <div style={{ flexGrow: 1, height: '100%', backgroundColor: '#EEEEEE' }}>
          { !this.props.tweets ? this.renderLoading(32) : this.props.tweets.length > 0
            ? this.props.tweets.map((t, i) => this.renderTweets(t, i)) : this.renderNoTweets() }
        </div>

        {/* Selected Header */}
        {
          !!0 &&
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: 64,
                backgroundColor: this.props.primaryColor,
                display: 'flex',
                alignItems: 'center',
                zIndex: 200
              }}
            >
              <div style={{ width: 12 }} />
              <div ref={ref => (this.refClearSelected = ref)}>
                <IconButton onTouchTap={this.props.clearSelect}>
                  <CloseIcon color="#FFF" />
                </IconButton>
              </div>
              <div style={{ width: 12 }} />
              <div style={{ color: '#FFF', fontSize: 20, fontWeight: 500 }} >
                { i18n.__('%s Photo Selected', this.props.selectedItems.length) }
              </div>
              <div style={{ flexGrow: 1 }} />

              <IconButton onTouchTap={this.props.startDownload} tooltip={i18n.__('Download')}>
                <DownloadIcon color="#FFF" />
              </IconButton>

              {/*
              <IconButton onTouchTap={() => this.toggleDialog('deleteDialog')}>
                <DeleteIcon color="#FFF" />
              </IconButton>
              */}

              <IconButton onTouchTap={() => this.toggleDialog('hideDialog')} tooltip={i18n.__('Hide')}>
                <VisibilityOff color="#FFF" />
              </IconButton>
              <div style={{ width: 24 }} />

            </div>
        }

        {/* dialog */}
        <DialogOverlay open={!!this.state.deleteDialog}>
          <div>
            {
              this.state.deleteDialog &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { i18n.__('Delete Photo Dialog Text 1') }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { i18n.__('Delete Photo Dialog Text 2') }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label={i18n.__('Cancel')} primary onTouchTap={() => this.toggleDialog('deleteDialog')} keyboardFocused />
                    <FlatButton
                      label={i18n.__('Remove')}
                      primary
                      onTouchTap={() => {
                        this.toggleDialog('deleteDialog')
                        this.props.removeMedia()
                      }}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>
      </div>
    )
  }
}

export default Inbox
