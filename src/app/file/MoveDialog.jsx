import React from 'react'
import { ipcRenderer } from 'electron'
import { IconButton, CircularProgress } from 'material-ui'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import request from 'superagent'
import FlatButton from '../common/FlatButton'

class Row extends React.PureComponent {
  render() {
    const node = this.props.node
    const disable = this.props.disable
    const isSelected = this.props.isSelected
    return (
      <div
        style={{
          height: 36,
          lineHeight: 36,
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexFlow: 'row nowrap',
          alignItems: 'center',
          background: isSelected ? '#4d90fe' : '',
          opacity: disable ? 0.5 : 1
        }}
        onTouchTap={disable ? null : this.props.selectNode}
        onDoubleClick={this.props.enter}
      >
        <div style={{ margin: '0 18px 0 13px', display: 'flex' }}>
          {
            node.type === 'file' ?
              <EditorInsertDriveFile style={{ color: 'rgba(0,0,0,0.54)' }} /> :
              <FileFolder style={{ color: 'rgba(0,0,0,0.54)' }} />
          }
        </div>
        <span
          style={{
            width: 150,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: 5
          }}
        >{node.name || node.label || node.mountpoint}</span>
        <span
          style={{
            display: 'none',
            width: 23,
            height: '25px!important',
            lineHeight: '25px!important',
            cursor: 'pointer',
            justifyContent: 'center'
          }}
          onTouchTap={this.props.enter}
        >
          <ArrowRight />
        </span>
      </div>
    )
  }
}

class MoveDialog extends React.PureComponent {
  constructor(props) {
    super(props)

    const entries = this.props.entries
    const selected = this.props.select.selected

    this.path = this.props.path
    this.paths = [{ name: '我的所有文件', uuid: null, type: 'false' }, ...this.path]
    this.selectedArr = selected.map(item => entries[item])
    this.directory = this.path[this.path.length - 1]

    this.state = {
      list: this.props.entries,
      currentDir: this.path[this.path.length - 1],
      path: this.paths,
      loading: false,
      currentSelectedIndex: -1
    }
  }

  /* 移动按钮是否工作 */
  getButtonStatus() {
    const type = this.state.currentDir.type
    const selectedObj = this.state.currentSelectedIndex !== -1 ? this.state.list[this.state.currentSelectedIndex] : null

    /* false, public, physical 不能被指定为目标) */
    if (type !== 'folder' && type !== 'directory') return true

    /* 列表中有元素被选中时，不能为待移动的文件夹 */
    if (this.state.currentSelectedIndex !== -1) {
      if (type === 'folder' && !this.state.currentDir.fileSystemUUID) {
        if (!this.selectedArr.findIndex(item => item.uuid === selectedObj.uuid) === -1) {
          return true
        }
      } else if (type === 'directory' || this.state.currentDir.fileSystemUUID) {
        if (this.inSameDirectory() && !this.selectedArr.findIndex(item => item.name === selectedObj.name) === -1) {
          return true
        }
      }

      /* 被选文件夹不能是待移动文件的父文件夹 */
      if (selectedObj.uuid === this.directory.uuid) return true

      /* 列表中没有元素被选中时，当前文件夹不能与被选中元素所在文件夹相同 */
    } else if (type === 'folder' && !this.state.currentDir.fileSystemUUID && this.inSameDirectory()) {
      return true
    } else if (type === 'directory' || this.state.currentDir.fileSystemUUID && this.inSameDirectory()) {
      return true
    }
    return false
  }

  getButtonText() {
    const text = this.props.operation === 'move' ? '移动' : '拷贝'
    if (this.state.currentSelectedIndex !== -1) return text
    else if (this.directory.uuid === this.state.currentDir.uuid) return text
    return `${text}到这里`
  }

  /* 行是否能被选中 */
  isRowDisable(node) {
    const type = node.type
    // 文件不能被选中
    if (type == 'file') return true
    // 磁盘路径下: 节点不在被选中数组内
    else if (node.type === 'directory') {
      if (this.inSameDirectory()) {
        // 在同一级文件夹
        if (this.selectedArr.findIndex(item => item.name == node.name) === -1) return false
        return true
      }
      // 不在同一级文件夹 可以被选中
      return false
    }
    // drive路径下：节点不在被选中数组内
    else if (node.type == 'folder') {
      if (this.inSameDirectory()) {
        if (this.selectedArr.findIndex(item => item.uuid === node.uuid) === -1) return false
        return true
      }
      // 不在同一级文件夹 可以被选中
      return false
    }
    return false
  }

  closeDialog() {
    this.props.onRequestClose()
  }

  updateState(path, currentDir, list) {
    this.setState({
      path: path || this.state.path,
      list: list || this.state.list,
      currentDir: currentDir || this.state.currentDir,
      loading: false,
      currentSelectedIndex: -1
    })
  }

