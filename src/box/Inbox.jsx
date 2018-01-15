import React from 'react'
import i18n from 'i18n'
import EventListener from 'react-event-listener'
import { TweenMax } from 'gsap'
import { IconButton, CircularProgress, Paper } from 'material-ui'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import UploadIcon from 'material-ui/svg-icons/file/cloud-upload'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

class Inbox extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: -1
    }

    this.handleResize = () => this.forceUpdate()

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

    this.handleSelect = (i, adj) => {
      if (this.state.selected === i) {
        this.setState({ selected: -1 })
        this.refSpace.style.height = '1000px'
      } else {
        if (this.state.selected === -1) this.refSpace.style.height = `${1000 - adj}px`
        this.setState({ selected: i })
      }
    }
  }

  componentDidMount() {
  }

  renderNoData() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#FAFAFA'
          }}
        >
          <div style={{ fontSize: 24, color: 'rgba(0,0,0,0.27)', height: 56 }}> { i18n.__('No Data in Inbox Text 1') } </div>
          <div style={{ color: 'rgba(0,0,0,0.27)' }}> { i18n.__('No Data in Inbox Text 2') } </div>
        </div>
      </div>
    )
  }

  renderData(data) {
    let diff = 0
    let preDiff = 1
    return (
      <div style={{ width: 810, position: 'relative' }} >
        <div style={{ height: 1000, width: 810, transition: curve }} ref={ref => (this.refSpace = ref)} />
        {
          [1, 9, 2, 8, 3, 7, 4, 6, 5].map((v, i) => {
            const height = v * 36 + 36
            let top = 0
            let left = 15

            const selected = i === this.state.selected

            const continueRight = diff > 0 && preDiff > 0
            const continueLeft = diff <= 0 && preDiff <= 0

            if (!i) { // first
              top = 8 - 1000
              preDiff = diff
              diff += height
            } else if (diff <= 0 && preDiff > 0) { // new left
              top += diff + 16
              preDiff = diff
              diff += height
            } else if (diff > 0 && preDiff <= 0) { // new right
              top -= diff
              left += 390
              preDiff = diff
              diff -= height
            } else if (diff <= 0 && preDiff <= 0) { // continue left
              top = 16
              preDiff = diff
              diff += height + 16
            } else { // diff > 0 && preDiff > 0, continue right
              left += 390
              top = 16
              preDiff = diff
              diff -= height + 16
            }

            let altTop = i ? 16 : 8 - 1000
            if (continueRight) altTop = preDiff + 16
            else if (continueLeft) altTop = -preDiff

            const topChange = Math.abs(altTop - top)

            if (selected) {
              top = altTop
              diff = 0
              preDiff = 1
              left = 15
            }

            console.log('selected', i, height, diff, preDiff, top, topChange)

            return (
              <Paper
                key={v}
                style={{
                  width: selected ? 750 : 360,
                  height,
                  backgroundColor: '#FFF',
                  margin: `${top}px 15px 0px ${left}px`
                }}
                onTouchTap={() => this.handleSelect(i, topChange)}
              >
                { v }
              </Paper>
            )
          })
        }
        <div style={{ height: 24 }} />
      </div>
    )
  }

  render() {
    console.log('Box', this.props, this.state)
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          overflow: 'auto',
          justifyContent: 'center',
          backgroundColor: '#F5F5F5'
        }}
      >
        <EventListener target="window" onResize={this.handleResize} />

        {/* PhotoList */}
        {
           !this.props.data ?
             <div
               style={{
                 position: 'relative',
                 marginTop: -7,
                 width: '100%',
                 height: '100%',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
             >
               <CircularProgress />
             </div> :
            this.props.data.length ? this.renderData(this.props.data) : this.renderNoData()
        }

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
