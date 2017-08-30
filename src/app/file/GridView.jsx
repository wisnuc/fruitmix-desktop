import React from 'react'
import Debug from 'debug'
import UUID from 'uuid'
import prettysize from 'prettysize'
import { Avatar, IconButton, Paper, MenuItem, Popover, Menu } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box'
import ToggleCheckBoxOutlineBlank from 'material-ui/svg-icons/toggle/check-box-outline-blank'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowUpward from 'material-ui/svg-icons/navigation/arrow-upward'
import ArrowDownward from 'material-ui/svg-icons/navigation/arrow-downward'
import CheckIcon from 'material-ui/svg-icons/navigation/check'
import { List, AutoSizer } from 'react-virtualized'

import Thumb from './Thumb'
import renderFileIcon from '../common/renderFileIcon'
import FlatButton from '../common/FlatButton'
import { ShareDisk } from '../common/Svg'

const debug = Debug('component:file:GridView:')

class Row extends React.PureComponent {
  constructor(props) {
    super(props)

    this.headers = [
      { title: '名称', up: 'nameUp', down: 'nameDown' },
      { title: '修改时间', up: 'timeUp', down: 'timeDown' },
      { title: '文件大小', up: 'sizeUp', down: 'sizeDown' }
    ]

    this.header = this.headers.find(header => (header.up === this.props.sortType) || (header.down === this.props.sortType)) || this.headers[0]

    this.state = {
      contextMenuOpen: false,
      type: this.header.title
    }

    this.handleChange = (type) => {
      if (this.state.type !== type) {
        switch (type) {
          case '修改时间':
            this.props.changeSortType('timeUp')
            break
          case '文件大小':
            this.props.changeSortType('sizeUp')
            break
          default:
            this.props.changeSortType('nameUp')
        }
        this.setState({ type, open: false })
      } else {
        this.setState({ open: false })
      }
    }

    this.toggleMenu = (event) => {
      if (!this.state.open && event && event.preventDefault) event.preventDefault()
      this.setState({ open: !this.state.open, anchorEl: event.currentTarget })
    }
  }

  shouldComponentUpdate(nextProps) {
    return (!nextProps.isScrolling)
  }