  enter(node) {
    // console.log('node', node)
    // condition can not be enter
    if (node.type === 'file') return
    if (this.props.type !== 'physical' && this.selectedArr.findIndex(item => item.uuid === node.uuid) !== -1) return
    if (node.type === 'directory') {
      let oldPathString = ''
      let newPathString = ''
      this.paths.forEach(item => (oldPathString += item.name))
      this.state.path.forEach(item => (newPathString += item.name))
      // console.log(oldPathString, newPathString)
      if (oldPathString === newPathString && this.selectedArr.findIndex(item => item.name === node.name) !== -1) return
    }

    const path = [...this.state.path, node]
    const currentDir = node
    if (node.type === 'folder' && !node.fileSystemUUID) {
      this.list(node.uuid).then((data) => {
        const list = data
        this.updateState(path, currentDir, list)
      }).catch(err => console.log(err))
    } else if (node.type === 'public') {
      const list = this.props.apis.drives.data
      list.forEach(item => (item.type = 'folder'))
      this.setState({ loading: true })
      setTimeout(() => {
        this.updateState(path, currentDir, list)
      }, 0)
    } else if (node.type === 'physical') {
      this.extDrives().then((list) => {
        list.forEach(item => (item.type = 'folder'))
        this.updateState(path, currentDir, list)
      })
    } else if (node.fileSystemUUID) {
      this.aget(`files/external/fs/${node.fileSystemUUID}/`).end((err, res) => {
        if (err) console.log('err')
        else {
          const list = JSON.parse(res.text)
          this.updateState(path, currentDir, list)
        }
      })
    } else if (node.type == 'directory') {
      let string = 'files/external/fs/'
      const fileSystemUUIDIndex = this.state.path.findIndex(item => item.fileSystemUUID)
      string += `${this.state.path[fileSystemUUIDIndex].fileSystemUUID}/`
      this.state.path.forEach((item, index) => {
        if (index > fileSystemUUIDIndex) string += (`${this.state.path[index].name}/`)
        else return
      })
      string += node.name
      this.aget(string).end((err, res) => {
        if (err) console.log(err)
        else {
          const list = JSON.parse(res.text)
          this.updateState(path, currentDir, list)
        }
      })
    }
  }

  back() {
    const apis = this.props.apis
    const path = this.state.path
    if (path.length === 1) return
    if (this.state.loading) return
    const currentDir = path[path.length - 2]

    const copyPath = [...path]
    const newPath = copyPath.pop()

    if (currentDir.type === 'folder' && !currentDir.fileSystemUUID) {
      // nav-dir
      this.list(currentDir.uuid).then(list => this.updateState(copyPath, currentDir, list))
    } else if (currentDir.type === 'public') {
      // get adminDrives FIXME
      const list = apis.drives.data
      list.forEach(item => item.type = 'folder')
      this.updateState(copyPath, currentDir, list)
    } else if (currentDir.type === 'false') {
      // get virtual root
      const list = [{ name: '我的文件', type: 'folder', uuid: apis.account.data.home },
                  { name: '共享文件夹', type: 'public', uuid: '共享文件夹' },
                  { name: '物理磁盘', type: 'physical', uuid: '物理磁盘' }]

      this.updateState(copyPath, currentDir, list)
    } else if (currentDir.type === 'physical') {
      // get extDrives
      this.extDrives().then((list) => {
        list.forEach(item => item.type = 'folder')
        this.updateState(copyPath, currentDir, list)
      })
    } else if (currentDir.fileSystemUUID || currentDir.type == 'directory') {
       // //get physical path
      let string = 'files/external/fs/'
      const fileSystemUUIDIndex = copyPath.findIndex(item => item.fileSystemUUID)
      if (fileSystemUUIDIndex == -1) return
      copyPath.forEach((item, index) => {
        if (index == fileSystemUUIDIndex) string += `${copyPath[index].fileSystemUUID}/`
        if (index > fileSystemUUIDIndex) string += (`${copyPath[index].name}/`)
      })

      this.setState({ loading: true })
      this.aget(string).end((err, res) => {
        if (err) console.log(err)
        else {
          const list = JSON.parse(res.text)
          this.updateState(copyPath, currentDir, list)
        }
      })
    }
  }

  selectNode(index) {
    if (this.state.currentSelectedIndex == index) this.setState({ currentSelectedIndex: -1 })
    else this.setState({ currentSelectedIndex: index })
  }

  // apis
  list(uuid) {
    return new Promise((resolve, reject) => {
      this.setState({ loading: true })
      const string = `files/fruitmix/list/${uuid}/${uuid}`
      this.aget(string).end((err, res) => {
        if (err) return reject(err)
        resolve(this.sort(JSON.parse(res.text)))
      })
    })
  }

