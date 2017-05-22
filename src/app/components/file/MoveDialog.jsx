import React from 'react'
import CircularProgress from 'material-ui/CircularProgress'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'

class Row extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    let node = this.props.node
    let disable = this.props.disable
    let isSelected = this.props.isSelected
    return (
      <div className={isSelected?'move-dialog-row row-selected':disable?'move-dialog-row disable':'move-dialog-row'} 
        onTouchTap={disable?null:this.props.selectNode}
        onDoubleClick={this.props.enterFolder}>
        <span className='move-dialog-row-type'>{node.type == 'file'?<EditorInsertDriveFile/>:<FileFolder/>}</span>
        <span className='move-dialog-row-text'>{node.name}</span>
        <span className='move-dialog-row-enter'><ArrowRight/></span>
      </div>
    )
  }
}

class MoveDialog extends React.PureComponent {

  constructor(props) {

    super(props)

    let entries = this.props.entries
    let selected = this.props.select.selected
    let path = this.props.path
    this.paths = this.consistPath(this.props.path)
    this.selectedArr = selected.map(item => entries[item])
    this.directory = path[path.length - 1]


    
    this.state = {
      list:this.props.entries,
      currentDir: path[path.length - 1],
      path:this.props.path,
      loading: false,
      currentSelectedIndex: -1 
    }

    this.fire = () => {

    }
  }

  consistPath(path) {
    console.log(path)
    if (path[0].type == 'public') {
      //entry is public
    }else if (path[0].type == 'folder') {
      //entry is drive
    }else {
      //entry is physical
    }
  }

  isRowDisable(node) {
    if (node.type === 'file') return true
    if (this.state.currentDir.uuid !== this.directory.uuid) return false
    else if (this.selectedArr.findIndex(item => item.uuid === node.uuid) === -1) return false
    else return true
  }

  enterFolder(node) {
    console.log(node, this.props.apis)
    return
    if (node.type == 'file') return
    if (node.type == 'folder') {
      this.props.apis.aget('files/fruitmix/list/node.uuid/node.uuid').end((err, data) => {
        if (err) return console.log(err)
        else console.log(data)
      })
    }
  }

  getList() {
    return (
      this.state.list.map((item, index) => <Row
        key={item.uuid}
        node={item} 
        selectNode={this.selectNode.bind(this, index)}
        enterFolder={this.enterFolder.bind(this, item)}
        disable={this.isRowDisable(item)}
        isSelected={index === this.state.currentSelectedIndex} />)
    )
  }

  render() {

    return (
      <div className='move-dialog-container'>
        <div style={{height:'0px'}}></div>
        <div className='move-dialog-header'>
          <span className='move-title-icon'><BackIcon style={{width:'18px',height:'19px'}}/></span>
          <span className='move-dialog-title'>title</span>
          <span className='move-title-icon' onTouchTap={this.closeDialog.bind(this)}><CloseIcon/></span>
        </div>
        <div className='move-dialog-list'>
          {this.state.loading && <CircularProgress/>}
          {!this.state.loading && this.getList()}
        </div>
        <div className='move-operation'></div>
      </div>
    )
  }

  closeDialog() {
    this.props.onRequestClose()
  }

  selectNode(index) {
    if (this.state.currentSelectedIndex == index) this.setState({currentSelectedIndex: -1})
    else this.setState({currentSelectedIndex: index})
  }


}

export default MoveDialog
