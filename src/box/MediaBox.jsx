import React from 'react'
import i18n from 'i18n'
import EventListener from 'react-event-listener'
import { TweenMax } from 'gsap'
import { IconButton, CircularProgress, Paper, Avatar } from 'material-ui'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import FileFolder from 'material-ui/svg-icons/file/folder'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import UploadIcon from 'material-ui/svg-icons/file/cloud-upload'
import DialogOverlay from '../common/DialogOverlay'
import FlatButton from '../common/FlatButton'
import { parseTime } from '../common/datetime'
import Thumb from '../file/Thumb'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

const imgUrl = 'http://cn.bing.com/th?id=ABT1B401B62BAA3194420276E294380581BC45A4292AE1FF991F97E75ED74A511A1&w=608&h=200&c=2&rs=1&pid=SANGAM'

const calcCurve = (tsd, wd) => {
  return `all 450ms cubic-bezier(0.23, 1, 0.32, 1) ${tsd || '0ms'},
          margin-left 450ms cubic-bezier(0.23, 1, 0.32, 1) ${wd || '0ms'},
          width 450ms cubic-bezier(0.23, 1, 0.32, 1) ${wd || '0ms'},
          height 450ms cubic-bezier(0.23, 1, 0.32, 1) ${wd || '0ms'}`
}

class MediaBox extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      hover: false
    }
  }

  renderThumb(args) {
    // console.log('Box', this.props, this.state)
    const { list, box, ipcRenderer, height, width, full, imgStyle } = args
    const { sha256 } = list[0]
    return (
      <div style={{ width: '100%', height: '100%' }} >
        <Thumb
          digest={sha256}
          boxUUID={box.uuid}
          ipcRenderer={ipcRenderer}
          height={height}
          width={width}
          full={full}
          imgStyle={imgStyle}
        />
      </div>
    )
  }

  render() {
    const { data, i, handleSelect, ipcRenderer } = this.props
    const { height, top, left, selected, tsd, wd, content } = data
    const { type, comment, index, tweeter, list, uuid, box, ctime } = content
    const isMedia = list && list.every(l => l.metadata)
    const isMany = list && list.length > 6
    const hovered = this.state.hover
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
        onTouchTap={() => handleSelect(i)}
        onMouseMove={() => hovered || this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        zDepth={selected ? 2 : hovered ? 1 : 0}
      >
        <div
          style={{
            height: 72,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            transition: calcCurve(tsd, wd)
          }}
        >
          <div style={{ width: 16 }} />
          <div style={{ borderRadius: 20, width: 40, height: 40, overflow: 'hidden' }}>
            <img width={40} height={40} alt="face" src={imgUrl} />
          </div>
          <div style={{ width: 16 }} />
          <div style={{ flexGrow: 1 }} >
            <div style={{ height: 12 }} />
            <div style={{ height: 24, fontWeight: 500, display: 'flex', alignItems: 'center' }} >
              <div style={{ maxWidth: 216, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                { `用户-${tweeter.id.slice(0, 4)}` }
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
        <div
          style={{
            width: '100%',
            display: 'flex',
            overflow: 'hidden',
            height: height - 72,
            alignItems: 'center',
            transition: calcCurve(tsd, wd)
          }}
        >
          {
            isMedia ? 
              this.renderThumb({
                list,
                box,
                ipcRenderer,
                height: height - 88,
                width: selected ? 750 : 360,
                full: selected,
                imgStyle: { objectFit: 'cover', transition: calcCurve(tsd, wd) }
              })
              :
              <div
                style={{
                  height: 72,
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  backgroundColor: '#FFA000',
                  color: '#FFF'
                }}
              >
                <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', padding: 16 }}>
                  <FileFolder color="#FFF" />
                </div>
                <div
                  style={{
                    maxWidth: list.length === 1 ? 300 : 120,
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
      </Paper>
    )
  }
}

export default MediaBox
