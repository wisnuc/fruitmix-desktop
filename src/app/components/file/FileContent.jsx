import React, { Component, PureComponent } from 'react'

import Radium from 'radium'
import { Divider, Paper, Menu, MenuItem } from 'material-ui'
import ActionCheckCircle from 'material-ui/svg-icons/action/check-circle'
import NavigationCheck from 'material-ui/svg-icons/navigation/check'
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box'
import ToggleCheckBoxOutlineBlank from 'material-ui/svg-icons/toggle/check-box-outline-blank'

import { List, AutoSizer } from 'react-virtualized'
import ListSelect from './ListSelect'

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

      index,       // Index of row
      isScrolling, // The List is currently being scrolled
      isVisible,   // This row is visible within the List (eg it is not an overscanned row)
      key,         // Unique key within array of rendered rows
      parent,      // Reference to the parent List (instance)
      style        // Style object to be applied to row (to position it);
                   // This must be passed through to the rendered row element.
    } = this.props 

    let leading = this.props.select.rowLeading(index)
    let check = this.props.select.rowCheck(index)
    let color = this.props.select.rowColor(index)

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
        >
          { renderLeading(leading) }
          <div style={{flex: '0 0 12px'}} />
          <div style={{flex: '0 0 48px', display: 'flex', alignItems: 'center'}}>
            { renderCheck(check) }
          </div>
          <div style={{flex: '0 0 8px'}} />
          <div>
            {`Hello World ${index} ${leading} ${check}`}
          </div>
        </div>
      </div>
    )
  } 
}

class ContextMenu extends PureComponent {

  // top, left, onRequestClose
  render() {

    const overlayStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 2000
    }

    const innerStyle = {
      position: 'fixed',
      top: this.props.top,
      left: this.props.left,
      zIndex: 2001
    }

    return (
      <div style={overlayStyle} onTouchTap={this.props.onRequestClose}>
        <Paper style={innerStyle}>
          <Menu>
            { this.props.children }
          </Menu>
        </Paper>
      </div>
    )
  }
}

class FileContent extends Component {
 
  constructor(props) {

    super(props)
    this.rowRenderer = props => 
      <Row {...props}  
        select={this.state.select}
        onRowTouchTap={this.rowTouchTapBound}
        onRowMouseEnter={this.rowMouseEnterBound}
        onRowMouseLeave={this.rowMouseLeaveBound} 
      />

    this.state = { select: null }

    this.keyDownBound = this.keyDown.bind(this)
    this.keyUpBound = this.keyUp.bind(this)
    this.rowTouchTapBound = this.rowTouchTap.bind(this)
    this.rowMouseEnterBound = this.rowMouseEnter.bind(this)
    this.rowMouseLeaveBound = this.rowMouseLeave.bind(this)
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

  componentWillReceiveProps(nextProps) {

    if (!nextProps.apis || !nextProps.apis.listNavDir) return

    let listNavDir = nextProps.apis.listNavDir
    if (listNavDir.isFulfilled() && listNavDir.value() !== this.state.value) {
      this.setState({
        value: listNavDir.value(),
        select: new ListSelect(value.entries.length)
      })
    }
  }

  setSelect(select) {
    if (select) this.setState({ select })
  }

  keyDown(e) {
    console.log('keydown', e.ctrlKey, e.shiftKey)
    this.setSelect(this.state.select.keyEvent(e.ctrlKey, e.shiftKey)) 
  }

  keyUp(e) {
    console.log('keyup', e.ctrlKey, e.shiftKey)
    this.setSelect(this.state.select.keyEvent(e.ctrlKey, e.shiftKey))
  }

  rowTouchTap(e, index) {

    e.preventDefault()  // important!
    e.stopPropagation()

    // using e.nativeEvent.button instead of e.nativeEvent.which
    // 0 - left
    // 1 - middle 
    // 2 - right

    // e.type must be mouseup
    
    let type = e.type
    let button = e.nativeEvent.button

    if (type !== 'mouseup' || !(button === 0 || button === 2)) return

    let select = this.state.select.touchTap(button, index)

    if (button === 0) return this.setSelect(select)

    if (button === 2) { // right click

      if (this.state.select.shift || this.state.select.ctrl) return
      let next = {
        contextMenu: true,
        clientX: e.nativeEvent.clientX,
        clientY: e.nativeEvent.clientY,
      }

      if (select) next.select = select
      this.setState(next)
    }
  }

  rowMouseEnter(e, index) {
    this.setSelect(this.state.select.mouseEnter(index))
  }

  rowMouseLeave(e, index) {
    this.deferredLeave = setTimeout(() => 
      this.setSelect(this.state.select.mouseLeave(index)), 1)
  }

  render() {

    let { apis } = this.props

    console.log('file content render', this.props)

    return (
      <div style={{width: '100%', height: '100%', backgroundColor: '#FAFAFA'}}>

        { this.state.value && 
          <AutoSizer>
            {({ height, width }) => (
              <div onTouchTap={e => this.rowTouchTapBound(e, -1)}>
                <List
                  style={{ outline: 'none' }}
                  height={height}
                  width={width}
                  rowCount={this.state.select.size}
                  rowHeight={40}
                  rowRenderer={this.rowRenderer}
                />
              </div>
            )}
          </AutoSizer> }
  

        { this.state.contextMenu &&
          <ContextMenu 
            top={this.state.clientY} 
            left={this.state.clientX}
            onRequestClose={() => this.setState({ 
              contextMenu: false,
              clientY: -1,
              clientX: -1
            })}
          >
            <MenuItem primaryText='新建文件夹' /> 
          </ContextMenu>
        }
      </div>
    )
  }
}

export default FileContent

