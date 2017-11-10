import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { Avatar, Popover, MenuItem, Menu, IconButton } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box'
import ToggleCheckBoxOutlineBlank from 'material-ui/svg-icons/toggle/check-box-outline-blank'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowUpward from 'material-ui/svg-icons/navigation/arrow-upward'
import ArrowDownward from 'material-ui/svg-icons/navigation/arrow-downward'
import CheckIcon from 'material-ui/svg-icons/navigation/check'
import { List, AutoSizer } from 'react-virtualized'
import renderFileIcon from '../common/renderFileIcon'
import { ShareDisk } from '../common/Svg'
import FlatButton from '../common/FlatButton'
import { formatDate } from '../common/datetime'

const debug = Debug('component:file:RenderListByRow:')

const formatTime = (mtime) => {
  if (!mtime) return null

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
  ((check === 'checked' || check === 'unchecking')
    ? <ToggleCheckBox style={{ color: '#FF0000' }} />
    : check === 'checking'
      ? <ToggleCheckBoxOutlineBlank style={{ color: 'rgba(0,0,0,0.38)' }} />
      : null)

class Row extends React.PureComponent {
  render() {
    // debug('renderRow this.props', this.props)
    const {
      /* these are react-virtualized List props */
      index, // Index of row
      isScrolling, // The List is currently being scrolled
      isVisible, // This row is visible within the List (eg it is not an overscanned row)
      parent, // Reference to the parent List (instance)
      style, // Style object to be applied to row (to position it);
      // This must be passed through to the rendered row element.

      /* these are view-model state */
      entries,
      select,
      showTakenTime,
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
          <div style={{ flex: '0 0 48px', display: 'flex', alignItems: 'center' }} >
            <Avatar style={{ backgroundColor: 'white' }}>
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
            style={{ flex: '0 0 390px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            onMouseDown={e => 0 && e.stopPropagation()}
          >
            { entry.name }
          </div>

          <div style={{ flex: '0 1 160px', fontSize: 13, color: 'rgba(0,0,0,0.54)', textAlign: 'right' }}>
            { showTakenTime ? entry.metadata && (entry.metadata.date || entry.metadata.datetime)
              && formatDate(entry.metadata.date || entry.metadata.datetime) : entry.mtime && formatTime(entry.mtime) }
          </div>

          <div
            style={{ flex: '0 1 160px',
              fontSize: 13,
              color: 'rgba(0,0,0,0.54)',
              textAlign: 'right',
              marginRight: 72 }}
          >
            { entry.type === 'file' && prettysize(entry.size, false, true, 2) }
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

    this.scrollToRow = index => this.ListRef.scrollToRow(index)

    this.handleChange = (type) => {
      if (this.state.type !== type) {
        switch (type) {
          case '修改时间':
            this.props.changeSortType('timeUp')
            break
          case '拍摄时间':
            this.props.changeSortType('takenUp')
            break
          default:
            debug('this.handleChange no such type', type)
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

    this.getScrollToPosition = () => {
      const list = document.getElementsByClassName('ReactVirtualized__List')[0]
      return (parseInt(list.scrollTop, 10) || 0)
    }
  }

  componentDidUpdate() {
    if (this.props.scrollTo) {
      const index = this.props.entries.findIndex(entry => entry.name === this.props.scrollTo)
      if (index > -1) {
        this.scrollToRow(index)
        Object.assign(this.props.home, { scrollTo: '' })
        this.props.select.touchTap(0, index)
      }
    }
  }

  renderHeader(h) {
    return (
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
    )
  }

  renderPopoverHeader() {
    const headers = [
      { title: '修改时间', up: 'timeUp', down: 'timeDown' },
      { title: '拍摄时间', up: 'takenUp', down: 'takenDown' }
    ]

    const { sortType, changeSortType } = this.props
    let h = headers.find(header => (header.up === sortType || header.down === sortType))
    this.preHeader = h || this.preHeader || headers[0]
    const isSelected = !!h
    h = this.preHeader
    // debug('renderPopoverHeader this.props', this.props, sortType, h, isSelected)

    return (
      <div style={{ display: 'flex', alignItems: 'center ', width: 168, marginLeft: -8, marginTop: 2 }}>
        <FlatButton
          label={h.title}
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
          <Menu style={{ minWidth: 200 }}>
            <MenuItem
              style={{ fontSize: 13 }}
              leftIcon={this.state.type === '修改时间' ? <CheckIcon /> : <div />}
              primaryText="修改时间"
              onTouchTap={() => this.handleChange('修改时间')}
            />
            <MenuItem
              style={{ fontSize: 13 }}
              leftIcon={this.state.type === '拍摄时间' ? <CheckIcon /> : <div />}
              primaryText="拍摄时间"
              onTouchTap={() => this.handleChange('拍摄时间')}
            />
          </Menu>
        </Popover>

        {/* direction icon */}
        <IconButton
          style={{ height: 36, width: 36, padding: 9, borderRadius: '18px', marginLeft: -8, display: isSelected ? '' : 'none' }}
          iconStyle={{ height: 18, width: 18, color: 'rgba(0,0,0,0.54)' }}
          hoveredStyle={{ backgroundColor: 'rgba(153,153,153,0.2)' }}
          onTouchTap={() => (sortType === h.up || !sortType ? changeSortType(h.down) : changeSortType(h.up))}
        >
          { sortType === h.up && <ArrowUpward /> }
          { sortType === h.down && <ArrowDownward /> }
        </IconButton>
      </div>
    )
  }

  render() {
    // debug('RenderListByRow redner', this.props)
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
        {/* header */}
        <div
          style={{
            width: '100%',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            zIndex: 100,
            backgroundColor: '#FFFFFF',
            paddingTop: 8,
            top: -8
          }}
          onMouseUp={e => this.props.selectEnd(e)}
          onMouseMove={e => this.props.selectRow(e, this.getScrollToPosition())}
        >
          <div style={{ flex: '0 0 104px' }} />
          { this.renderHeader({ title: '名称', width: 494, up: 'nameUp', down: 'nameDown' }) }
          { this.renderPopoverHeader() }
          { this.renderHeader({ title: '文件大小', width: 160, up: 'sizeUp', down: 'sizeDown' }) }
          <div style={{ flexGrow: 1 }} />
        </div>

        <div style={{ height: 48 }} />

        {/* list content */}
        <div style={{ width: '100%', height: 'calc(100% - 48px)' }}>
          {
            this.props.entries.length !== 0 &&
            <AutoSizer>
              {({ height, width }) => (
                <div
                  onMouseDown={e => this.props.selectStart(e)}
                  onMouseUp={e => this.props.selectEnd(e)}
                  onMouseMove={e => this.props.selectRow(e, this.getScrollToPosition())}
                  onMouseLeave={e => 0 && this.props.selectEnd(e)}
                  draggable={false}
                  onTouchTap={e => this.props.onRowTouchTap(e, -1)}
                >
                  <List
                    ref={ref => (this.ListRef = ref)}
                    style={{ outline: 'none' }}
                    height={height}
                    width={width}
                    rowCount={this.props.select.size}
                    onScroll={({ scrollTop }) => this.props.onScroll(scrollTop)}
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
