import Debug from 'debug'

const debug = Debug('view:common:treetable')

import React from 'react'

import { Divider, IconButton } from 'material-ui'
import { pink500 } from 'material-ui/styles/colors'
import HardwareKeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import HardwareKeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'

class TreeTable extends React.Component {

  constructor(props) {

    super(props)

    this.data = props.data
    this.state = {
      expansion: new Set(),
    }

    this.toggleExpansion = (item) => {

      let expansion = new Set(this.state.expansion)

      if (this.state.expansion.has(item)) 
        expansion.delete(item)
      else 
        expansion.add(item)

      this.setState(Object.assign({}, this.state, { expansion }))
      if (this.props.onSelect) this.props.onSelect(item)
    }
    
    this.showHeader = props.showHeader
    this.columns = props.columns

    this.renderHeader = () => {
      return (
        <div style={{height: 40, display: 'flex', alignItems: 'center', justifyContent: 'stretch'}}>
          { this.columns
            .map(col => (
              <div style={col.headerStyle}>{col.name || ''}</div>  
            )) 
          }
        </div>
      )
    }

    this.renderData = () => {

      let rows = []

      const renderItem = (item, level) => {

        rows.push(
          <div style={{
              height: 40, display: 'flex', alignItems: 'center', 
              backgroundColor: item === this.props.select ? '#F5F5F5' : null,
              color: item === this.props.select ? pink500 : 'rgba(0,0,0,0.87)', 
              fontSize: 14,
            }}

            onClick={() => this.props.onSelect && this.props.onSelect(item)}
          >

            <div style={{flex: `0 0 ${level * 24}px`}} />
            <div style={{flex: `0 0 40px`}}>
   
              { this.state.expansion.has(item) ? 
                <IconButton 
                  style={{width:40, height:40, padding:10}}
                  iconStyle={{width:20, height: 20}}
                  disableTouchRipple={true}
                  disableFocusRipple={true}
                  onTouchTap={() => this.toggleExpansion(item)}
                ><HardwareKeyboardArrowDown /></IconButton> : 
                item.children && item.children.length ? 
                <IconButton 
                  style={{width:40, height:40, padding:10}}
                  iconStyle={{width:20, height: 20}}
                  disableTouchRipple={true}
                  disableFocusRipple={true}
                  onTouchTap={() => this.toggleExpansion(item)}
                ><HardwareKeyboardArrowRight /></IconButton> : 
                null } 

            </div>
            <div>{item.name || '(no name)'}</div>
          </div>
        )
        
        rows.push(<Divider />)

        if (this.state.expansion.has(item) && item.children && item.children.length)
          item.children.forEach(child => renderItem(child, level + 1)) 
      }

      this.data.forEach(item => renderItem(item, 0))

      return rows
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({ expansion: new Set() })
    }
  } 

  render() {
    return (
      <div style={this.props.style}>
        <div style={{width: '100%', height: '100%', overflow: 'auto'}}>
          { this.props.showHeader && this.renderHeader() }
          { this.props.showHeader && <Divider /> }
          { this.renderData() }
        </div>
      </div>
    )
  }
}

export default TreeTable
