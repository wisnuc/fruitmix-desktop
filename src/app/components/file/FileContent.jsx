import prettysize from 'prettysize'

import React, { Component, PureComponent } from 'react'

import Radium from 'radium'
import { Divider, Paper, Menu, MenuItem } from 'material-ui'
import ActionCheckCircle from 'material-ui/svg-icons/action/check-circle'
import NavigationCheck from 'material-ui/svg-icons/navigation/check'
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box'
import ToggleCheckBoxOutlineBlank from 'material-ui/svg-icons/toggle/check-box-outline-blank'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileFolder from 'material-ui/svg-icons/file/folder'

import { List, AutoSizer } from 'react-virtualized'
import ListSelect from './ListSelect'

const formatTime = mtime => {

  if (!mtime) {
    return null
  }

  let time = new Date()
  time.setTime(parseInt(mtime))
  return time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDay()
}

const renderLeading = leading => {

    let height = '100%', backgroundColor = '#FFF', opacity = 0

    switch(leading) {
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

    return <div style={{ flex: '0 0 4px', height, backgroundColor, opacity, zIndex:1000 }} />
}

const renderCheck = check =>
  (check === 'checked' || check === 'unchecking') 
    ? <ToggleCheckBox style={{color: '#FF0000'}} /> 
    : check === 'checking' 
      ? <ToggleCheckBoxOutlineBlank style={{color: 'rgba(0,0,0,0.38)'}} /> 
      : null

class Row extends PureComponent {

  render() {

    const {

      /* these are react-virtualized List props */
      index,       // Index of row
      isScrolling, // The List is currently being scrolled
      isVisible,   // This row is visible within the List (eg it is not an overscanned row)
      key,         // Unique key within array of rendered rows
      parent,      // Reference to the parent List (instance)
      style,       // Style object to be applied to row (to position it);
                   // This must be passed through to the rendered row element.

      /* these are view-model state */
      entries,
      select,
    } = this.props 

    let entry = entries[index]
    let leading = select.rowLeading(index)
    let check = select.rowCheck(index)
    let color = select.rowColor(index)

    let innerStyle = {
      width: '100%',
      height: '100%',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
    }

    let outerStyle = style

    return (
      <div key={key} style={outerStyle}>
        <div 
          style={innerStyle}
          onTouchTap={e => this.props.onRowTouchTap(e, index)}
          onMouseEnter={e => this.props.onRowMouseEnter(e, index)}
          onMouseLeave={e => this.props.onRowMouseLeave(e, index)}
          onDoubleClick={e => this.props.onRowDoubleClick(e, index)}
        >
          { renderLeading(leading) }
          <div style={{flex: '0 0 12px'}} />
          <div style={{flex: '0 0 48px', display: 'flex', alignItems: 'center'}}>
            { renderCheck(check) }
          </div>
          <div style={{flex: '0 0 8px'}} />
          {/*
          <div>
            {`Hello World ${index} ${leading} ${check} ${color} ${select.ctrl} ${select.shift} ` +
              `${select.hover} ${select.specified}` }
          </div>
          */}
          <div style={{flex: '0 0 48px', display: 'flex', alignItems: 'center'}}>
            { entry.type === 'folder' 
                ? <FileFolder style={{color: 'rgba(0,0,0,0.54)'}} />
                : entry.type === 'file'
                  ? <EditorInsertDriveFile style={{color: 'rgba(0,0,0,0.54'}} />
                  : null } 
          </div>
          <div style={{flexGrow: 1}}>
            { entry.name }
          </div>
          <div style={{flex: '0 1 160px', fontSize: 13, color: 'rgba(0,0,0,0.54)', textAlign: 'right'}}>
            { formatTime(entry.mtime) }
          </div>
          <div style={{flex: '0 1 160px', fontSize: 13, color: 'rgba(0,0,0,0.54)', textAlign: 'right', 
            marginRight: 72}}>
            { entry.type === 'file' && prettysize(entry.size) }
          </div>
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

  componentDidMount() {
		//bind keydown event
		document.addEventListener('keydown', this.keyDownBound)
		document.addEventListener('keyup', this.keyUpBound)
  }

	componentWillUnmount() {
		//remove keydown event
		document.removeEventListener('keydown', this.keyDownBound)
		document.removeEventListener('keyup', this.keyUpBound)
	}

  keyDown(e) {
    console.log('keydown', e.ctrlKey, e.shiftKey)
    if (this.props.select)
      this.props.select.keyEvent(e.ctrlKey, e.shiftKey)
  }

  keyUp(e) {
    console.log('keyup', e.ctrlKey, e.shiftKey)
    if (this.props.select)
      this.props.select.keyEvent(e.ctrlKey, e.shiftKey)
  }

  rowTouchTap(e, index) {

    e.preventDefault()  // important!
    e.stopPropagation()

    console.log('rowTouchTap', index)

    // using e.nativeEvent.button instead of e.nativeEvent.which
    // 0 - left
    // 1 - middle 
    // 2 - right

    // e.type must be mouseup
    
    let type = e.type
    let button = e.nativeEvent.button

    if (type !== 'mouseup' || !(button === 0 || button === 2)) return

    this.props.select.touchTap(button, index)

    if (button === 2) {
      console.log('rowTouchTap, right click')
      this.props.showContextMenu(e.nativeEvent.clientX, e.nativeEvent.clientY)
    }

/**
      if (this.props.select.shift || this.props.select.ctrl) return
      this.setState({
        contextMenu: true,
        clientX: e.nativeEvent.clientX,
        clientY: e.nativeEvent.clientY,
      })
**/
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

  render() {

    let { apis } = this.props

    return (
      <div id='file-content' style={{width: '100%', height: '100%'}}>
        <div style={{width: '100%', height: 8}} />
        <div style={{width: '100%', height: 40}}>This is header</div>
        <div style={{width: '100%', height: 'calc(100% - 48px)'}}>
        { this.props.home.listNavDir && 
          <AutoSizer>
            {({ height, width }) => (
              <div onTouchTap={e => this.onRowTouchTap(e, -1)}>
                <List
                  style={{ outline: 'none' }}
                  height={height}
                  width={width}
                  rowCount={this.props.select.size}
                  rowHeight={40}
                  rowRenderer={this.rowRenderer}
                />
              </div>
            )}
          </AutoSizer> }
        </div>
      </div>
    )
  }
}

export default FileContent

