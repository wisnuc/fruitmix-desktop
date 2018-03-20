import React from 'react'
import i18n from 'i18n'
import EventListener from 'react-event-listener'
import keycode from 'keycode'
import { IconButton, Paper } from 'material-ui'
import ListIcon from 'material-ui/svg-icons/action/list'
import GridIcon from 'material-ui/svg-icons/action/view-module'
import ShareIcon from 'material-ui/svg-icons/social/share'
import FileFolder from 'material-ui/svg-icons/file/folder'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import { AutoSizer } from 'react-virtualized'
import { parseTime } from '../common/datetime'
import ScrollBar from '../common/ScrollBar'
import Thumb from '../file/Thumb'
import Grid from './Grid'
import Row from './Row'

const calcCurve = (tsd, wd) => `all 450ms cubic-bezier(0.23, 1, 0.32, 1) ${tsd || '0ms'},
          margin-left 450ms cubic-bezier(0.23, 1, 0.32, 1) ${wd || '0ms'},
          width 450ms cubic-bezier(0.23, 1, 0.32, 1) ${wd || '0ms'},
          height 450ms cubic-bezier(0.23, 1, 0.32, 1) ${wd || '0ms'}`

const arrowStyle = {
  backgroundColor: 'rgba(66, 66, 66, 0.541176)',
  position: 'absolute',
  borderRadius: 20,
  zIndex: 100,
  width: 40,
  height: 40,
  padding: 8,
  top: 'calc(50% - 20px)'
}

