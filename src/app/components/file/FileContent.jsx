import React, { Component, PureComponent } from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { Avatar } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box'
import ToggleCheckBoxOutlineBlank from 'material-ui/svg-icons/toggle/check-box-outline-blank'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileFolder from 'material-ui/svg-icons/file/folder'

import { List, AutoSizer } from 'react-virtualized'
import { command } from '../../lib/command'

const debug = Debug('component:file:FileContent:')

const formatTime = (mtime) => {
  if (!mtime) {
    return null
  }

  const time = new Date()
  time.setTime(parseInt(mtime, 10))
  return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`
}

const renderLeading = (leading) => {
  let height = '100%'
  let backgroundColor = '#FFF'
  let opacity = 0

  switch (leading) {
    case 'inactiveHint':
      height = 20
      backgroundColor = '#000'
      opacity = 0.26
      break
    case 'activeHint':
      height = 20
      backgroundColor = '#FF0000'
      opacity = 1
      break
    case 'fullOn':
      backgroundColor = '#FF0000'
      opacity = 1
      break
  }

  return <div style={{ flex: '0 0 4px', height, backgroundColor, opacity, zIndex: 1000 }} />
}

const renderCheck = check =>
  (check === 'checked' || check === 'unchecking')
    ? <ToggleCheckBox style={{ color: '#FF0000' }} />
    : check === 'checking'
      ? <ToggleCheckBoxOutlineBlank style={{ color: 'rgba(0,0,0,0.38)' }} />
      : null

class Row extends PureComponent {

  render() {
    const {

      /* these are react-virtualized List props */
      index,       // Index of row
      isScrolling, // The List is currently being scrolled
      isVisible,   // This row is visible within the List (eg it is not an overscanned row)
      parent,      // Reference to the parent List (instance)
      style,       // Style object to be applied to row (to position it);
                   // This must be passed through to the rendered row element.

      /* these are view-model state */
      entries,
      select
    } = this.props

    const entry = entries[index]
    const leading = select.rowLeading(index)
    const check = select.rowCheck(index)
    const color = select.rowColor(index)

    const innerStyle = {
      width: '100%',
      height: '100%',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center'
    }

    const outerStyle = style
    // debug('select', select)

    return (
      <div key={`${entry.name}+${index.toString()}`} style={outerStyle}>
        <div
          style={innerStyle}
          onTouchTap={e => this.props.onRowTouchTap(e, index)}
          onMouseEnter={e => this.props.onRowMouseEnter(e, index)}
          onMouseLeave={e => this.props.onRowMouseLeave(e, index)}
          onDoubleClick={e => this.props.onRowDoubleClick(e, index)}
        >
          { renderLeading(leading) }
          <div style={{ flex: '0 0 8px' }} />
          <div style={{ flex: '0 0 36px', display: 'flex', alignItems: 'center' }}>
            { renderCheck(check) }
          </div>
          <div style={{ flex: '0 0 8px' }} />

          {/* file type may be: folder, public, directory, file, unsupported */}
          <div style={{ flex: '0 0 48px', display: 'flex', alignItems: 'center' }}>
            <Avatar style={{ backgroundColor: 'white' }}>
              {
                entry.type === 'folder' || entry.type === 'public' || entry.type === 'directory'
                ? <FileFolder style={{ color: 'rgba(0,0,0,0.54)' }} />
                : entry.type === 'file'
                ? <EditorInsertDriveFile style={{ color: 'rgba(0,0,0,0.54' }} />
                : <ErrorIcon style={{ color: 'rgba(0,0,0,0.54' }} />
              }
            </Avatar>
          </div>

          <div style={{ flex: '0 0 390px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            { entry.name }
          </div>

          <div style={{ flex: '0 1 160px', fontSize: 13, color: 'rgba(0,0,0,0.54)', textAlign: 'right' }}>
            { entry.mtime && formatTime(entry.mtime) }
          </div>

          <div
            style={{ flex: '0 1 160px',
              fontSize: 13,
              color: 'rgba(0,0,0,0.54)',
              textAlign: 'right',
              marginRight: 72 }}
          >
            { entry.type === 'file' && prettysize(entry.size) }
          </div>

          <div style={{ flexGrow: 1 }} />
        </div>
      </div>
    )
  }
}

class FileContent extends Component {

  constructor(props) {
    super(props)

    this.state = { contextMenu: false }

    this.keyDownBound = this.keyDown.bind(this)
    this.keyUpBound = this.keyUp.bind(this)

    this.onRowTouchTap = this.rowTouchTap.bind(this)
    this.onRowMouseEnter = this.rowMouseEnter.bind(this)
    this.onRowMouseLeave = this.rowMouseLeave.bind(this)
    this.onRowDoubleClick = this.rowDoubleClick.bind(this)

    this.rowRenderer = props => (
      <Row
        {...props}
        {...this.props}
        onRowTouchTap={this.onRowTouchTap}
        onRowMouseEnter={this.onRowMouseEnter}
        onRowMouseLeave={this.onRowMouseLeave}
        onRowDoubleClick={this.onRowDoubleClick}
      />
    )
  }

  willReceiveProps(nextProps) {
    // console.log(nextProps, '.......')
  }

  componentDidMount() {
    // bind keydown event
    document.addEventListener('keydown', this.keyDownBound)
    document.addEventListener('keyup', this.keyUpBound)
  }

  componentWillUnmount() {
    // remove keydown event
    document.removeEventListener('keydown', this.keyDownBound)
    document.removeEventListener('keyup', this.keyUpBound)
  }

  keyDown(e) {
    if (this.props.select) { this.props.select.keyEvent(e.ctrlKey, e.shiftKey) }
  }

  keyUp(e) {
    if (this.props.select) { this.props.select.keyEvent(e.ctrlKey, e.shiftKey) }
  }

  rowTouchTap(e, index) {
    /*
     * using e.nativeEvent.button instead of e.nativeEvent.which
     * 0 - left
     * 1 - middle
     * 2 - right
     * e.type must be mouseup
     * must be button 1 or button 2 of mouse
     */

    e.preventDefault()  // important!
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

  rowMouseEnter(e, index) {
    this.props.select.mouseEnter(index)
  }

  rowMouseLeave(e, index) {
    this.deferredLeave = setTimeout(() => this.props.select.mouseLeave(index), 1)
  }

  rowDoubleClick(e, index) {
    if (index === -1) return
    this.props.listNavBySelect()
  }

  drop(e) {
    const files = []
    for (const item of e.dataTransfer.files) files.push(item.path)
    const dir = this.props.home.path
    const rUUID = this.props.home.path[0].uuid
    command('fileapp', 'DRAG_FILE', { files, dirUUID: dir[dir.length - 1].uuid })
  }

  render() {
    const { apis } = this.props
    // debug('render FileContent', this.props, this.state)

    return (
      <div id="file-content" style={{ width: '100%', height: '100%' }} onDrop={this.drop.bind(this)}>
        {/* header*/}
        <div style={{ width: '100%', height: 40 }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: '0 0 104px' }} />
            <div
              style={{
                flex: '0 0 390px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                fontSize: 14,
                fontWeight: 500,
                color: 'rgba(0,0,0,0.54)'
              }}
            >
              类型
            </div>
            <div style={{ flex: '0 1 160px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.54)', textAlign: 'right' }}>
              修改时间
            </div>
            <div
              style={{
                flex: '0 1 160px',
                fontSize: 14,
                fontWeight: 500,
                color: 'rgba(0,0,0,0.54)',
                textAlign: 'right',
                marginRight: 72
              }}
            >
              文件大小
            </div>
            <div style={{ flexGrow: 1 }} />
          </div>
        </div>
        <div style={{ width: '100%', height: 8 }} />

        {/* list content */}
        <div style={{ width: '100%', height: 'calc(100% - 48px)' }}>
          {
            this.props.entries.length !== 0 &&
            <AutoSizer>
              {({ height, width }) => (
                <div onTouchTap={e => this.onRowTouchTap(e, -1)}>
                  <List
                    style={{ outline: 'none' }}
                    height={height}
                    width={width}
                    rowCount={this.props.select.size}
                    rowHeight={48}
                    rowRenderer={this.rowRenderer}
                  />
                </div>
              )}
            </AutoSizer>
          }
        </div>
      </div>
    )
  }
}

export default FileContent