  move() {
    // dst
    let dstobj
    if (this.state.currentSelectedIndex !== -1) {
      dstobj = this.state.list[this.state.currentSelectedIndex]
    } else {
      dstobj = this.state.currentDir
    }
    const dst = { type: '', path: '' }
    if (dstobj.uuid) {
      dst.type = 'fruitmix'
      dst.path = dstobj.uuid
    } else {
      dst.type = 'ext'
      dst.path = '/'
      this.state.path.forEach((item) => {
        if (item.type === 'physical' || item.type === 'false') return
        if (item.fileSystemUUID) dst.rootPath = item.fileSystemUUID
        else dst.path += (`${item.name}/`)
      })
      if (this.state.currentSelectedIndex !== -1) dst.path += this.state.list[this.state.currentSelectedIndex].name
    }

    // src
    let string = '/'
    if (this.props.type === 'physical') {
      // console.log(this.path)
      this.path.forEach((item, index) => {
        if (index > 1) string += (`${item.name}/`)
      })
    }

    this.selectedArr.forEach((item) => {
      const obj = { src: {
        type: item.uuid ? 'fruitmix' : 'ext',
        path: item.uuid ? item.uuid : string + item.name,
        rootPath: item.uuid ? null : this.path[1].fileSystemUUID },
        dst }
      // return console.log(obj, this.directory)
      this.apost(`files/transfer/${this.props.operation}`, obj).end((err, res) => {
        if (err) console.log(err)
        else {
          Object.assign(obj, JSON.parse(res.text), { name: item.name, createDate: (new Date()).getTime(), type: this.props.operation, directory: this.directory })
          // console.log(obj)
          ipcRenderer.send('TRANSFER', obj)
          this.props.onRequestClose()
        }
      })
    })
  }

  inSameDirectory() {
    if (this.props.type === 'physical') {
      let oldPathString = ''
      let newPathString = ''
      this.paths.forEach(item => (oldPathString += item.name))
      this.state.path.forEach(item => (newPathString += item.name))
      if (oldPathString === newPathString) return true
      return false
    }
    return this.state.currentDir.uuid === this.directory.uuid
  }

  extDrives() {
    return new Promise((resolve, reject) => {
      this.aget('files/external/fs').end((err, res) => {
        if (err) return reject(err)

        const arr = JSON.parse(res.text)
        const list = []
        arr.forEach((item) => {
          if (item.fileSystemType == 'ntfs') list.push(item)
        })
        resolve(list)
      })
    })
  }

  adminDrives() {
    return new Promise((resolve, reject) => {
      const string = 'admin/drives'
      this.aget(string).end((err, res) => {
        if (err) return reject(err)
        resolve(JSON.parse(res.text))
      })
    })
  }

  aget(ep) {
    const { address, token } = this.props.apis
    const string = `http://${address}:3721/${ep}`
    this.setState({ loading: true })
    return request
      .get(encodeURI(string))
      .set('Authorization', `JWT ${token}`)
  }

  apost(ep, data) {
    const { address, token } = this.props.apis
    const string = `http://${address}:3721/${ep}`
    const r = request
      .post(string)
      .set('Authorization', `JWT ${token}`)

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

  renderCurrentDir() {
    console.log('current directory', this.state.currentDir, this.path)
    if (this.state.currentDir.uuid === this.path[0].uuid) {
      const type = this.state.currentDir.type
      return type === 'folder' ? '我的文件' : type === 'public' ? '共享文件夹' : '物理磁盘'
    }
    return this.state.currentDir.name || this.state.currentDir.label
  }

  render() {
    return (
      <div style={{ width: 336 }}>
        {/* header */}
        <div
          style={{
            height: 56,
            backgroundColor: '#f1f1f1',
            position: 'relative',
            display: 'flex',
            flexFlow: 'row nowrap',
            justifyContent: 'flex-start',
            alignItems: 'center'
          }}
        >
          {/* back button */}
          <div
            style={{ flex: '0 0 48px', display: 'flex', justifyContent: 'center' }}
            onTouchTap={this.back.bind(this)}
          >
            <IconButton style={{ display: this.state.path.length > 1 ? '' : 'none' }}>
              <BackIcon />
            </IconButton>
          </div>

          {/* current directory */}
          <div
            style={{
              flex: '0 0 240px',
              color: 'rgba(0,0,0,0.87)',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}
          >
            { this.renderCurrentDir() }
          </div>

          {/* close button */}
          <div
            style={{ flex: '0 0 48px', display: 'flex', justifyContent: 'center' }}
            onTouchTap={this.closeDialog.bind(this)}
          >
            <IconButton>
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        {/* list of directory */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 288,
            height: 200,
            overflowY: 'auto',
            padding: '8px 24px 0px 24px',
            color: 'rgba(0,0,0,0.87)'
          }}
        >
          {
            this.state.loading ? <CircularProgress /> :
            <div style={{ height: '100%', width: '100%' }}>
              {
                  this.state.list.map((item, index) => (
                    <Row
                      key={item.uuid || item.path || item.name}
                      node={item}
                      selectNode={this.selectNode.bind(this, index)}
                      enter={this.enter.bind(this, item)}
                      disable={this.isRowDisable(item)}
                      isSelected={index === this.state.currentSelectedIndex}
                    />
                  ))
                }
            </div>
          }
        </div>

        {/* confirm button */}
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <FlatButton
            label={this.getButtonText()}
            primary
            disabled={this.getButtonStatus()}
            onTouchTap={this.move.bind(this)}
          />
        </div>
      </div>
    )
  }
}

export default MoveDialog
