import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { Avatar } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box'
import ToggleCheckBoxOutlineBlank from 'material-ui/svg-icons/toggle/check-box-outline-blank'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileFolder from 'material-ui/svg-icons/file/folder'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import ArrowUpward from 'material-ui/svg-icons/navigation/arrow-upward'
import ArrowDownward from 'material-ui/svg-icons/navigation/arrow-downward'
import { List, AutoSizer } from 'react-virtualized'
import { TXTIcon, WORDIcon, EXCELIcon, PPTIcon, PDFIcon } from '../common/Svg'

const debug = Debug('component:file:RenderListByRow:')

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

const renderFileIcon = (name, metadata) => {
  /* media */
  if (metadata) return <PhotoIcon style={{ color: '#ea4335' }} />

  /* PDF, TXT, Word, Excel, PPT */
  let extension = name.replace(/^.*\./, '')
  if (!extension || extension === name) extension = 'OTHER'
  switch (extension.toUpperCase()) {
    case 'PDF':
      return (<PDFIcon style={{ color: '#db4437' }} />)
    case 'TXT':
      return (<TXTIcon style={{ color: 'rgba(0,0,0,0.54)' }} />)
    case 'DOCX':
      return (<WORDIcon style={{ color: '#4285f4' }} />)
    case 'DOC':
      return (<WORDIcon style={{ color: '#4285f4' }} />)
    case 'XLS':
      return (<EXCELIcon style={{ color: '#0f9d58' }} />)
    case 'XLSX':
      return (<EXCELIcon style={{ color: '#0f9d58' }} />)
    case 'PPT':
      return (<PPTIcon style={{ color: '#db4437' }} />)
    case 'PPTX':
      return (<PPTIcon style={{ color: '#db4437' }} />)
    case 'OTHER':
      return (<EditorInsertDriveFile style={{ color: 'rgba(0,0,0,0.54)' }} />)
    default:
      return (<EditorInsertDriveFile style={{ color: 'rgba(0,0,0,0.54)' }} />)
  }
}

class Row extends React.PureComponent {
  render() {
    // debug('renderRow this.props', this.props)
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

    return (
      <div key={entry.name} style={style}>
        <div
          style={{ width: '100%', height: '100%', backgroundColor: color, display: 'flex', alignItems: 'center' }}
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
                ? renderFileIcon(entry.name, entry.metadata)
                : <ErrorIcon style={{ color: 'rgba(0,0,0,0.54)' }} />
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

class RenderListByRow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      type: ''
    }

    this.enterDiv = (type) => {
      this.setState({ type })
    }

    this.leaveDiv = () => {
      this.setState({ type: '' })
    }
  }

  render() {
    // debug('RenderListByRow redner', this.props)
    const headers = [
      { title: '名称', width: 494, up: 'nameUp', down: 'nameDown' },
      { title: '修改时间', width: 160, up: 'timeUp', down: 'timeDown' },
      { title: '文件大小', width: 160, up: 'sizeUp', down: 'sizeDown' }
    ]

    const rowRenderer = props => (
      <Row
        {...props}
        {...this.props}
        onRowTouchTap={this.props.onRowTouchTap}
        onRowMouseEnter={this.props.onRowMouseEnter}
        onRowMouseLeave={this.props.onRowMouseLeave}
        onRowDoubleClick={this.props.onRowDoubleClick}
      />
    )

    return (
      <div style={{ width: '100%', height: '100%' }} onDrop={this.props.drop}>
        {/* header*/}
        <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: '0 0 104px' }} />
          {
            headers.map(h => (
              <div
                key={h.title}
                style={{
                  width: h.width,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: this.state.type === h.title ? 'pointer' : 'default'
                }}
                onMouseMove={() => this.enterDiv(h.title)}
                onMouseLeave={() => this.leaveDiv(h.title)}
                onTouchTap={() => {
                  this.props.sortType === h.up ? this.props.changeSortType(h.down) : this.props.changeSortType(h.up)
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: this.state.type === h.title ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.54)'
                  }}
                >
                  { h.title }
                </div>
                <div style={{ marginLeft: 8, marginTop: 6 }}>
                  { this.props.sortType === h.up && <ArrowUpward style={{ height: 18, width: 18, color: '#9E9E9E' }} /> }
                  { this.props.sortType === h.down && <ArrowDownward style={{ height: 18, width: 18, color: '#9E9E9E' }} /> }
                </div>
              </div>
            ))
          }
          <div style={{ flexGrow: 1 }} />
        </div>

        <div style={{ height: 8 }} />

        {/* list content */}
        <div style={{ width: '100%', height: 'calc(100% - 48px)' }}>
          {
            this.props.entries.length !== 0 &&
            <AutoSizer>
              {({ height, width }) => (
                <div onTouchTap={e => this.props.onRowTouchTap(e, -1)}>
                  <List
                    style={{ outline: 'none' }}
                    height={height}
                    width={width}
                    rowCount={this.props.select.size}
                    rowHeight={48}
                    rowRenderer={rowRenderer}
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

export default RenderListByRow
