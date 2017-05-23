import React from 'react'
import CircularProgress from 'material-ui/CircularProgress'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'

import request from 'superagent'

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
        <span className='move-dialog-row-text'>{node.name || node.label}</span>
        <span className='move-dialog-row-enter' onTouchTap={this.props.enterFolder}><ArrowRight/></span>
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
      path:this.paths,
      loading: false,
      currentSelectedIndex: -1 
    }

    this.fire = () => {

    }
  }

  consistPath(path) {
    console.log(path)
    let newPath = []
    if (path[0].type == 'public') {
      //entry is public
      newPath = [{name:'我的所有文件', uuid: null, type:'false'}, ...path]
      path.unshift()

    }else if (path[0].type == 'folder') {
      //entry is drive
      newPath = [{name:'我的所有文件', uuid: null, type:'false'}, ...path]
    }else {
      //entry is physical
    }

    return newPath
  }

  isRowDisable(node) {
    if (node.type === 'file') return true
    if (this.state.currentDir.uuid !== this.directory.uuid) return false
    else if (this.selectedArr.findIndex(item => item.uuid === node.uuid) === -1) return false
    else return true
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

  getButtonStyle() {
    if (this.state.currentSelectedIndex != -1 && this.state.currentDir.type=='folder') return 'move-button' 
    else if (this.state.currentDir.type !== 'folder') return 'disable move-button'
    else if (this.directory.uuid === this.state.currentDir.uuid) return 'disable move-button'
    else return 'move-button long'
  }

  getButtonText() {
    if (this.state.currentSelectedIndex != -1) return '移动' 
    else if (this.directory.uuid === this.state.currentDir.uuid) return '移动'
    else return '移动到这里'
  }

  render() {
    return (
      <div className='move-dialog-container'>
        <div style={{height:'0px'}}></div>
        <div className='move-dialog-header'>
          <span className={this.state.path.length>1?'move-title-icon':'move-title-icon invisible' } onTouchTap={this.back.bind(this)}>
            <BackIcon/>
          </span>
          <span className='move-dialog-title'>{this.state.currentDir.name}</span>
          <span className='move-title-icon' onTouchTap={this.closeDialog.bind(this)}><CloseIcon/></span>
        </div>
        <div className='move-dialog-list'>
          {this.state.loading && <CircularProgress style={{display:'block'}} className='move-dialog-loading'/>}
          {!this.state.loading && this.getList()}
        </div>
        <div className='move-operation'>
          <span className={this.getButtonStyle()}>{this.getButtonText()}</span>
        </div>
      </div>
    )
  }

  closeDialog() {
    this.props.onRequestClose()
  }

  enterFolder(node) {
    console.log('enter folder')
    if (node.type == 'file') return
    if (node.type == 'folder') {
      this.list(node.uuid).then( data => {
        let path = [...this.state.path, node]
        let currentDir = node
        let list = data
        console.log('enter folder end')
        this.setState({path, currentDir, list, loading: false, currentSelectedIndex: -1})
      }).catch(err => {
        console.log(err)
      })
    }else if (node.type == 'public') {
      let path = [...this.state.path, node]
      let currentDir = node
      let list = this.props.apis.adminDrives.data.drives
      list.forEach(item => item.type = 'folder')
      this.setState({loading:true})
      setTimeout(() => {
        this.setState({path, currentDir, list, loading: false, currentSelectedIndex: -1})
      },0)
    }
  }

  back() {
    let apis = this.props.apis
    let path = this.state.path
    if (path.length == 1) return
    if (this.state.loading) return
    let currentDir = path[path.length - 2]

    let copyPath = [...path]
    let newPath = copyPath.pop()

    if (currentDir.type === 'folder') {

      this.list(currentDir.uuid).then(list => {
        this.setState({list, currentDir, path: copyPath, loading: false, currentSelectedIndex: -1})
      })

    }else if (currentDir.type === 'public'){

      let list = apis.adminDrives.data.drives
      list.forEach(item => item.type = 'folder')
      this.setState({list, currentDir, path: copyPath, loading: false, currentSelectedIndex: -1})

    }else if(currentDir.type === 'false'){
      
      let list = [{name:'我的文件', type:'folder', uuid:apis.account.data.home}, 
                  {name:'共享文件夹',type: 'public', uuid: '共享文件夹'},
                  {name:'物理磁盘', type: 'physical', uuid:'物理磁盘'}]
      
      this.setState({list, currentDir, path:copyPath, loading:false, currentSelectedIndex: -1})

    }else {

      console.log('what is it?!',currentDir)
    }
  }

  selectNode(index) {

    console.log('select node')
    if (this.state.currentSelectedIndex == index) this.setState({currentSelectedIndex: -1})
    else this.setState({currentSelectedIndex: index})
  }

  //apis

  list(uuid) {
    return new Promise((resolve, reject) => {
      this.setState({loading:true})
      let string = 'files/fruitmix/list/' + uuid + '/' + uuid
      this.aget(string).end((err, res) => {
        if (err) return reject(err)
        else resolve(this.sort(JSON.parse(res.text)))
      })
    })
  }

  adminDrives() {
    return new Promise((resolve, reject) => {
      this.setState({loading:true})
      let string = 'admin/drives'
      this.aget(string).end((err, res) => {
        if (err) return reject(err)
        else resolve(JSON.parse(res.text))
      })
    })
  }

  aget(ep) {
    let { address, token} = this.props.apis
    let string = 'http://'+address+':3721/'+ep
    return request
      .get(string)
      .set('Authorization', 'JWT ' + token)
  }

  sort(entries) {
    return [...entries].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'folder') return 1
      return a.name.localeCompare(b.name)
    })
  }
}

export default MoveDialog
