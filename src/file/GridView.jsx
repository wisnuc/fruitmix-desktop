import React from 'react'
import i18n from 'i18n'
import { Avatar, IconButton, MenuItem, Popover, Menu } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowUpward from 'material-ui/svg-icons/navigation/arrow-upward'
import ArrowDownward from 'material-ui/svg-icons/navigation/arrow-downward'
import CheckIcon from 'material-ui/svg-icons/navigation/check'
import { AutoSizer } from 'react-virtualized'

import Thumb from './Thumb'
import ScrollBar from '../common/ScrollBar'
import renderFileIcon from '../common/renderFileIcon'
import FlatButton from '../common/FlatButton'
import { ShareDisk } from '../common/Svg'

class Row extends React.Component {
  constructor (props) {
    super(props)

    this.headers = [
      { title: i18n.__('Name'), up: 'nameUp', down: 'nameDown' },
      { title: i18n.__('Date Modified'), up: 'timeUp', down: 'timeDown' },
      { title: i18n.__('Date Taken'), up: 'takenUp', down: 'takenDown' },
      { title: i18n.__('Size'), up: 'sizeUp', down: 'sizeDown' }
    ]

    this.header = this.headers.find(header => (header.up === this.props.sortType) ||
      (header.down === this.props.sortType)) || this.headers[0]

    this.state = {
      type: this.header.title
    }

    this.handleChange = (type) => {
      if (this.state.type !== type) {
        switch (type) {
          case i18n.__('Date Modified'):
            this.props.changeSortType('timeUp')
            break
          case i18n.__('Size'):
            this.props.changeSortType('sizeUp')
            break
          case i18n.__('Date Taken'):
            this.props.changeSortType('takenUp')
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
      this.setState({ open: event !== 'clickAway' && !this.state.open, anchorEl: event.currentTarget })
    }
  }

  shouldComponentUpdate (nextProps) {
    return (!nextProps.isScrolling)
  }

  render () {
    const { select, list, primaryColor, sortType, changeSortType, isScrolling, rowSum } = this.props

    const h = this.headers.find(header => header.title === this.state.type) || this.headers[0]

    return (
      <div style={{ height: '100%', width: '100%', marginLeft: 52 }} >
        {/* header */}
        {
          list.first &&
            <div style={{ height: 40, display: 'flex', alignItems: 'center ', marginBottom: 8 }}>
              <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.54)', width: 64 }}>
                {
                  list.entries[0].entry.type === 'file'
                    ? i18n.__('File') : list.entries[0].entry.type === 'public'
                      ? i18n.__('Public Drive') : i18n.__('Directory')
                }
              </div>
              <div style={{ flexGrow: 1 }} />
              {
                !list.entries[0].index && !this.props.inPublicRoot &&
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
                          leftIcon={this.state.type === i18n.__('Name') ? <CheckIcon /> : <div />}
                          primaryText={i18n.__('Name')}
                          onTouchTap={() => this.handleChange(i18n.__('Name'))}
                        />
                        <MenuItem
                          style={{ fontSize: 13 }}
                          leftIcon={this.state.type === i18n.__('Date Modified') ? <CheckIcon /> : <div />}
                          primaryText={i18n.__('Date Modified')}
                          onTouchTap={() => this.handleChange(i18n.__('Date Modified'))}
                        />
                        <MenuItem
                          style={{ fontSize: 13 }}
                          leftIcon={this.state.type === i18n.__('Date Taken') ? <CheckIcon /> : <div />}
                          primaryText={i18n.__('Date Taken')}
                          onTouchTap={() => this.handleChange(i18n.__('Date Taken'))}
                        />
                        <MenuItem
                          style={{ fontSize: 13 }}
                          leftIcon={this.state.type === i18n.__('Size') ? <CheckIcon /> : <div />}
                          primaryText={i18n.__('Size')}
                          onTouchTap={() => this.handleChange(i18n.__('Size'))}
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
              const onDropping = entry.type === 'directory' && select.rowDrop(index)
              return (
                <div
                  style={{
                    position: 'relative',
                    width: 180,
                    height: entry.type === 'file' ? 184 : 48,
                    marginRight: onDropping ? 16 : 20,
                    marginBottom: onDropping ? 12 : 16,
                    border: onDropping ? `2px ${primaryColor} solid` : '',
                    boxShadow: selected ? 'rgba(0, 0, 0, 0.188235) 0px 10px 30px, rgba(0, 0, 0, 0.227451) 0px 6px 10px'
                      : 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
                  }}
                  role="presentation"
                  onTouchTap={e => this.props.onRowTouchTap(e, index)}
                  onDoubleClick={e => this.props.onRowDoubleClick(e, index)}
                  onMouseDown={e => e.stopPropagation() || this.props.gridDragStart(e, index)}
                  onMouseEnter={e => this.props.onRowMouseEnter(e, index)}
                  onMouseLeave={e => this.props.onRowMouseLeave(e, index)}
                  key={index}
                >
                  {/* preview or icon */}
                  {
                    entry.type === 'file' &&
                      <div
                        style={{ height: 136, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                        draggable={false}
                      >
                        {
                          (rowSum < 500 || !isScrolling) && entry.metadata
                            ? <Thumb
                              digest={entry.hash}
                              ipcRenderer={this.props.ipcRenderer}
                              height={180}
                              width={180}
                            />
                            : renderFileIcon(entry.name, entry.metadata, 64)
                        }

                        {/* overlay */}
                        {
                          selected &&
                            <div
                              style={{
                                position: 'absolute',
                                width: 180,
                                height: 136,
                                top: 0,
                                left: 0,
                                opacity: 0.38,
                                backgroundColor: primaryColor
                              }}
                            />
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
  constructor (props) {
    super(props)

    this.scrollToRow = index => this.ListRef.scrollToRow(index)

    this.getStatus = () => this.gridData

    this.calcGridData = () => {
      this.gridData = {
        mapData: this.mapData.reduce((acc, val, index) => {
          val.entries.forEach(() => acc.push(index))
          return acc
        }, []),
        allHeight: this.allHeight, // const rowHeight = ({ index }) => allHeight[index]
        indexHeightSum: this.indexHeightSum,
        scrollTop: this.getScrollToPosition(),
        cellWidth: 200
      }

      this.props.setGridData(this.gridData)
    }

    this.getScrollToPosition = () => (this.scrollTop || 0)

    this.onScroll = ({ scrollTop }) => {
      this.scrollTop = scrollTop
      this.props.onScroll(scrollTop)
    }
  }

  componentDidMount () {
    this.calcGridData()
  }

  componentDidUpdate () {
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
        this.props.resetScrollTo()
        this.props.select.touchTap(0, index)
      }
    }
    this.calcGridData()
  }

  render () {
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

    if (!this.props.entries || this.props.entries.length === 0) return (<div />)
    return (
      <div style={{ width: '100%', height: '100%' }} onDrop={this.props.drop}>
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: 0,
            width: '100%',
            height: 32,
            zIndex: 100,
            backgroundColor: '#FFFFFF'
          }}
          role="presentation"
          onMouseUp={e => this.props.selectEnd(e)}
          onMouseMove={e => this.props.selectGrid(e, this.getStatus())}
        />
        <div style={{ height: 24 }} />
        <AutoSizer key={this.props.entries && this.props.entries[0] && this.props.entries[0].uuid}>
          {({ height, width }) => {
            const gridInfo = calcGridInfo(height, width, this.props.entries)
            // const { mapData, allHeight, rowHeightSum, indexHeightSum, maxScrollTop } = gridInfo
            const { mapData, allHeight, rowHeightSum } = gridInfo

            /* To get row index of scrollToRow */
            this.mapData = mapData
            this.allHeight = allHeight

            const estimatedRowSize = rowHeightSum / allHeight.length
            const rowHeight = ({ index }) => allHeight[index]

            const rowRenderer = ({ key, index, style, isScrolling }) => (
              <div key={key} style={style} >
                <Row
                  {...this.props}
                  rowSum={mapData.length}
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
              <div
                role="presentation"
                onMouseDown={e => this.props.selectStart(e)}
                onMouseUp={e => this.props.selectEnd(e)}
                onMouseMove={e => this.props.selectGrid(e, this.getStatus())}
                onMouseLeave={e => 0 && this.props.selectEnd(e)}
                onTouchTap={e => this.props.onRowTouchTap(e, -1)}
              >
                <ScrollBar
                  ref={ref => (this.ListRef = ref)}
                  allHeight={rowHeightSum}
                  height={height - 24}
                  width={width}
                  estimatedRowSize={estimatedRowSize}
                  rowHeight={rowHeight}
                  rowRenderer={rowRenderer}
                  rowCount={gridInfo.mapData.length}
                  onScroll={this.onScroll}
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
