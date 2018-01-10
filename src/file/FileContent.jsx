import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import EventListener from 'react-event-listener'
import { CircularProgress, Avatar } from 'material-ui'
import UploadIcon from 'material-ui/svg-icons/file/cloud-upload'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import ContainerOverlay from './ContainerOverlay'
import RenderListByRow from './RenderListByRow'
import GridView from './GridView'
import renderFileIcon from '../common/renderFileIcon'

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

    this.handleResize = () => this.forceUpdate()

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
      // debug('rowDoubleClick', this.props, index)
      const entry = this.props.entries[index]
      this.props.listNavBySelect()
      if (entry.type === 'file') {
        this.setState({ seqIndex: index, preview: true })
      } else {
        // debug('should change to loading')
        this.setState({ loading: true })
      }
    }

    this.onRowMouseEnter = (e, index) => {
      this.props.select.mouseEnter(index)
    }

    this.onRowMouseLeave = (e, index) => {
      this.deferredLeave = setImmediate(() => this.props.select.mouseLeave(index))
    }

    /* handle files */
    this.drop = (e) => {
      const files = [...e.dataTransfer.files].map(f => f.path)
      const dir = this.props.home.path
      const dirUUID = dir[dir.length - 1].uuid
      const driveUUID = this.props.home.path[0].uuid
      // debug('drop files!!', files, dirUUID, driveUUID, dir)
      if (!dirUUID || !driveUUID) {
        this.props.openSnackBar(i18n.__('No Drag File Warning in Public'))
      } else {
        this.props.ipcRenderer.send('DRAG_FILE', { files, dirUUID, driveUUID })
      }
    }


    /* selectBox
     * if mode === row
     *   selectStart -> selectRow -> drawBox && calcRow -> selectEnd
     *               -> onScroll ->        calcRow      ->
     *
     * if mode === grid
     *   selectStart -> selectGrid -> drawBox && calcGrid -> selectEnd
     *               -> onScroll ->        calcGrid       ->
     */

    this.selectBox = null

    this.selectStart = (event, scrollTop) => {
      if (event.nativeEvent.button !== 0) return
      if (this.selectBox) {
        this.selectEnd(event)
      } else {
        /* when click scroll bar, don't draw select box */
        const w = event.target.style.width
        if (w && w !== '100%' && parseInt(w, 10) > 200 && event.clientX - 56 > parseInt(w, 10)) return

        /* show draw box */
        const s = this.refSelectBox.style
        s.display = ''
        s.top = `${event.clientY - 140}px`
        s.left = `${event.clientX - 80}px`
        this.selectBox = { x: event.clientX, y: event.clientY, session: (new Date()).getTime() }
        this.preScrollTop = scrollTop || this.preScrollTop
        document.addEventListener('mousemove', this.exSelect)
        document.addEventListener('mouseup', this.selectEnd, true)
      }
    }

    this.selectEnd = (event) => {
      if (!this.selectBox) return
      const s = this.refSelectBox.style
      s.display = 'none'
      s.top = '0px'
      s.left = '0px'
      s.width = '0px'
      s.height = '0px'
      this.selectBox = null
      this.preScrollTop = 0
      this.scrollTop = 0
      document.removeEventListener('mousemove', this.exSelect)
      document.removeEventListener('mouseup', this.selectEnd)
    }

    /* draw select box */
    this.drawBox = (event) => {
      const s = this.refSelectBox.style
      const dx = event.clientX - this.selectBox.x
      const dy = event.clientY - this.selectBox.y
      // debug('event.clientX event.clientY', event.clientX, event.clientY)
      if (dy < 0) this.up = true
      else this.up = false

      if (dx > 0) s.width = `${dx}px`
      else if (event.clientX - 75 > 0) {
        s.width = `${-dx}px`
        s.left = `${event.clientX - 75}px`
      } else {
        s.width = `${this.selectBox.x - 75}px`
        s.left = '0px'
      }

      if (dy > 0) s.height = `${dy}px`
      else if (event.clientY - 136 > 48) {
        s.height = `${-dy}px`
        s.top = `${event.clientY - 136}px`
      } else {
        s.height = `${this.selectBox.y - 184}px`
        s.top = '48px'
      }
    }

    this.onScroll = (scrollTop) => {
      if (!this.selectBox) return
      const s = this.refSelectBox.style
      const dy = scrollTop - this.preScrollTop
      this.preScrollTop = scrollTop

      if (this.up) {
        s.height = `${parseInt(s.height, 10) - dy}px`
      } else {
        s.top = `${parseInt(s.top, 10) - dy}px`
        s.height = `${parseInt(s.height, 10) + dy}px`
      }

      this.selectBox.y -= dy

      if (this.props.gridView) this.calcGrid(Object.assign(this.data, { scrollTop }))
      else this.calcRow(scrollTop)
    }

    /* calc rows should be selected */
    this.calcRow = (scrollTop) => {
      const s = this.refSelectBox.style
      const lineHeight = 48
      const length = this.props.entries.length

      const array = Array
        .from({ length }, (v, i) => i)
        .filter((v, i) => {
          const head = (i + 1) * lineHeight - scrollTop // row.tail > top && row.head < top + height
          return ((parseInt(s.top, 10) < head + lineHeight) &&
            (head < parseInt(s.top, 10) + parseInt(s.height, 10)))
        })

      this.props.select.addByArray(array, this.selectBox.session)
    }

    this.selectRow = (event, scrollTop) => {
      if (!this.selectBox) return
      this.scrollTop = scrollTop || this.scrollTop || 0
      this.preScrollTop = this.scrollTop
      this.drawBox(event)
      this.calcRow(this.scrollTop)
    }

    /* calc rows should be selected */
    this.calcGrid = (data) => {
      const { scrollTop, allHeight, indexHeightSum, mapData } = data
      const s = this.refSelectBox.style
      const top = parseInt(s.top, 10)
      const height = parseInt(s.height, 10)
      const left = parseInt(s.left, 10)
      const width = parseInt(s.width, 10)
      const length = this.props.entries.length

      const array = Array
        .from({ length }, (v, i) => i)
        .filter((v, i) => {
          const lineNum = mapData[i]
          const lineHeight = allHeight[lineNum] // 112, 64, 248, 200
          const head = (lineNum > 0 ? indexHeightSum[lineNum - 1] + ((lineHeight === 248) && 48) : 48) + 24 - scrollTop
          const tail = head + (lineHeight < 200 ? 48 : 184)
          if (!(tail > top) || !(head < top + height)) return false
          const start = (i - mapData.findIndex(va => va === lineNum)) * 200 + 48
          const end = start + 180
          /* grid.tail > top && grid.head < top + height && grid.end > left && grid.start < left + width */
          return ((end > left) && (start < left + width))
        })
      this.props.select.addByArray(array, this.selectBox.session)
    }

    this.selectGrid = (event, data) => {
      if (!this.selectBox) return
      this.data = data || this.data
      const { scrollTop } = this.data
      this.preScrollTop = scrollTop
      this.drawBox(event)
      this.calcGrid(this.data)
    }

    this.exSelect = e => (this.props.gridView ? this.selectGrid(e, this.data) : this.selectRow(e, this.scrollTop))

    /* request task state */
    this.getTaskState = async (uuid) => {
      await Promise.delay(500)
      const res = await this.props.apis.pureRequestAsync('task', { uuid })
      const data = this.props.apis.stationID ? res.body.data : res.body
      if (data && data.nodes && data.nodes.findIndex(n => n.parent === null && n.state === 'Finished') > -1) return 'Finished'
      if (data && data.nodes && data.nodes.findIndex(n => n.state === 'Conflict') > -1) return 'Conflict'
      return 'Working'
    }

    /* finish post change dialog content to waiting/result */
    this.finish = (error, data) => {
      const type = i18n.__('Move')
      if (error) return this.props.openSnackBar(type.concat(i18n.__('+Failed')), { showTasks: true })

      this.getTaskState(data.uuid).asCallback((err, res) => {
        if (err) {
          this.props.openSnackBar(type.concat(i18n.__('+Failed')), { showTasks: true })
        } else {
          let text = 'Working'
          if (res === 'Finished') text = type.concat(i18n.__('+Success'))
          if (res === 'Conflict') text = i18n.__('Task Conflict Text')
          this.props.refresh()
          this.props.openSnackBar(text, res !== 'Finished' ? { showTasks: true } : null)
        }
      })
    }

    /* drag row */
    this.dragRow = (e) => {
      //  console.log('this.dragRow', this.props.select.selected[0], this.RDSI)
      const s = this.refDragedItems.style
      if (!this.props.select.selected.includes(this.RDSI)) {
        this.props.select.addByArray([this.RDSI], (new Date()).getTime())
      } else if (s.display !== 'flex') {
        s.display = 'flex'
      } else {
        s.width = '180px'

        const RDTop = `${this.RDSI * 48 + 48 - (this.preScrollTop || 0)}px`
        if (!s.top || s.top === RDTop) s.top = `${e.clientY - 130}px`
        else s.marginTop = `${e.clientY - 130 - parseInt(s.top, 10)}px`

        if (!s.left || s.left === '0px') s.left = `${e.clientX - 70}px`
        else s.marginLeft = `${e.clientX - 70 - parseInt(s.left, 10)}px`
      }
      if (!this.entry.type) this.forceUpdate()
    }

    this.shouldFire = () => {
      const { select, entries } = this.props
      const { hover } = select
      return hover > -1 && select.rowDrop(hover) && entries[hover].type === 'directory' && this.RDSI !== hover
    }

    this.dragEnd = () => {
      document.removeEventListener('mousemove', this.dragRow)
      document.removeEventListener('mouseup', this.dragEnd)
      if (!this.refDragedItems) return
      const hover = this.props.select.hover
      if (this.shouldFire()) {
        const type = 'move'

        const path = this.props.home.path
        const dir = path[path.length - 1].uuid
        const drive = path[0].uuid
        const src = { drive, dir }
        const dst = { drive, dir: this.props.entries[hover].uuid }

        const entries = this.props.select.selected.map(i => this.props.entries[i].uuid)
        const policies = { dir: ['keep', null] }

        this.props.apis.request('copy', { type, src, dst, entries, policies }, this.finish)
      }
      const s = this.refDragedItems.style
      s.transition = 'all 225ms cubic-bezier(.4,0,1,1)'
      s.top = `${this.RDSI * 48 + 48 - (this.preScrollTop || 0)}px`
      s.left = '0px'
      s.marginTop = '0px'
      s.marginLeft = '0px'
      s.width = '100%'

      this.RDSI = -1
      this.props.select.toggleDrag([])

      setTimeout(() => {
        s.display = 'none'
        s.transition = 'all 225ms cubic-bezier(.4,0,1,1)'
        s.transitionProperty = 'top, left, width'
      }, 450)
    }

    this.rowDragStart = (event, index) => {
      /* only left click */
      if (event.nativeEvent.button !== 0) return
      /* not public */
      if (this.props.entries[index].type === 'public') return
      this.RDSI = index // rowDragStartIndex
      const selected = this.props.select.selected
      this.props.select.toggleDrag(selected.includes(this.RDSI) ? selected : [this.RDSI])

      /* show drag item */
      // this.refDragedItems.style.display = 'flex'
      this.refDragedItems.style.top = `${this.RDSI * 48 + 48 - (this.preScrollTop || 0)}px`

      document.addEventListener('mousemove', this.dragRow)
      document.addEventListener('mouseup', this.dragEnd, true)
    }
  }

  componentDidMount() {
    /* bind keydown event */
    document.addEventListener('keydown', this.keyDown)
    document.addEventListener('keyup', this.keyUp)
  }


  componentWillReceiveProps(nextProps) {
    // debug('componentWillReceiveProps', this.props, nextProps)
    if (nextProps.home.loading) this.setState({ loading: true })
    if (nextProps.entries && this.props.entries !== nextProps.entries) this.setState({ loading: false })
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
          <div style={{ fontSize: 24, color: 'rgba(0,0,0,0.27)' }}> { i18n.__('No File Text 1') } </div>
          <div style={{ color: 'rgba(0,0,0,0.27)' }}> { i18n.__('No File Text 2') } </div>
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
          <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.27)' }}> { i18n.__('Offline Text') } </div>
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
    // debug('render FileContent loading', this.props.home.loading, this.state.loading)

    /* loding */
    if (this.state.loading) return this.renderLoading()

    /* not get list yet */
    if (!this.props.home.path || !this.props.home.path.length) return (<div />)

    /* dir is empty */
    if (this.props.entries && !this.props.entries.length) return this.renderNoFile()

    /* lost connection to wisnuc */
    if (!window.navigator.onLine) return this.renderOffLine()

    this.entry = this.RDSI > -1 && this.props.entries[this.RDSI] || {}

    /* got list */
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <EventListener target="window" onResize={this.handleResize} />
        {/* render list */}
        {
          this.props.gridView
            ? <GridView
              {...this.props}
              onRowTouchTap={this.onRowTouchTap}
              onRowMouseEnter={this.onRowMouseEnter}
              onRowMouseLeave={this.onRowMouseLeave}
              onRowDoubleClick={this.onRowDoubleClick}
              selectStart={this.selectStart}
              selectEnd={this.selectEnd}
              selectGrid={this.selectGrid}
              onScroll={this.onScroll}
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
              rowDragStart={this.rowDragStart}
              onScroll={this.onScroll}
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
          apis={this.props.apis}
        />

        {/* selection box */}
        <div
          ref={ref => (this.refSelectBox = ref)}
          onMouseDown={e => this.selectStart(e)}
          onMouseUp={e => this.selectEnd(e)}
          onMouseMove={e => (this.props.gridView ? this.selectGrid(e, this.data) : this.selectRow(e, this.scrollTop))}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            display: 'none',
            backgroundColor: 'rgba(0, 137, 123, 0.26)',
            border: `1px ${this.props.primaryColor} dashed`
          }}
        />

        {/* dragged items */}
        <div
          ref={ref => (this.refDragedItems = ref)}
          onMouseUp={e => this.dragEnd(e)}
          onMouseMove={e => (this.props.gridView ? this.dragGrid(e) : this.dragRow(e))}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            marginLeft: 0,
            width: '100%',
            height: 48,
            transition: 'all 225ms cubic-bezier(.4,0,1,1)',
            transitionProperty: 'top, left, width',
            display: 'none',
            alignItems: 'center',
            color: '#FFF',
            backgroundColor: this.props.primaryColor
          }}
        >
          <div style={{ flexGrow: 1, maxWidth: 48 }} />
          {/* file type may be: folder, public, directory, file, unsupported */}
          <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', margin: 12 }}>
            <Avatar style={{ backgroundColor: 'white', width: 30, height: 30 }}>
              {
                this.entry.type === 'directory'
                ? <FileFolder style={{ color: 'rgba(0,0,0,0.54)', width: 24, height: 24 }} />
                : this.entry.type === 'file'
                ? renderFileIcon(this.entry.name, this.entry.metadata, 24)
                : <ErrorIcon style={{ color: 'rgba(0,0,0,0.54)', width: 24, height: 24 }} />
              }
            </Avatar>
          </div>
          <div
            style={{
              width: 114,
              marginRight: 12,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis'
            }}
          >
            { this.entry.name }
          </div>
          {
            this.props.select.selected.length > 1 &&
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  boxSizing: 'border-box',
                  backgroundColor: this.shouldFire() ? this.props.primaryColor : '#FF4081',
                  border: '1px solid rgba(0,0,0,0.18)',
                  color: '#FFF',
                  fontWeight: 500,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                { this.props.select.selected.length }
              </div>
          }
        </div>
      </div>
    )
  }
}

export default FileContent
