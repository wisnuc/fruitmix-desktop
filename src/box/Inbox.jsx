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

    this.preSelect = -1

    this.handleSelect = (i) => {
      if (this.state.selected === i) { // toggle selected
        this.preSelect = i
        this.setState({ selected: -1 })
      } else if (this.state.selected === -1) { // first toggle
        this.preSelect = -1
        this.setState({ selected: i })
      } else { // change selected
        this.preSelect = this.state.selected
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

  calcPos(heights, s) {
    let [h1, h2] = [16, 16]
    const pos = heights.map((height, i) => {
      let top = 0
      let left = 15

      const selected = i === s
      const diff = h1 - h2

      if (h1 <= h2) { // left
        top = h1
        h1 += height + 16
      } else { // right
        left = 405
        top = h2
        h2 += height + 16
      }

      return ({ height, left, top, selected, diff })
    })

    if (this.preSelect > -1 && s > -1) { // change selected
      console.log('same column')
      if (pos[this.preSelect].left === pos[s].left) { // same column
        console.log('change selected same column')
        const { height, left, top, selected, diff } = pos[s]

        /* move grids above selected */
        pos.forEach((p, i) => i < s && p.left !== left && (p.tsd = '0ms') && (p.top -= Math.abs(diff)))

        /* move grids below selected */
        pos.forEach((p, i) => i > s && p.left !== left && (p.tsd = '0ms') && (p.top += height + 16 - Math.abs(diff)))

        /* expend selected */
        pos[s] = { height, left: 15, top, selected, tsd: '300ms' }
        return pos
      } else if (s > this.preSelect) {
        // new > pre : above pre in another column down pre'height
        //             pre column move
        const { height, left, top, selected, diff } = this.prePos[s]
        this.prePos.forEach((p, i) => i < this.preSelect && pos[i].left === pos[s].left && (p.tsd = '0ms') &&
          (p.top += this.prePos[this.preSelect].height + 16))

        const flag = this.prePos.findIndex(p => p.left !== left && p.top + p.height + 16 >= top)
        const fDiff = this.prePos[flag].height + this.prePos[flag].top + 16 - top
        console.log('flag', flag, this.prePos[flag].height + this.prePos[flag].top + 16 - top, height)
        this.prePos.forEach((p, i) => i <= flag && p.left !== left && (p.tsd = '0ms') && (p.top -= fDiff))

        this.prePos.forEach((p, i) => i > flag && p.left !== left && (p.tsd = '0ms') && (p.top += height + 16 - fDiff))

        /* this.prePos[this.preSelect] is different, need handle it extraly */
        if (pos[s].left === 15) this.prePos[this.preSelect].top -= fDiff

        this.prePos[s].left = 15
        this.prePos[s].selected = true
        this.prePos[s].tsd = '300ms'
        this.prePos[this.preSelect].left = pos[this.preSelect].left
        this.prePos[this.preSelect].tsd = '0ms'
        this.prePos[this.preSelect].selected = false
        return this.prePos
      } else if (s < this.preSelect && pos[s].left === 405) {
        // new < pre : below pre in another column up pre'height
        //             pre column move
      
        const { height, left, top, selected, diff } = this.prePos[s]
        this.prePos.forEach((p, i) => i > this.preSelect && pos[i].left === pos[s].left && (p.tsd = '0ms') &&
          (p.top -= this.prePos[this.preSelect].height + 16))

        const flag = this.prePos.findIndex(p => p.left !== left && p.top + p.height + 16 >= top)
        const fDiff = this.prePos[flag].height + this.prePos[flag].top + 16 - top
        console.log('flag pos[s].left === 405', flag, this.prePos[flag].height + this.prePos[flag].top + 16 - top, height)
        this.prePos.forEach((p, i) => i <= flag && p.left !== left && (p.tsd = '0ms') && (p.top -= fDiff))

        this.prePos.forEach((p, i) => i > flag && p.left !== left && (p.tsd = '0ms') && (p.top += height + 16 - fDiff))

        /* this.prePos[this.preSelect] is different, need handle it extraly */
        // if (pos[s].left === 405) this.prePos[this.preSelect].top -= fDiff

        this.prePos[s].left = 15
        this.prePos[s].selected = true
        this.prePos[s].tsd = '300ms'
        this.prePos[this.preSelect].left = pos[this.preSelect].left
        this.prePos[this.preSelect].tsd = '0ms'
        this.prePos[this.preSelect].selected = false
        return this.prePos
      } else {
        console.log('pos[s].left === 15')
        // new < pre : below pre in another column up pre'height
        //             pre column move
      
        const { height, left, top, selected, diff } = this.prePos[s]
        this.prePos.forEach((p, i) => i > this.preSelect && pos[i].left === pos[s].left && (p.tsd = '0ms') &&
          (p.top -= this.prePos[this.preSelect].height + 16))

        const flag = this.prePos.findIndex(p => p.left !== left && p.top + p.height + 16 >= top)
        const fDiff = this.prePos[flag].height + this.prePos[flag].top + 16 - top
        this.prePos.forEach((p, i) => i <= flag && p.left !== left && (p.tsd = '0ms') && (p.top -= fDiff))

        this.prePos.forEach((p, i) => i > flag && p.left !== left && (p.tsd = '0ms') && (p.top += height + 16 - fDiff))

        /* this.prePos[this.preSelect] is different, need handle it extraly */
        this.prePos[this.preSelect].top += fDiff - 16

        this.prePos[s].left = 15
        this.prePos[s].selected = true
        this.prePos[s].tsd = '300ms'
        this.prePos[this.preSelect].left = pos[this.preSelect].left
        this.prePos[this.preSelect].tsd = '0ms'
        this.prePos[this.preSelect].selected = false
        return this.prePos
      }
    } else if (s > -1) { // first toggle
      const { height, left, top, selected, diff } = pos[s]

      /* move grids above selected */
      pos.forEach((p, i) => i < s && p.left !== left && (p.tsd = '0ms') && (p.top -= Math.abs(diff)))

      /* move grids below selected */
      pos.forEach((p, i) => i > s && p.left !== left && (p.tsd = '0ms') && (p.top += height + 16 - Math.abs(diff)))

      /* expend selected */
      pos[s] = { height, left: 15, top, selected, tsd: '150ms' }
    } else if (this.preSelect > -1) { // toggle selected
      const { left } = pos[this.preSelect]
      pos.forEach(p => p.left !== left && (p.tsd = '150ms'))
      pos.forEach(p => p.left === left && (p.tsd = '0ms'))
    }

    this.prePos = pos
    return pos
  }

  renderData(data) {
    return (
      <div style={{ width: 810, position: 'relative' }} >
        {/* <div style={{ height: 1000, width: 810, transition: curve }} ref={ref => (this.refSpace = ref)} /> */}
        {
          this.calcPos([2.9, 9, 2, 8, 3, 7, 4, 6, 5].map(v => v * 36 + 36), this.state.selected).map((v, i) => {
            const { height, top, left, selected, tsd } = v
            return (
              <Paper
                key={height}
                style={{
                  height,
                  position: 'absolute',
                  backgroundColor: '#FFF',
                  width: selected ? 750 : 360,
                  transitionDelay: tsd || '0ms',
                  margin: `${top}px 15px 0px ${left}px`
                }}
                onTouchTap={() => this.handleSelect(i)}
              >
                { height }
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