class MediaBox extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      hover: false
    }

    this.toggleState = op => this.setState({ [op]: !this.state[op] })

    this.handleTap = () => {
      if (this.state.gridView) this.setState({ gridView: false }, () => setTimeout(() => this.props.handleSelect(this.props.i), 225))
      else this.props.handleSelect(this.props.i)
    }

    this.changeIndex = (direction) => {
      // debug('this.changeIndex', direction, this)
      if (direction === 'right' && this.currentIndex < this.props.items.length - 1) {
        this.currentIndex += 1

        /* hidden left div which move 200%, show other divs */
        for (let i = 0; i < 3; i++) {
          if (this[`refPreview_${i}`].style.left === '-20%') {
            /* update div content */
            let item = {}
            if (this.currentIndex < this.props.items.length - 1) item = this.props.items[this.currentIndex + 1]
            if (!i) {
              this.leftItem = item
            } else if (i === 1) {
              this.centerItem = item
            } else {
              this.rightItem = item
            }
            this[`refPreview_${i}`].style.opacity = 0
            this[`refPreview_${i}`].style.zIndex = 0
          } else if (this[`refPreview_${i}`].style.left === '20%') {
            this[`refPreview_${i}`].style.opacity = 1
            this[`refPreview_${i}`].style.zIndex = 1
          } else {
            this[`refPreview_${i}`].style.opacity = 0
            this[`refPreview_${i}`].style.zIndex = 0
          }
        }
        const tmp = this.refPreview_2.style.left
        this.refPreview_2.style.left = this.refPreview_1.style.left
        this.refPreview_1.style.left = this.refPreview_0.style.left
        this.refPreview_0.style.left = tmp
      } else if (direction === 'left' && this.currentIndex > 0) {
        this.currentIndex -= 1

        /* hidden right div which move 200%, show other divs */
        // debug('direction === left', this.leftItem, this.centerItem, this.rightItem)
        for (let i = 0; i < 3; i++) {
          if (this[`refPreview_${i}`].style.left === '20%') {
            /* update div content */
            let item = {}
            if (this.currentIndex) item = this.props.items[this.currentIndex - 1]
            if (!i) {
              this.leftItem = item
            } else if (i === 1) {
              this.centerItem = item
            } else {
              this.rightItem = item
            }
            this[`refPreview_${i}`].style.opacity = 0
            this[`refPreview_${i}`].style.zIndex = 0
          } else if (this[`refPreview_${i}`].style.left === '-20%') {
            this[`refPreview_${i}`].style.opacity = 1
            this[`refPreview_${i}`].style.zIndex = 1
          } else {
            this[`refPreview_${i}`].style.opacity = 0
            this[`refPreview_${i}`].style.zIndex = 0
          }
        }
        const tmp = this.refPreview_0.style.left
        this.refPreview_0.style.left = this.refPreview_1.style.left
        this.refPreview_1.style.left = this.refPreview_2.style.left
        this.refPreview_2.style.left = tmp
        this.RightItem = this.props.items[this.currentIndex - 2]
      } else return
      // this.props.select(0, this.currentIndex)
      this.forceUpdate()
    }

    this.handleKeyUp = (event) => {
      // debug('this.handleKeyUp', keycode(event))
      if (!this.props.data.selected) return null
      switch (keycode(event)) {
        case 'left': return this.changeIndex('left')
        case 'right': return this.changeIndex('right')
        default: return null
      }
    }
  }

  renderContainer (args) {
    const { list, box, ipcRenderer, height, width, full, imgStyle } = args
    if (!this.centerItem) {
      this.centerItem = list[0]
      this.leftItem = {}
      this.rightItem = list[1] || {}
      this.currentIndex = 0
    }
    return (
      <div style={{ overflow: 'hidden', width: '100%', height: '100%', position: 'relative' }}>
        {
          [this.leftItem, this.centerItem, this.rightItem].map((item, index) => (
            <div
              key={index.toString()}
              ref={ref => (this[`refPreview_${index}`] = ref)}
              style={{
                position: 'absolute',
                top: 0,
                left: index ? index === 1 ? 0 : '20%' : '-20%',
                opacity: index === 1 ? 1 : 0,
                zIndex: index === 1 ? 1 : 0,
                height: '100%',
                width: '100%',
                transition: 'all 200ms cubic-bezier(0.0, 0.0, 0.2, 1)'
              }}
            >
              {
                item.sha256 &&
                  <Thumb
                    digest={item.sha256}
                    station={{ boxUUID: box.uuid, stationId: box.stationId, wxToken: box.wxToken }}
                    ipcRenderer={ipcRenderer}
                    height={height}
                    width={width}
                    full={full}
                    imgStyle={imgStyle}
                  />
              }
            </div>
          ))
        }
        {
          list.length > 1 && full &&
            <div
              key="counter"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                height: 24,
                width: 32 + Math.ceil(Math.log10(list.length)) * 8,
                zIndex: 100,
                color: '#FFF',
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000000'
              }}
            >
              { `${this.currentIndex + 1} / ${list.length}`}
            </div>
        }

        {/* left Button */}
        { list.length > 1 && full &&
        <IconButton
          style={Object.assign({
            left: '2%',
            opacity: this.currentIndex && 1
          }, arrowStyle)}
          hoveredStyle={{ backgroundColor: 'rgba(255,255,255,.09)' }}
          onTouchTap={(e) => { this.changeIndex('left'); e.preventDefault(); e.stopPropagation() }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="white">
            <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
          </svg>
        </IconButton>
        }

        {/* right Button */}
        { list.length > 1 && full &&
        <IconButton
          style={Object.assign({
            right: '2%',
            opacity: this.currentIndex < this.props.items.length - 1 ? 1 : 0
          }, arrowStyle)}
          hoveredStyle={{ backgroundColor: 'rgba(255,255,255,.18)' }}
          onTouchTap={(e) => { this.changeIndex('right'); e.preventDefault(); e.stopPropagation() }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="white">
            <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
          </svg>
        </IconButton>
        }

      </div>
    )
  }

  renderGridView (args) {
    const { list, box, ipcRenderer, height, width } = args
    return (
      <div
        style={{ overflow: 'hidden', width, height, position: 'relative', paddingLeft: 16 }}
        onTouchTap={(e) => { e.stopPropagation(); e.preventDefault() }}
      >
        <Grid
          items={list.map(l => l.sha256)}
          ipcRenderer={ipcRenderer}
          station={{ boxUUID: box.uuid, stationId: box.stationId, wxToken: box.wxToken }}
          action={digest => this.props.lookPhotoDetail({ digest, list, box })}
          num={5}
          size={140}
        />
      </div>
    )
  }

  renderFile (args) {
    const { list, height, width, transition, full, box } = args
    return (
      <div style={{ height, width, transition, position: 'relative' }}>
        { full &&
          <div
            style={{
              height: 32,
              width: '100%',
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              fontSize: 14,
              color: 'rgba(0,0,0,.38)'
            }}
          >
            <div style={{ flex: '0 0 48px' }} />
            <div style={{ flex: '0 0 216px', display: 'flex', alignItems: 'center' }}>
              { i18n.__('Name') }
            </div>

            <div style={{ flex: '0 0 144px' }}>
              { i18n.__('Date Modified') }
            </div>
            <div style={{ flex: '0 0 144px' }}>
              { i18n.__('Size') }
            </div>
            <div style={{ flexGrow: 1 }} />
          </div>
        }

        {/* list */}
        { full &&
          <AutoSizer key={box.uuid}>
            {(props) => {
              const [h, w] = [props.height, props.width]
              return (
                <ScrollBar
                  allHeight={40 * list.length}
                  height={h - 40}
                  width={w}
                  rowCount={list.length}
                  rowHeight={40}
                  rowRenderer={({ index, key, style }) => (
                    <div style={style} key={key} onTouchTap={e => e.stopPropagation()}>
                      <Row {...list[index]} name={list[index].filename} />
                    </div>
                  )}
                />
              )
            }}
          </AutoSizer>
        }

        {/* unselected */}
        { !full &&
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFA000', color: '#FFF' }}>
            <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', padding: 16 }}>
              <FileFolder color="#FFF" />
            </div>
            <div
              style={{
                maxWidth: list.length === 1 ? 300 : 180,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              { list[0].filename }
            </div>
            <div style={{ width: 4 }} />
            { list.length > 1 && i18n.__n('And Other %s Items', list.length)}
          </div>
        }
      </div>
    )
  }

  render () {
    // console.log('MediaBox', this.props)
    const { data, ipcRenderer } = this.props
    const { height, top, left, selected, tsd, wd, content } = data
    const { author, list, uuid, box, ctime, wxToken } = content
    const isMedia = list && list.every(l => l.metadata)
    const hovered = this.state.hover
    const mediaArgs = {
      list,
      box,
      wxToken,
      ipcRenderer,
      height: height - 88,
      width: selected ? 750 : 360,
      full: selected,
      imgStyle: { objectFit: 'cover', transition: calcCurve(tsd, wd) }
    }
    const fileArgs = {
      list,
      box,
      ipcRenderer,
      height: height - 72,
      width: selected ? 750 : 360,
      full: selected,
      transition: calcCurve(tsd, wd)
    }
    return (
      <Paper
        key={uuid}
        style={{
          height,
          position: 'absolute',
          backgroundColor: '#FFF',
          width: selected ? 750 : 360,
          transition: calcCurve(tsd, wd),
          margin: `${top}px 15px 0px ${left}px`
        }}
        onTouchTap={(e) => { e.stopPropagation(); e.preventDefault() }}
        onMouseMove={() => hovered || this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        zDepth={selected ? 2 : hovered ? 1 : 0}
      >
        <EventListener target="window" onKeyUp={this.handleKeyUp} />

        {/* header */}
        <div
          style={{
            height: 72,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            transition: calcCurve(tsd, wd),
            boxShadow: '0px 1px 4px rgba(0,0,0,0.27)'
          }}
        >
          <div style={{ width: 16 }} />
          <div style={{ borderRadius: 20, width: 40, height: 40, overflow: 'hidden' }}>
            <img width={40} height={40} alt="avatar" src={author.avatarUrl} />
          </div>
          <div style={{ width: 16 }} />
          <div style={{ flexGrow: 1 }} >
            <div style={{ height: 12 }} />
            <div style={{ height: 24, fontWeight: 500, display: 'flex', alignItems: 'center' }} >
              <div style={{ maxWidth: 216, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                { author.nickName }
              </div>
              <div style={{ flexGrow: 1 }} />
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,.54)' }}>
                { parseTime(ctime) }
              </div>
              <div style={{ width: 24 }} />
            </div>
            <div style={{ height: 20, fontSize: 14, color: 'rgba(0,0,0,.54)' }} >
              { `来自"${box.name || '未命名'}"群，分享了${list.length}${isMedia ? '张照片' : '个文件'}` }
            </div>
            <div style={{ height: 16 }} />
          </div>
        </div>

        {/* content */}
        <div
          onTouchTap={this.handleTap}
          style={{
            width: '100%',
            display: 'flex',
            overflow: 'hidden',
            height: height - 72,
            alignItems: 'center',
            transition: calcCurve(tsd, wd)
          }}
        >
          { !isMedia ? this.renderFile(fileArgs)
            : this.state.gridView && selected ? this.renderGridView(mediaArgs)
              : this.renderContainer(mediaArgs) }
        </div>

        {/* actions */}
        <div
          style={{
            top: 0,
            right: 0,
            width: 144,
            height: 72,
            paddingRight: 8,
            position: 'absolute',
            opacity: selected ? 1 : 0,
            zIndex: selected ? 100 : -100,
            backgroundColor: '#FFF',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row-reverse',
            transition: `opacity 225ms ${selected ? '225ms' : '0ms'}`
          }}
        >
          <IconButton
            style={{ padding: 8 }}
            disabled={!selected}
            onTouchTap={() => this.toggleState('gridView')}
            tooltip={i18n.__('Share')}
          >
            <ShareIcon color="rgba(0,0,0,.54)" />
          </IconButton>
          <IconButton
            style={{ padding: 8 }}
            disabled={!selected}
            onTouchTap={() => this.toggleState('gridView')}
            tooltip={i18n.__('Download')}
          >
            <DownloadIcon color="rgba(0,0,0,.54)" />
          </IconButton>
          <IconButton
            style={{ padding: 8 }}
            disabled={!selected}
            onTouchTap={() => this.toggleState('gridView')}
            tooltip={this.state.gridView ? i18n.__('List View') : i18n.__('Grid View')}
          >
            { this.state.gridView ? <ListIcon color="rgba(0,0,0,.54)" /> : <GridIcon color="rgba(0,0,0,.54)" /> }
          </IconButton>
        </div>
      </Paper>
    )
  }
}

export default MediaBox
