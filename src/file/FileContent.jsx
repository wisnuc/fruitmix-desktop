import React from 'react'
import Debug from 'debug'
import { CircularProgress } from 'material-ui'
import UploadIcon from 'material-ui/svg-icons/file/cloud-upload'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import ContainerOverlay from './ContainerOverlay'
import RenderListByRow from './RenderListByRow'
import GridView from './GridView'

const debug = Debug('component:file:FileContent:')

class FileContent extends React.Component {
  constructor(props) {
    super(props)

    this.state = { contextMenu: false }

    /* cathc key action */
    this.keyDown = (e) => {
      // debug('keyEvent')
      const { copy, createNewFolder, loading, move, rename, share } = this.props.home
      if (copy || createNewFolder || this.props.home.delete || loading || move || rename || share) return
      if (this.props.select) {
        if (e.ctrlKey && e.key === 'a') {
          this.props.select.addByArray(Array.from({ length: this.props.entries.length }, (v, i) => i)) // [0, 1, ..., N]
        }
        if (e.key === 'Delete') this.props.toggleDialog('delete')
        this.props.select.keyEvent(e.ctrlKey, e.shiftKey)
      }
    }

    this.keyUp = (e) => {
      const { copy, createNewFolder, loading, move, rename, share } = this.props.home
      if (copy || createNewFolder || this.props.home.delete || loading || move || rename || share) return
      if (this.props.select) this.props.select.keyEvent(e.ctrlKey, e.shiftKey)
    }

    /* touchTap file */
    this.onRowTouchTap = (e, index) => {
      /*
       * using e.nativeEvent.button instead of e.nativeEvent.which
       * 0 - left
       * 1 - middle
       * 2 - right
       * e.type must be mouseup
       * must be button 1 or button 2 of mouse
       */

      e.preventDefault() // important, to prevent other event
      e.stopPropagation()

      const type = e.type
      const button = e.nativeEvent.button
      if (type !== 'mouseup' || !(button === 0 || button === 2)) return

      /* just touch */
      this.props.select.touchTap(button, index)

      /* right click */
      if (button === 2) {
        this.props.showContextMenu(e.nativeEvent.clientX, e.nativeEvent.clientY)
      }
    }

    this.onRowDoubleClick = (e, index) => {
      if (index === -1) return
      debug('rowDoubleClick', this.props, index)
      const entry = this.props.entries[index]
      this.props.listNavBySelect()
      if (entry.type === 'file') {
        this.setState({ seqIndex: index, preview: true })
      } else {
        debug('should change to loading')
        this.setState({ loading: true })
      }
    }

    this.onRowMouseEnter = (e, index) => {
      this.props.select.mouseEnter(index)
    }

    this.onRowMouseLeave = (e, index) => {
      this.deferredLeave = setTimeout(() => this.props.select.mouseLeave(index), 1)
    }

    /* handle files */
    this.drop = (e) => {
      const files = []
      for (const item of e.dataTransfer.files) files.push(item.path)
      const dir = this.props.home.path
      const dirUUID = dir[dir.length - 1].uuid
      const driveUUID = this.props.home.path[0].uuid
      debug('drop files!!', files, dirUUID, driveUUID, dir)
      if (!dirUUID || !driveUUID) {
        this.props.openSnackBar('共享盘列表不能上传文件或文件夹')
      } else {
        this.props.ipcRenderer.send('DRAG_FILE', { files, dirUUID, driveUUID })
      }
    }

    this.selectBox = null

    this.selectStart = (event) => {
      if (event.nativeEvent.button !== 0) return
      if (!this.props.select.ctrl) this.props.select.addByArray([])
      if (this.selectBox) {
        this.selectEnd(event)
      } else {
        const s = this.refSelectBox.style
        /* show draw box */
        s.display = ''
        s.top = `${event.clientY - 140}px`
        s.left = `${event.clientX - 80}px`
        this.selectBox = { x: event.clientX, y: event.clientY }
        debug('this.selectStart top, left', s.top, s.left)
      }
    }

    this.selectEnd = (event) => {
      debug('this.selectEnd')
      const s = this.refSelectBox.style
      s.display = 'none'
      s.top = '0px'
      s.left = '0px'
      s.width = '0px'
      s.height = '0px'
      this.selectBox = null
    }

    this.drawBox = (event) => {
      const s = this.refSelectBox.style
      const dx = event.clientX - this.selectBox.x
      const dy = event.clientY - this.selectBox.y

      if (dx > 0) s.width = `${dx}px`
      else {
        s.width = `${-dx}px`
        s.left = `${event.clientX - 75 > 0 ? event.clientX - 75 : 0}px`
      }
      if (dy > 0) s.height = `${dy}px`
      else {
        s.height = `${-dy}px`
        s.top = `${event.clientY - 136 > 0 ? event.clientY - 136 : 0}px`
      }
    }

    this.selectRow = (event, scrollTop) => {
      if (!this.selectBox) return

      /* draw select box */
      this.drawBox(event)

      const s = this.refSelectBox.style
      const lineHeight = 48
      const length = this.props.entries.length

      const array = Array
        .from({ length }, (v, i) => i)
        .filter((v, i) => {
          const head = (i + 1) * lineHeight - (parseInt(scrollTop, 10) || 0) // row.tail > top && row.head < top + height
          return ((parseInt(s.top, 10) < head + lineHeight) &&
            (head < parseInt(s.top, 10) + parseInt(s.height, 10)))
        })

      this.props.select.addByArray(array)
    }

    this.selectGrid = (event, { scrollTop, allHeight, indexHeightSum, cellWidth, mapData }) => {
      if (!this.selectBox) return
      debug('this.selectGrid', scrollTop, allHeight, indexHeightSum, cellWidth, mapData)

      /* draw select box */
      this.drawBox(event)
      const s = this.refSelectBox.style
      const top = parseInt(s.top, 10)
      const height = parseInt(s.height, 10)
      const left = parseInt(s.left, 10)
      const width = parseInt(s.width, 10)
      const length = this.props.entries.length

      const array = Array
        .from({ length }, (v, i) => i)
        .filter((v, i) => {
          const head = indexHeightSum[mapData[i]] - indexHeightSum[0] + 32 - (parseInt(scrollTop, 10) || 0)
          const tail = head + allHeight[mapData[i]]
          const start = (i - mapData.findIndex(va => va === mapData[i])) * cellWidth + 77
          const end = start + cellWidth
          // grid.tail > top && grid.head < top + height
          // grid.start > left && grid.end < left + width
          debug('i, head, tail', i, head, tail)
          return ((top < tail) && (head < top + height) && (left < start) && (end < left + width))
        })

      this.props.select.addByArray(array)
    }
  }

