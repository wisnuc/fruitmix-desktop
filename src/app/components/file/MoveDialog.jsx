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
        onDoubleClick={this.props.enter}>
        <span className='move-dialog-row-type'>{node.type == 'file'?<EditorInsertDriveFile/>:<FileFolder/>}</span>
        <span className='move-dialog-row-text'>{node.name || node.label || node.mountpoint}</span>
        <span className='move-dialog-row-enter' onTouchTap={this.props.enter}><ArrowRight/></span>
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
  }

  consistPath(path) {
    let newPath = []
    if (path[0].type == 'public') {
      //entry is public
      newPath = [{name:'我的所有文件', uuid: null, type:'false'}, ...path]
      // path.unshift()

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
        key={item.uuid || item.path || item.name}
        node={item} 
        selectNode={this.selectNode.bind(this, index)}
        enter={this.enter.bind(this, item)}
        disable={this.isRowDisable(item)}
        isSelected={index === this.state.currentSelectedIndex} />)
    )
  }

  getButtonStyle() {
    if (this.state.currentSelectedIndex != -1 && this.state.currentDir.type=='folder') return 'move-button' 
    else if (this.state.currentDir.type !== 'folder' && this.state.currentDir.type !== "directory") return 'disable move-button'
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
          <span className='move-dialog-title'>{this.state.currentDir.name || this.state.currentDir.label}</span>
          <span className='move-title-icon' onTouchTap={this.closeDialog.bind(this)}><CloseIcon/></span>
        </div>
        <div className='move-dialog-list'>
          {this.state.loading && <CircularProgress style={{display:'block'}} className='move-dialog-loading'/>}
          {!this.state.loading && this.getList()}
        </div>
        <div className='move-operation'>
          <span className={this.getButtonStyle()} onTouchTap={this.move.bind(this)}>{this.getButtonText()}</span>
        </div>
      </div>
    )
  }

  closeDialog() {
    this.props.onRequestClose()
  }

  updateState(path, currentDir, list) {
    this.setState({
      path: path?path:this.state.path,
      list: list?list:this.state.list,
      currentDir: currentDir?currentDir:this.state.currentDir,
      loading: false,
      currentSelectedIndex: -1
    })
  }

  enter(node) {
    if (node.type == 'file') return
    if (this.selectedArr.findIndex(item => item.uuid === node.uuid) !== -1) return
    let path = [...this.state.path, node]
    let currentDir = node
    if (node.type == 'folder' && !node.fileSystemUUID) {

      this.list(node.uuid).then( data => {
        let list = data
        this.updateState(path, currentDir, list)
      }).catch(err => console.log(err))
    }else if (node.type == 'public') {

      let list = this.props.apis.adminDrives.data.drives
      list.forEach(item => item.type = 'folder')
      this.setState({loading:true})
      setTimeout(() => {
        this.updateState(path, currentDir, list)
      },0)
    }else if (node.type == 'physical'){

      this.extDrives().then(list => {
        list.forEach(item => item.type = 'folder')
        this.updateState(path, currentDir, list)
      })

    }else if (node.fileSystemUUID) {
      this.aget('files/external/fs/' + node.fileSystemUUID + '/').end((err, res) => {
        if (err) console.log('err')
        else {
          let list = JSON.parse(res.text)
          // list.forEach(item => item.type = )
          this.updateState(path, currentDir, list)
        }
      })
    }else if (node.type == 'directory') {
      let string = 'files/external/fs/'
      let fileSystemUUIDIndex = this.state.path.findIndex(item => item.fileSystemUUID)
      string += this.state.path[fileSystemUUIDIndex].fileSystemUUID + '/'
      this.state.path.forEach((item, index) => {
        if (index > fileSystemUUIDIndex) string += (this.state.path[index].name + '/')
        else return
      })
      string += node.name
      this.aget(string).end((err, res) => {
        if (err) console.log(err)
        else {
          let list = JSON.parse(res.text)
          this.updateState(path, currentDir, list)
        }
      })
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

    if (currentDir.type === 'folder' && !currentDir.fileSystemUUID) {

      this.list(currentDir.uuid).then(list => this.updateState(copyPath, currentDir, list))

    }else if (currentDir.type === 'public'){

      let list = apis.adminDrives.data.drives
      list.forEach(item => item.type = 'folder')
      this.updateState(copyPath, currentDir, list)

    }else if(currentDir.type === 'false'){
      
      let list = [{name:'我的文件', type:'folder', uuid:apis.account.data.home}, 
                  {name:'共享文件夹',type: 'public', uuid: '共享文件夹'},
                  {name:'物理磁盘', type: 'physical', uuid:'物理磁盘'}]
      
      this.updateState(copyPath, currentDir, list)

    }else if (currentDir.type === 'physical') {
      this.extDrives().then(list => {
        list.forEach(item => item.type = 'folder')
        this.updateState(copyPath, currentDir, list)
      })
    }else if (currentDir.fileSystemUUID) {
      let string = 'files/external/fs/' + currentDir.fileSystemUUID + '/'
      this.setState({loading:true})
      this.aget(string).end((err, res) => {
        if (err) console.log(err)
        else {
          let list = JSON.parse(res.text)
          this.updateState(copyPath, currentDir, list)
        }
      })
    }else if (currentDir.type == 'directory'){
      let string = 'files/external/fs/'
      let fileSystemUUIDIndex = copyPath.findIndex(item => item.fileSystemUUID)
      string += copyPath[fileSystemUUIDIndex].fileSystemUUID + '/'
      copyPath.forEach((item, index) => {
        if (index > fileSystemUUIDIndex) string += (copyPath[index].name + '/')
      })

      this.setState({loading:true})
      this.aget(string).end((err, res) => {
        if (err) console.log(err)
        else {
          let list = JSON.parse(res.text)
          this.updateState(copyPath, currentDir, list)
        }
      })
    }
  }

  selectNode(index) {
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

  move() {
    if (this.directory.uuid === this.state.currentDir.uuid) return
    if (this.state.currentDir.type == 'false') return
    if (this.state.currentDir.type == 'public') return
    if (this.state.currentDir.type == 'physical') return

    let dstobj
    if (this.state.currentSelectedIndex != -1) {
      dstobj = this.state.list[this.state.currentSelectedIndex]
    }else {
      dstobj = this.state.currentDir
    }
    let dst = {type:'', path:''}
    if (dstobj.uuid) {
      dst.type = 'fruitmix'
      dst.path = dstobj.uuid
    }
    else {
      dst.type = 'ext'
      dst.path = '/'
      this.state.path.forEach(item => {
        if (item.type == 'physical')  return
        if (item.type == 'false') return
        if (item.fileSystemUUID) dst.rootPath = item.fileSystemUUID
        else dst.path += (item.name + '/')
      })
    }

    this.selectedArr.forEach(item => {

      let obj = {src:{type:item.uuid?'fruitmix':'ext', path:item.uuid?item.uuid:null,rootPath:null},dst}

      this.apost('files/transfer/move',obj).end((err, res) => {
        if (err) console.log(err)
        else {
          this.props.onRequestClose()
        }
      })
    })
  }

  extDrives() {
    return new Promise((resolve, reject) => {
      this.aget('files/external/fs').end((err, res) => {
        if (err) return reject(err)
        else {
          let arr = JSON.parse(res.text)
          let list = []
          arr.forEach(item => {
            if (item.fileSystemType == 'ntfs') list.push(item)
          })
          resolve(list)
        }
      })

    })
  }

  adminDrives() {
    return new Promise((resolve, reject) => {
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
    this.setState({loading:true})
    return request
      .get(encodeURI(string))
      .set('Authorization', 'JWT ' + token)
  }

  apost(ep, data) {
    let { address, token} = this.props.apis
    let string = 'http://'+address+':3721/'+ep
    let r = request
      .post(string)
      .set('Authorization', 'JWT ' + token)

    return typeof data === 'object'
      ? r.send(data)
      : r
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
