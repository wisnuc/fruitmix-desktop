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
import { List, AutoSizer, Grid } from 'react-virtualized'
import { TXTIcon, WORDIcon, EXCELIcon, PPTIcon, PDFIcon } from '../common/Svg'

const debug = Debug('component:file:GridView:')

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
    const { isScrolling, entries, select, list } = this.props

    debug('render row this.props', this.props)
    return (
      <div
        style={{
          height: '100%',
          width: '100%'
        }}
      >
        {
          list.first &&
            <div style={{ height: 32, fontSize: 14, color: 'rgba(0,0,0,0.54)', marginTop: 6 }}>
              { list.entries[0].entry.type === 'directory' ? '文件夹' : '文件' }
            </div>
        }

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {
          list.entries.map((item) => {
            const { index, entry } = item
            return (
              <div
                style={{
                  width: 180,
                  height: 184,
                  marginRight: 20,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'grey'
                }}
                onTouchTap={e => this.props.onRowTouchTap(e, index)}
                onMouseEnter={e => this.props.onRowMouseEnter(e, index)}
                onMouseLeave={e => this.props.onRowMouseLeave(e, index)}
                onDoubleClick={e => this.props.onRowDoubleClick(e, index)}
              >
                { entry.name }
              </div>
            )
          })
        }
        </div>
      </div>
    )
  }
}

class GridView extends React.Component {
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
    const calcGridInfo = (height, width, entries) => {
      const MAX = Math.floor((width) / 200) - 1
      let MaxItem = 0
      let lineIndex = 0
      let lastType = 'diriectory'
      this.allHeight = []
      this.rowHeightSum = 0
      this.indexHeightSum = []
      this.maxScrollTop = 0

      const firstFileIndex = entries.findIndex(item => item.type === 'file')
      this.mapData = []
      entries.forEach((entry, index) => {
        if (MaxItem === 0 || lastType !== entry.type) {
          /* add new row */
          this.mapData.push({
            first: (!index || index === firstFileIndex),
            index: lineIndex,
            entries: [{ entry, index }]
          })

          MaxItem = MAX
          lastType = entry.type
          lineIndex += 1
        } else {
          MaxItem -= 1
          this.mapData[this.mapData.length - 1].entries.push({ entry, index })
        }
      })

      /* simulate large list */
      for (let i = 1; i <= 0; i++) {
        this.mapData.push(...this.mapData)
      }
      /* calculate each row's heigth and their sum */
      this.mapData.forEach((list) => {
        const tmp = 200 + !!list.first * 32
        this.allHeight.push(tmp)
        this.rowHeightSum += tmp
        this.indexHeightSum.push(this.rowHeightSum)
      })

      this.maxScrollTop = this.rowHeightSum - height + 16 * 2

      return {
        mapData: this.mapData,
        allHeight: this.allHeight,
        rowHeightSum: this.rowHeightSum,
        indexHeightSum: this.indexHeightSum,
        maxScrollTop: this.maxScrollTop
      }
    }

    debug('GridView render', this.props)

    if (!this.props.entries || this.props.entries.length === 0) return (<div />)
    return (
      <div style={{ width: '100%', height: '100%' }} onDrop={this.props.drop}>
        <div style={{ height: 24 }} />
        <AutoSizer>
          {({ height, width }) => {
            const gridInfo = calcGridInfo(height, width, this.props.entries)
            const { mapData, allHeight, rowHeightSum, indexHeightSum, maxScrollTop } = gridInfo
            debug('gridInfo', gridInfo)

            const estimatedRowSize = rowHeightSum / allHeight.length
            const rowHeight = ({ index }) => allHeight[index]

            const rowRenderer = ({ key, index, style, isScrolling }) => (
              <div key={key} style={style} >
                <Row
                  {...this.props}
                  isScrolling={isScrolling}
                  list={mapData[index]}
                  onRowTouchTap={this.props.onRowTouchTap}
                  onRowMouseEnter={this.props.onRowMouseEnter}
                  onRowMouseLeave={this.props.onRowMouseLeave}
                  onRowDoubleClick={this.props.onRowDoubleClick}
                />
              </div>
            )

            return (
              <div onTouchTap={e => this.props.onRowTouchTap(e, -1)}>
                <List
                  height={height - 24}
                  width={width}
                  estimatedRowSize={estimatedRowSize}
                  rowHeight={rowHeight}
                  rowRenderer={rowRenderer}
                  rowCount={gridInfo.mapData.length}
                  overscanRowCount={10}
                  style={{ outline: 'none' }}
                />
              </div>
            )
          }}
        </AutoSizer>
      </div>
    )
  }
}

export default GridView
