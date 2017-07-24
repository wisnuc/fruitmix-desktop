import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
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
      if (this.props.select) { this.props.select.keyEvent(e.ctrlKey, e.shiftKey) }
    }

    this.keyUp = (e) => {
      if (this.props.select) { this.props.select.keyEvent(e.ctrlKey, e.shiftKey) }
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

      e.preventDefault()  // important, to prevent other event
      e.stopPropagation()

      const type = e.type
      const button = e.nativeEvent.button
      if (type !== 'mouseup' || !(button === 0 || button === 2)) return

      /* just touch */
      this.props.select.touchTap(button, index)
      this.props.updateDetail(index)

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
        // ipcRenderer.send('OPEN_FILE', { file: entry, path: this.props.home.path })
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
      const rUUID = this.props.home.path[0].uuid
      ipcRenderer.send('DRAG_FILE', { files, dirUUID: dir[dir.length - 1].uuid })
    }

    this.openFile = (file) => {
      ipcRenderer.send('OPEN_FILE', { file, path: this.props.home.path })
    }
  }

  componentDidMount() {
    /* bind keydown event */
    document.addEventListener('keydown', this.keyDown)
    document.addEventListener('keyup', this.keyUp)
  }

  componentWillUnmount() {
    /* remove keydown event */
    document.removeEventListener('keydown', this.keyDown)
    document.removeEventListener('keyup', this.keyUp)
  }

  render() {
    debug('render FileContent', this.props, this.state)
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {/* render list */}
        {
          this.props.gridView ?
            <GridView
              {...this.props}
              onRowTouchTap={this.onRowTouchTap}
              onRowMouseEnter={this.onRowMouseEnter}
              onRowMouseLeave={this.onRowMouseLeave}
              onRowDoubleClick={this.onRowDoubleClick}
              drop={this.props.drop}
            />
            :
            <RenderListByRow
              {...this.props}
              onRowTouchTap={this.onRowTouchTap}
              onRowMouseEnter={this.onRowMouseEnter}
              onRowMouseLeave={this.onRowMouseLeave}
              onRowDoubleClick={this.onRowDoubleClick}
              drop={this.props.drop}
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
          openByLocal={this.props.openByLocal}
          primaryColor={this.props.primaryColor}
        />
      </div>
    )
  }
}

export default FileContent