  componentDidMount() {
    /* bind keydown event */
    document.addEventListener('keydown', this.keyDown)
    document.addEventListener('keyup', this.keyUp)
  }


  componentWillReceiveProps(nextProps) {
    // debug('componentWillReceiveProps', nextProps)
    if (nextProps.home.loading) this.setState({ loading: true })
    if (this.props.entries !== nextProps.entries) this.setState({ loading: false })
  }

  componentWillUnmount() {
    /* remove keydown event */
    document.removeEventListener('keydown', this.keyDown)
    document.removeEventListener('keyup', this.keyUp)
  }

  renderNoFile() {
    return (
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onTouchTap={e => this.onRowTouchTap(e, -1)}
        onDrop={this.drop}
      >
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
          <UploadIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} />
          <div style={{ fontSize: 24, color: 'rgba(0,0,0,0.27)' }}> { '将文件拖到此处' } </div>
          <div style={{ color: 'rgba(0,0,0,0.27)' }}> { '或点击上传按钮' } </div>
        </div>
      </div>
    )
  }

  renderOffLine() {
    return (
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onTouchTap={e => this.onRowTouchTap(e, -1)}
      >
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
          <ErrorIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} />
          <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.27)' }}> { '网络连接已断开，请检查网络设置' } </div>
        </div>
      </div>
    )
  }

  renderLoading() {
    return (
      <div style={{ width: '100%', height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={32} thickness={3} />
      </div>
    )
  }

  render() {
    // debug('render FileContent loading', this.state.loading)

    /* not get list yet */
    if (!this.props.home.path.length) return (<div />)

    /* dir is empty */
    if (this.props.entries && !this.props.entries.length) return this.renderNoFile()

    /* lost connection to wisnuc */
    if (!window.navigator.onLine) return this.renderOffLine()

    /* got list */
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {/* render list */}
        {
          this.state.loading
            ? this.renderLoading()
            : this.props.gridView
            ? <GridView
              {...this.props}
              onRowTouchTap={this.onRowTouchTap}
              onRowMouseEnter={this.onRowMouseEnter}
              onRowMouseLeave={this.onRowMouseLeave}
              onRowDoubleClick={this.onRowDoubleClick}
              selectStart={this.selectStart}
              selectEnd={this.selectEnd}
              selectGrid={this.selectGrid}
              drop={this.drop}
            />
            :
            <RenderListByRow
              {...this.props}
              onRowTouchTap={this.onRowTouchTap}
              onRowMouseEnter={this.onRowMouseEnter}
              onRowMouseLeave={this.onRowMouseLeave}
              onRowDoubleClick={this.onRowDoubleClick}
              selectStart={this.selectStart}
              selectEnd={this.selectEnd}
              selectRow={this.selectRow}
              drop={this.drop}
            />
        }

        {/* preview file */}
        <ContainerOverlay
          onRequestClose={() => this.setState({ preview: false })}
          open={this.state.preview}
          items={this.props.entries}
          seqIndex={this.state.seqIndex}
          ipcRenderer={this.props.ipcRenderer}
          setAnimation={this.props.setAnimation}
          memoize={this.props.memoize}
          download={this.props.download}
          primaryColor={this.props.primaryColor}
          path={this.props.home.path}
          select={this.props.select.touchTap}
        />

        {/* selection */}
        {/*
        <div
          style={{ zIndex: 10000, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'none' }}
          onMouseDown={e => this.selectStart(e)}
          onMouseUp={e => this.selectEnd(e)}
          onMouseMove={e => this.selectRow(e)}
          onMouseLeave={e => 0 && this.selectEnd(e)}
          draggable={false}
          onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          {
            this.props.entries.map(() => <div style={{ width: 20, height: 20, margin: 8, backgroundColor: 'grey', float: 'left' }} />)
          }
        </div>
        */}
        <div
          ref={ref => (this.refSelectBox = ref)}
          onMouseDown={e => this.selectStart(e)}
          onMouseUp={e => this.selectEnd(e)}
          onMouseMove={e => this.selectRow(e)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            display: 'none',
            border: '1px red solid'
          }}
        >
        </div>
      </div>
    )
  }
}

export default FileContent
