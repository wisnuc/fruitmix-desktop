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
import DetailContainer from '../photo/DetailContainer'
import MediaBox from './MediaBox'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

const imgUrl = 'http://cn.bing.com/th?id=ABT1B401B62BAA3194420276E294380581BC45A4292AE1FF991F97E75ED74A511A1&w=608&h=200&c=2&rs=1&pid=SANGAM'

const getName = (photo) => {
  if (!photo.date && !photo.datetime) {
    return `IMG_UnkownDate-${photo.hash.slice(0, 5).toUpperCase()}-PC.${photo.m}`
  }
  const date = photo.date || photo.datetime
  return `IMG-${date.split(/\s+/g)[0].replace(/[:\s]+/g, '')}-${photo.hash.slice(0, 5).toUpperCase()}-PC.${photo.m}`
}


class Inbox extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: -1,
      hover: -1
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

    this.memoizeValue = {}

    this.memoize = (newValue) => {
      this.memoizeValue = Object.assign(this.memoizeValue, newValue)
      return this.memoizeValue
    }

    this.lookPhotoDetail = ({ list, digest, box }) => {
      const seqIndex = list.findIndex(item => item.sha256 === digest)
      this.setState({ openDetail: true, seqIndex, list, boxUUID: box.uuid })
    }

    this.startDownload = () => {
      const list = [this.memoizeValue.downloadDigest]

      const photos = list.map(digest => this.state.list.find(photo => photo.sha256 === digest))
        .map(photo => ({
          boxUUID: this.state.boxUUID,
          name: getName(Object.assign({ hash: photo.sha256 }, photo.metadata)),
          size: photo.size,
          type: 'file',
          uuid: photo.sha256
        }))

      this.props.ipcRenderer.send('DOWNLOAD', { entries: photos, dirUUID: 'media' })
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

  calcPos(data, s) {
    let [h1, h2] = [16, 16]
    const pos = data.map((d, i) => {
      const h = d.height // raw height
      let top = 0
      let left = 15

      const selected = i === s
      const diff = h1 - h2

      const height = selected ? Math.min(Math.max(h * 2, 421), 562) : h

      if (h1 <= h2) { // left
        top = h1
        h1 += h + 16
      } else { // right
        left = 405
        top = h2
        h2 += h + 16
      }

      return ({ height, h, left, top, selected, diff, content: d.content })
    })

    if (this.preSelect > -1 && s > -1) { // change selected
      const { height, h, left, top, selected, diff, content } = pos[s]

      /* move grids above selected */
      pos.forEach((p, i) => i < s && p.left !== left && (p.tsd = '150ms') && (p.top -= Math.abs(diff)))

      /* move grids below selected */
      pos.forEach((p, i) => i > s && p.left !== left && (p.tsd = '150ms') && (p.top += h + 16 - Math.abs(diff)))

      /* move grids below selected in the same column when height changed */
      if (height > h) pos.forEach((p, i) => i > s && (p.tsd = '150ms') && (p.top += height - h))

      /* expend selected */
      pos[s] = { height, left: 15, top, selected, tsd: '0ms', wd: '300ms', content }
      pos[this.preSelect].tsd = '150ms'
      pos[this.preSelect].wd = '0ms'
    } else if (s > -1) { // first toggle
      const { height, h, left, top, selected, diff, content } = pos[s]

      /* move grids above selected */
      pos.forEach((p, i) => i < s && p.left !== left && (p.tsd = '0ms') && (p.top -= Math.abs(diff)))

      /* move grids below selected */
      pos.forEach((p, i) => i > s && p.left !== left && (p.tsd = '0ms') && (p.top += height + 16 - Math.abs(diff)))

      /* move grids below selected in the same column when height changed */
      if (height > h) pos.forEach((p, i) => i > s && p.left === left && (p.tsd = '150ms') && (p.top += height - h))

      /* expend selected */
      pos[s] = { height, left: 15, top, selected, wd: '150ms', content }
    } else if (this.preSelect > -1) { // toggle selected
      const { left } = pos[this.preSelect]
      pos.forEach(p => p.left !== left && (p.tsd = '150ms'))
      pos.forEach(p => p.left === left && (p.tsd = '0ms'))
    }

    this.prePos = pos
    return pos
  }

  process(data) {
    const res = data.map((d) => {
      const { type, comment, index, tweeter, list, uuid } = d
      if (list && list.length > 0) {
        if (list.every(l => l.metadata)) {
          const { h, w } = list[0].metadata
          const altH = 360 * h / w
          return ({ height: (h > w ? 360 : altH > 72 ? altH : 72) + 88, content: d })
        }
        return ({ height: 144, content: d })
      }
      return ({ height: 144, content: d }) // not list TODO
    })
    return res // ({ height, content })
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
           !this.props.tweets ?
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
            this.props.tweets.length ?
            <div style={{ width: 810, position: 'relative' }}>
              {
                this.calcPos(this.process(this.props.tweets), this.state.selected).map((v, i) => (
                  <MediaBox
                    key={v.content.uuid}
                    i={i}
                    data={v}
                    items={v.content.list}
                    handleSelect={this.handleSelect}
                    ipcRenderer={this.props.ipcRenderer}
                    lookPhotoDetail={this.lookPhotoDetail}
                  />
                ))
              }
            </div>
            : this.renderNoData()
        }

        {/* PhotoDetail */}
        <DetailContainer
          boxUUID={this.state.boxUUID}
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

export default Inbox
