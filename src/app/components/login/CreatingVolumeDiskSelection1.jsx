import React, {PureComponent} from 'react'

import { cyan500 } from 'material-ui/styles/colors'

import { Checkbox, Divider } from 'material-ui'
import { RadioButton, RadioButtonGroup} from 'material-ui/RadioButton' 
import prettysize from 'prettysize'


class CreatingVolumeDiskSelection1 extends React.PureComponent {
  
  static State = class State {
    constructor(){
      this.selection = []
      this.mode = null 
    } 
  }

  renderDiskRow (blk) {

    let model = blk.model ? blk.model : '未知型号'
    let name = blk.name
    let size = prettysize(blk.size * 512)
    let iface = blk.isATA ? 'ATA' :
                blk.isSCSI ? 'SCSI' :
                blk.isUSB ? 'USB' : '未知'

    let usage = blk.isFileSystem ? '文件系统' :
                blk.isPartitioned ? '有文件分区' : '未知'

    let valid = !blk.isRootFS && !blk.isActiveSwap && !blk.removable


    let comment
    if (blk.isRootFS)
      comment = '该磁盘含有rootfs，不可用'
    else if (blk.isActiveSwap)
      comment = '该磁盘含有在使用的交换分区，不可用'
    else if (blk.removable)
      comment = '该磁盘为可移动磁盘，WISNUC OS不支持使用可移动磁盘建立磁盘卷'
    else
      comment = '该磁盘可以加入磁盘卷'
 
    return (
      <div key={name} style={{width: '100%', height: 40, display: 'flex', alignItems: 'center', color: !blk.isPartitioned ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.38)'}}>
        <div style={{flex: '0 0 64px'}}>
          { valid && <Checkbox style={{marginLeft: 16}} 
            disabled={usage !== '未知'}
            checked={this.props.state.selection.indexOf(name) !== -1} onCheck={() => {
            console.log('......=============.......', this.props.state.selection)
            let nextState

            let index = this.props.state.selection.indexOf(name)
            if (index === -1) {
              nextState = Object.assign({}, this.state, {
                selection: [...this.props.state.selection, name]
              })
            }
            else {
              nextState = Object.assign({}, this.state, {
                selection: [...this.props.state.selection.slice(0, index),
                  ...this.props.state.selection.slice(index + 1)]
              })
            }

            if (nextState.selection.length === 1) {
              nextState.mode = 'single'
            }
            else if (nextState.selection.length === 0) {
              nextState.mode = null
            }

            this.props.setState(nextState)

          }}/>}
        </div>
        <div style={{flex: '0 0 160px'}}>{model}</div>
        <div style={{flex: '0 0 80px'}}>{name}</div>
        <div style={{flex: '0 0 80px'}}>{size}</div>
        <div style={{flex: '0 0 80px'}}>{iface}</div>
        <div style={{flex: '0 0 80px'}}>{usage}</div>
        <div style={{flex: '0 0 240px'}}>{comment}</div>
      </div> 
    )
  }
  render() {
    return (
      <div>
        <div style={{height: 40, display: 'flex', alignItems: 'center', color: cyan500, paddingLeft: 10, paddingBottom: 20}}>选择磁盘创建新的磁盘卷，所选磁盘的数据会被清除</div> 
        <div style={{color: 'rgba(0,0,0,0.87)'}}>
          <div style={{marginLeft: 10, width: 760, fontSize: 13}}>
            <Divider />
            <div style={{width: '100%', height: 32, display: 'flex', alignItems: 'center'}}>
              <div style={{flex: '0 0 64px'}} />
              <div style={{flex: '0 0 160px'}}>型号</div>
              <div style={{flex: '0 0 80px'}}>设备名</div>
              <div style={{flex: '0 0 80px'}}>容量</div>
              <div style={{flex: '0 0 80px'}}>接口</div>
              <div style={{flex: '0 0 80px'}}>使用</div>
              <div style={{flex: '0 0 240px'}}>说明</div>
            </div>
            {console.log('>>>>>>>>>>', this.props)}
            <Divider />
            
            { this.props.storage && this.props.storage.blocks.filter(blk => blk.isDisk).map(blk => this.renderDiskRow(blk)) }
            <Divider />
          </div>

          <div style={{position: 'relative', marginLeft: 10, marginTop: 12, marginBottom:12, display: 'flex', alignItems: 'center'}}>
            <div style={{fontSize:13}}>选择磁盘卷模式：</div>
            <div style={{width: 160}}>
            <RadioButtonGroup style={{position: 'relative', display: 'flex'}} 
              valueSelected={this.props.state.mode} 
              onChange={(e, value) => this.props.setState({ mode: value }) }
              name={'volume-name'}>
              <RadioButton style={{fontSize:13, width:128}} iconStyle={{width:16, height:16, padding: 2}} 
                disableTouchRipple={true}
                disableFocusRipple={true}
                value='single' label='single模式' 
                disabled={ this.props.state.selection.length === 0} />
              <RadioButton style={{fontSize:13, width:128}} iconStyle={{width:16, height:16, padding: 2}} 
                disableTouchRipple={true}
                disableFocusRipple={true}
                value='raid0' label='raid0模式' 
                disabled={ this.props.state.selection.length < 2} />
              <RadioButton style={{fontSize:13, width:128}} iconStyle={{width:16, height:16, padding: 2}} 
                disableTouchRipple={true}
                disableFocusRipple={true}
                value='raid1' label='raid1模式' 
                disabled={ this.props.state.selection.length < 2} />
            </RadioButtonGroup>
            </div>
          </div>
        </div>
      </div> 
    )
  }
}

export default CreatingVolumeDiskSelection1
