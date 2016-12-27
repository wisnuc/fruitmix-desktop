import React from 'react'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { Divider, IconButton, Checkbox } from 'material-ui'
import { pink500 } from 'material-ui/styles/colors'
import HardwareKeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import HardwareKeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less' 
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'

import Debug from 'debug'
const debug = Debug('component:maintenance:treetable')

import prettysize from 'prettysize'

class TreeTable extends React.Component {

  constructor(props) {

    super(props)

    this.data = props.data
    this.state = { expansion: new Set() }

    this.toggleExpansion = (item) => {

      let expansion = new Set(this.state.expansion)

      if (this.state.expansion.has(item)) 
        expansion.delete(item)
      else 
        expansion.add(item)

      this.setState(Object.assign({}, this.state, { expansion }))
      if (this.props.onSelect) this.props.onSelect(item)
    }

    this.diskUsage = item => {
      if (item.isPartitioned) 
        return `分区使用，分区表类型：${item.partitionTableType}`
      else if (item.idFsUsage) {
        if (item.isFileSystem) {
          if (item.fileSystemType === 'btrfs')
            return `btrfs磁盘卷设备，卷ID：${item.btrfsVolume}，设备ID：${item.btrfsDevice}`
          else 
            return `文件系统，类型：${item.fileSystemType}`
        }
        else if (item.isOtherFileSystem) {
          if (item.isLinuxSwap)
            return `Linux Swap`
          else 
            return `特殊文件系统，类型：${item.fileSystemType}`
        }
        else {
          return `未知文件系统`
        }
      }
      else if (item.Unrecognized) {
        return `未知使用方式`
      }
    }

    this.partitionUsage = item => {
      if (item.isPartition) {
        if (item.isExtended)
          return '扩展分区'
        if (item.isLinuxSwap)
          return 'Linux Swap'
        if (item.isFileSystem)
          return `${item.fileSystemType}文件系统`
        
        return `未知使用方式`
      }
    }
    
    this.renderHeader = () => {
      return (
        <div style={{
          height: 56, 
          display: 'flex', alignItems: 'center',
          fontSize: 12, color: 'rgba(0,0,0,0.54)'
        }}>
          <div style={{flex: '0 0 106px'}} />
          <div style={{flex: '0 0 80px'}}>设备名</div>
          <div style={{flex: '0 0 80px'}}>类型</div>
          <div style={{flex: '0 0 320px'}}>使用方式</div>
          <div style={{flex: '0 0 80px'}}>接口</div>
          <div style={{flex: '0 0 80px', textAlign: 'right'}}>容量</div>
        </div>
      )
    }

    this.renderData = () => {

      let rows = []
      const renderItem = (item, level) => {

        rows.push(
          <div style={{
              height: 48, display: 'flex', alignItems: 'center', 
              backgroundColor: item === this.props.select ? '#F5F5F5' : null,
              color: item === this.props.select ? pink500 : 'rgba(0,0,0,0.87)', 
              fontSize: 13, overflowY: 'hidden'
            }}

            onClick={() => this.props.onSelect && this.props.onSelect(item)}
          >
            <div style={{flex: '0 0 24px'}} />
            <div style={{flex: '0 0 18px'}}>
              { level === 0 &&
                <Checkbox 
                  checked={!!this.props.selection && !!this.props.selection.find(select => select === item)}
                  onCheck={() => this.props.onCheck(item)}
                  iconStyle={{width:18, marginRight:0}}
                  disableTouchRipple={true} 
                  disableFocusRipple={true} 
                  disabled={!this.props.selection || item.removable === true}
                /> 
              }
            </div>
            <div style={{flex: '0 0 24px'}} />

            <div style={{flex: `0 0 40px`}}>
   
              { this.state.expansion.has(item) ? 
                <IconButton 
                  style={{width:40, height:40, padding:10}}
                  iconStyle={{width:20, height: 20}}
                  disableTouchRipple={true}
                  disableFocusRipple={true}
                  onTouchTap={() => this.toggleExpansion(item)}
                ><NavigationExpandLess /></IconButton> : 
                item.children && item.children.length ? 
                <IconButton 
                  style={{width:40, height:40, padding:10}}
                  iconStyle={{width:20, height: 20}}
                  disableTouchRipple={true}
                  disableFocusRipple={true}
                  onTouchTap={() => this.toggleExpansion(item)}
                ><NavigationExpandMore /></IconButton> : 
                null } 

            </div>

            <div style={{flex: '0 0 80px'}}>{item.name || '(no name)'}</div>
            <div style={{flex: '0 0 80px'}}>{item.isDisk ? '磁盘' : '分区'}</div>
            <div style={{flex: '0 0 320px'}}>
              { item.isDisk ? this.diskUsage(item) : this.partitionUsage(item) }
            </div>
            <div style={{flex: '0 0 80px'}}>
              {item.isDisk ? (item.isATA ? 'ATA' : item.isSCSI ? 'SCSI' : item.isUSB ? 'USB' : '') : null}
            </div>
            <div style={{flex: '0 0 80px', textAlign: 'right'}}>
              {item.size ? prettysize(item.size * 512) : null}
            </div>
            
            <div style={{flex: '0 0 24px'}} /> 
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
          { this.renderHeader() }
          <Divider />
          { this.renderData() }
        </div>
      </div>
    )
  }
}

export default muiThemeable()(TreeTable)