  render() {
    const { select, list, primaryColor, sortType, changeSortType } = this.props

    const h = this.headers.find(header => header.title === this.state.type) || this.headers[0]

    // debug('sortType', sortType, this.state)
    return (
      <div style={{ height: '100%', width: '100%', marginLeft: 52 }} >
        {/* header */}
        {
          list.first &&
            <div style={{ height: 40, display: 'flex', alignItems: 'center ', marginBottom: 8 }}>
              <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.54)', width: 64 }}>
                { list.entries[0].entry.type === 'file' ? '文件' : list.entries[0].entry.type === 'public' ? '共享盘' : '文件夹' }
              </div>
              <div style={{ flexGrow: 1 }} />
              {
                !list.entries[0].index &&
                  <div style={{ display: 'flex', alignItems: 'center ', marginRight: 84 }}>
                    <FlatButton
                      label={this.state.type}
                      labelStyle={{ fontSize: 14, color: 'rgba(0,0,0,0.54)' }}
                      onTouchTap={this.toggleMenu}
                    />
                    {/* menu */}
                    <Popover
                      open={this.state.open}
                      anchorEl={this.state.anchorEl}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                      onRequestClose={this.toggleMenu}
                    >
                      <Menu style={{ minWidth: 240 }}>
                        <MenuItem
                          style={{ fontSize: 13 }}
                          leftIcon={this.state.type === '名称' ? <CheckIcon /> : <div />}
                          primaryText="名称"
                          onTouchTap={() => this.handleChange('名称')}
                        />
                        <MenuItem
                          style={{ fontSize: 13 }}
                          leftIcon={this.state.type === '修改时间' ? <CheckIcon /> : <div />}
                          primaryText="修改时间"
                          onTouchTap={() => this.handleChange('修改时间')}
                        />
                        <MenuItem
                          style={{ fontSize: 13 }}
                          leftIcon={this.state.type === '文件大小' ? <CheckIcon /> : <div />}
                          primaryText="文件大小"
                          onTouchTap={() => this.handleChange('文件大小')}
                        />
                      </Menu>
                    </Popover>

                    {/* direction icon */}
                    <IconButton
                      style={{ height: 36, width: 36, padding: 9, borderRadius: '18px' }}
                      iconStyle={{ height: 18, width: 18, color: 'rgba(0,0,0,0.54)' }}
                      hoveredStyle={{ backgroundColor: 'rgba(0,0,0,0.18)' }}
                      onTouchTap={() => { sortType === h.up || !sortType ? changeSortType(h.down) : changeSortType(h.up) }}
                    >
                      { sortType === h.up || !sortType ? <ArrowUpward /> : <ArrowDownward /> }
                    </IconButton>
                  </div>
              }

            </div>
        }

        {/* file content */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {
            list.entries.map((item) => {
              const { index, entry } = item
              const selected = select.selected.findIndex(s => s === index) > -1
              return (
                <div
                  style={{
                    width: 180,
                    height: entry.type === 'file' ? 184 : 48,
                    marginRight: 20,
                    marginBottom: 16,
                    boxShadow: selected ? 'rgba(0, 0, 0, 0.188235) 0px 10px 30px, rgba(0, 0, 0, 0.227451) 0px 6px 10px'
                    : 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
                  }}
                  onTouchTap={e => this.props.onRowTouchTap(e, index)}
                  onDoubleClick={e => this.props.onRowDoubleClick(e, index)}
                  key={index}
                >
                  {/* preview or icon */}
                  {
                    entry.type === 'file' &&
                      <div style={{ height: 136, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {
                          entry.metadata
                          ? <Thumb
                            digest={entry.hash}
                            ipcRenderer={this.props.ipcRenderer}
                            height={180}
                            width={180}
                          />
                          : renderFileIcon(entry.name, entry.metadata, 64)
                        }
                      </div>
                  }

                  {/* file name */}
                  <div
                    style={{
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      color: selected ? 'rgba(255,255,255,0.87)' : 'rgba(0,0,0,0.72)',
                      backgroundColor: selected ? primaryColor : '#FFFFFF'
                    }}
                  >
                    {/* file type may be: folder, public, directory, file, unsupported */}
                    <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', margin: 12 }}>
                      <Avatar style={{ backgroundColor: 'white', width: 30, height: 30 }}>
                        {
                          entry.type === 'directory'
                          ? <FileFolder style={{ color: 'rgba(0,0,0,0.54)', width: 24, height: 24 }} />
                          : entry.type === 'public'
                          ? <ShareDisk style={{ color: 'rgba(0,0,0,0.54)', width: 24, height: 24 }} />
                          : entry.type === 'file'
                          ? renderFileIcon(entry.name, entry.metadata, 24)
                          : <ErrorIcon style={{ color: 'rgba(0,0,0,0.54)', width: 24, height: 24 }} />
                        }
                      </Avatar>
                    </div>
                    <div
                      style={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        fontSize: 13,
                        width: 114,
                        marginRight: 12,
                        fontWeight: 500
                      }}
                    >
                      { entry.name }
                    </div>
                  </div>
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

    this.scrollToRow = index => this.ListRef.scrollToRow(index)
  }

  componentDidUpdate() {
    if (this.props.scrollTo) {
      const index = this.props.entries.findIndex(entry => entry.name === this.props.scrollTo)
      if (index > -1) {
        let rowIndex = 0
        let sum = 0
        /* calc rowIndex */
        for (let i = 0; i < this.mapData.length; i++) {
          sum += this.mapData[i].entries.length
          if (index < sum) break
          rowIndex += 1
        }
        if (rowIndex < this.mapData.length) this.scrollToRow(rowIndex)
        Object.assign(this.props.home, { scrollTo: '' })
        this.props.select.touchTap(0, index)
      }
    }
  }

  render() {
    const calcGridInfo = (height, width, entries) => {
      const MAX = Math.floor((width - 52) / 200) - 1
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
        const tmp = 64 + !!list.first * 48 + (list.entries[0].entry.type === 'file') * 136
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

    // debug('GridView render', this.props)

    if (!this.props.entries || this.props.entries.length === 0) return (<div />)
    return (
      <div style={{ width: '100%', height: '100%' }} onDrop={this.props.drop}>
        <div style={{ height: 24 }} />
        <AutoSizer key={this.props.entries && this.props.entries[0] && this.props.entries[0].uuid}>
          {({ height, width }) => {
            const gridInfo = calcGridInfo(height, width, this.props.entries)
            const { mapData, allHeight, rowHeightSum, indexHeightSum, maxScrollTop } = gridInfo
            // debug('gridInfo', allHeight, this.props.entries.length)
            
            /* To get row index of scrollToRow */
            this.mapDate = mapData

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
                  ref={ref => (this.ListRef = ref)}
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
