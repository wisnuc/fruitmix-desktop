import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import EventListener from 'react-event-listener'
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
      this.deferredLeave = setTimeout(() => this.props.select.mouseLeave(index), 1)
    }

    /* handle files */
    this.drop = (e) => {
      const files = []
      for (const item of e.dataTransfer.files) files.push(item.path)
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
      const { scrollTop, allHeight, indexHeightSum, mapData } = this.data
      this.preScrollTop = scrollTop
      this.drawBox(event)
      this.calcGrid(this.data)
    }

    this.exSelect = e => (this.props.gridView ? this.selectGrid(e, this.data) : this.selectRow(e, this.scrollTop))
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
      </div>
    )
  }
}

export default FileContent
