import React from 'react'
import { IconButton, CircularProgress, RaisedButton, TextField } from 'material-ui'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import Promise from 'bluebird'
import request from 'superagent'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'
import { ShareDisk } from '../common/Svg'

Promise.promisifyAll(request)

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
        onDoubleClick={() => this.props.enter(node)}
      >
        <div style={{ margin: '0 12px 0 12px', display: 'flex' }}>
          {
            node.type === 'file'
            ? <EditorInsertDriveFile style={{ color: 'rgba(0,0,0,0.54)' }} />
            : node.type === 'public' || node.type === 'publicRoot'
            ? <ShareDisk style={{ color: 'rgba(0,0,0,0.54)' }} />
            : <FileFolder style={{ color: 'rgba(0,0,0,0.54)' }} />
          }
        </div>
        <div
          style={{
            width: 240,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: 5,
            fontSize: 14
          }}
        >
          { node.name || node.label || node.mountpoint }
        </div>
        <div
          style={{
            display: isSelected ? '' : 'none',
            width: 24,
            marginTop: 16,
            cursor: 'pointer',
            justifyContent: 'center'
          }}
          onTouchTap={() => this.props.enter(node)}
        >
          <ArrowRight color="rgba(0,0,0,0.54)" />
        </div>
      </div>
    )
  }
}

class MoveDialog extends React.PureComponent {
  constructor(props) {
    super(props)

    this.path = this.props.path
    this.selectedArr = this.props.select.selected.map(item => this.props.entries[item])
    this.directory = this.path[this.path.length - 1]

    this.state = {
      list: this.props.entries,
      currentDir: Object.assign({}, this.path[this.path.length - 1], { type: 'directory' }),
      path: [{ name: '我的盒子', uuid: this.path[0].uuid, type: 'root' }, ...this.path],
      loading: false,
      currentSelectedIndex: -1,
      errorText: '',
      newFoldName: ''
    }

    /** actions **/

    /* enter dir */
    this.enter = (node) => {
      /* conditions that can not enter */
      if (node.type === 'file') return

      /* update current path and dir */
      const currentDir = node
      const path = node.setRoot ? [node] : [...this.state.path, node]

      /* set parameter to get file list */
      const dirUUID = node.uuid
      const driveUUID = this.state.path[0].uuid

      if (node.tag === 'home' || node.type === 'public') {  // home drive or public drives, driveUUID = dirUUID
        this.list(dirUUID, dirUUID)
          .then((list) => {
            /* reset driveUUID */
            console.log('reset driveUUID', dirUUID)
            path[0].uuid = dirUUID
            this.updateState(path, currentDir, list)
          })
          .catch(err => console.log(err))
      } else if (node.type === 'directory') {               // normal directory in drives
        this.list(driveUUID, dirUUID)
          .then((list) => {
            this.updateState(path, currentDir, list)
          })
          .catch(err => console.log(err))
      } else if (node.type === 'publicRoot') {              // list public drives
        const list = this.props.apis.drives.value().filter(d => d.tag !== 'home')
        setImmediate(() => this.updateState(path, currentDir, list))
      }
    }

    /* back to parent */
    this.back = () => {
      /* conditions that can not back: loading or in root */
      if (this.state.path.length === 1 || this.state.loading) return

      /* update current path and dir */
      const currentDir = this.state.path[this.state.path.length - 2]
      if (!currentDir.type) currentDir.type = 'directory'
      const path = this.state.path.slice(0, this.state.path.length - 1)

      /* set parameter to get file list */
      const dirUUID = currentDir.uuid
      const driveUUID = path[0].uuid

      if (currentDir.type === 'directory' || currentDir.type === 'public') {    // normal directory
        this.list(driveUUID, dirUUID)
          .then(list => this.updateState(path, currentDir, list))
          .catch(err => console.log(err))
      } else if (currentDir.type === 'root') {                      // root
        const drives = this.props.apis.drives.value()
        const list = [
          { name: '我的文件', type: 'directory', uuid: drives.find(d => d.tag === 'home').uuid, tag: 'home' },
          { name: '共享盘', type: 'publicRoot' }
        ]
        setImmediate(() => this.updateState(path, currentDir, list))
      } else if (currentDir.type === 'publicRoot') {                // list public drives
        const list = this.props.apis.drives.value().filter(d => d.tag !== 'home')
        setImmediate(() => this.updateState(path, currentDir, list))
      }
    }

    /* create new folder */
    this.createNewFolder = () => {
      console.log('this.createNewFolder', this.props, this.state)
      const args = {
        driveUUID: this.state.path[0].uuid,
        dirUUID: this.state.currentSelectedIndex > -1
        ? this.state.list[this.state.currentSelectedIndex].uuid
        : this.state.currentDir.uuid,
        dirname: this.state.newFoldName
      }
      if (this.state.currentSelectedIndex > -1) this.enter(this.state.list[this.state.currentSelectedIndex])
      this.props.apis.request('mkdir', args, (err, data) => {
        if (err) {
          // this.setState({ errorText: err.message })
          this.setState({ errorText: '出现错误，请重试！' })
        } else {
          const node = data.entries.find(entry => entry.name === this.state.newFoldName)
          this.enter(node)
          this.props.refresh()
          this.setState({ cnf: false, newFoldName: '', errorText: '' })
        }
      })
    }

    this.handleChange = (newFoldName) => {
      const newValue = sanitize(newFoldName)
      const entries = this.state.list
      if (entries.findIndex(entry => entry.name === newFoldName) > -1) {
        this.setState({ newFoldName, errorText: '名称已存在' })
      } else if (newFoldName !== newValue) {
        this.setState({ newFoldName, errorText: '名称不合法' })
      } else {
        this.setState({ newFoldName, errorText: '' })
      }
    }

    this.onKeyDown = (e) => {
      if (e.which === 13 && !this.state.errorText && !!this.state.newFoldName.length) this.createNewFolder()
    }

    /* select node */
    this.selectNode = (index) => {
      if (this.state.currentSelectedIndex === index) this.setState({ currentSelectedIndex: -1 })
      else this.setState({ currentSelectedIndex: index })
    }

    /* fire: move or copy */
    this.move = () => {
      /* set parameter */
      const type = this.props.operation
      const src = {
        drive: this.path[0].uuid,
        dir: this.directory.uuid
      }
      const node = this.state.currentSelectedIndex > -1 ? this.state.list[this.state.currentSelectedIndex] : null
      const dst = {
        drive: node && (node.tag === 'home' || node.type === 'public')
        ? node.uuid
        : this.state.path[0].uuid,
        dir: node
        ? node.uuid
        : this.state.path[this.state.path.length - 1].uuid
      }
      const entries = this.selectedArr.map(e => e.uuid)

      this.setState({ loading: true })
      this.props.apis.request('copy', { type, src, dst, entries }, this.finish)
    }

    /* finish post change dialog content to waiting/result */
    this.finish = (error, data) => {
      if (error) {
        this.setState({ loading: false })
        this.closeDialog()
        this.props.openSnackBar('失败')
        return
      }
      this.getTaskState(data.uuid).asCallback((err) => {
        if (err) {
          this.setState({ loading: false })
          this.closeDialog()
          return this.props.openSnackBar('失败')
        }
        this.setState({ loading: false })
        this.closeDialog()
        return this.props.openSnackBar('成功')
      })
    }

    /* request task state */
    this.getTaskState = async (uuid) => {
      // const data = await this.agetAsync(`tasks/${uuid}`)
      const list = await this.agetAsync('tasks')
      const data = list.find(l => l.uuid === uuid)
      if (!data.isStopped) {
        console.log('retry', data)
        await this.sleep(200)
        await this.getTaskState(uuid)
      }
      return data
    }

    /* close dialog */
    this.closeDialog = () => this.props.onRequestClose()

    /** apis and other funcs **/
    /* sort file list */
    this.sort = data => [...data.entries].sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'directory') return 1
      return a.name.localeCompare(b.name)
    })

    this.sleep = time => new Promise(resolve => setTimeout(resolve, time))

    /* get file list */
    this.list = (driveUUID, dirUUID) => new Promise((resolve, reject) => {
      this.setState({ loading: true })
      this.aget(`drives/${driveUUID}/dirs/${dirUUID}`).end((err, res) => {
        if (err) return reject(err)
        console.log('this.list', res.body)
        return resolve(this.sort(this.props.apis.stationID ? res.body.data : res.body))
      })
    })

    this.aget = (ep) => {
      const { address, token, stationID } = this.props.apis
      this.setState({ loading: true })
      if (stationID) {
        const url = `${address}/c/v1/stations/${stationID}/json`
        const resource = new Buffer(`/${ep}`).toString('base64')
        return request
          .get(url)
          .query({ resource, method: 'GET' })
          .set('Authorization', token)
      }
      const string = `http://${address}:3000/${ep}`
      return request.get(encodeURI(string)).set('Authorization', `JWT ${token}`)
    }

    this.agetAsync = ep => new Promise((resolve, reject) => {
      this.aget(ep).end((err, res) => {
        if (err) return reject(err)
        console.log('this.agetAsync', res)
        return this.props.apis.stationID ? resolve(res.body.data) : resolve(res.body)
      })
    })
  }

  componentWillMount() {
    if (this.props.type === 'share') this.enter({ type: 'publicRoot', name: '共享盘', setRoot: true })
  }

  /* 移动按钮是否工作 disabled ? */
  getButtonStatus() {
    const { name, uuid, type } = this.state.currentDir
    const selectedObj = this.state.currentSelectedIndex !== -1 ? this.state.list[this.state.currentSelectedIndex] : null
    if (this.state.loading || this.state.cnf) return true

    /* root 不能被指定为目标, 文件夹、共享盘、home可以被定为目标 */
    if (type !== 'directory' && type !== 'publicRoot' && type !== 'public' && name !== uuid) return true

    /* 列表中有元素被选中时，不能为待移动的文件夹 */
    if (this.state.currentSelectedIndex !== -1) {
      if (type === 'directory') {
        if (!this.selectedArr.findIndex(item => item.uuid === selectedObj.uuid) === -1) {
          return true
        }
      }
      /* 被选文件夹不能是待移动文件的父文件夹 */
      if (selectedObj.uuid === this.directory.uuid) return true

      /* 列表中没有元素被选中时，当前文件夹不能与被选中元素所在文件夹相同 */
    } else if (type === 'directory' && this.inSameDirectory()) {
      return true
    } else if (type === 'publicRoot') {
      return true
    }
    return false
  }

  /* 按钮文字 */
  getButtonText() {
    const type = this.props.type === 'copy' ? '拷贝' : this.props.type === 'move' ? '移动' : '分享'
    if (this.state.currentSelectedIndex !== -1 || this.directory.uuid === this.state.currentDir.uuid) {
      return `${type}至选中文件夹`
    }
    return `${type}至当前文件夹`
  }

  /* 是否在同一目录 */
  inSameDirectory() {
    return this.state.currentDir.uuid === this.directory.uuid
  }

  /* 更新当前显示的目录及文件 */
  updateState(path, currentDir, list) {
    this.setState({
      path: path || this.state.path,
      list: list || this.state.list,
      currentDir: currentDir || this.state.currentDir,
      loading: false,
      currentSelectedIndex: -1
    })
  }

  /* 行是否能被选中 */
  isRowDisable(node) {
    const type = node.type
    if (type === 'file') {                   // 文件不能被选中
      return true
    } else if (node.type === 'directory') {  // drive路径下：节点不在被选中数组内
      if (this.inSameDirectory()) {
        if (this.selectedArr.findIndex(item => item.uuid === node.uuid) === -1) return false
        return true                         // 被移动的文件夹不能被选中
      }
      return false                          // 不在同一级文件夹 可以被选中
    }
    return false
  }

  /* 当前所在位置的名称 */
  renderCurrentDir() {
    console.log('current directory', this.state.currentDir, this.state.path)
    const type = this.state.currentDir.type
    return this.state.currentDir.name === this.state.currentDir.uuid
      ? '我的文件'
      : type === 'publicRoot'
      ? '共享盘'
      : type === 'root'
      ? '我的盒子'
      : this.state.currentDir.name || this.state.currentDir.label
  }

  renderHeader() {
    return (
      <div
        style={{
          height: 56,
          backgroundColor: '#EEEEEE',
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
          onTouchTap={this.state.cnf ? () => this.setState({ cnf: false }) : this.back}
        >
          <IconButton style={{ display: this.state.path.length > 1 ? '' : 'none' }}>
            <BackIcon color="rgba(0,0,0,0.54)" style={{ height: 16, width: 16 }} />
          </IconButton>
        </div>

        {/* name */}
        <div
          style={{
            flex: '0 0 240px',
            color: 'rgba(0,0,0,0.54)',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontWeight: 500
          }}
        >
          { this.state.cnf
              ? <TextField
                fullWidth
                name="createNewFolder"
                value={this.state.newFoldName}
                errorText={this.state.errorText}
                onChange={e => this.handleChange(e.target.value)}
                ref={input => input && input.focus()}
                onKeyDown={this.onKeyDown}
              />
              : this.renderCurrentDir() }
        </div>

        {/* confirm or close button */}
        <div style={{ flex: '0 0 48px', display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onTouchTap={this.state.cnf ? this.createNewFolder : this.closeDialog}
            disabled={!!this.state.errorText || (this.state.cnf && !this.state.newFoldName.length)}
          >
            { this.state.cnf ? <DoneIcon color={this.props.primaryColor} /> : <CloseIcon color="rgba(0,0,0,0.54)" /> }
          </IconButton>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div style={{ width: 336, height: 448 }}>
        {/* header */}
        { this.renderHeader() }

        {/* list of directory */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 336,
            height: 324,
            overflowY: 'auto',
            color: 'rgba(0,0,0,0.87)'
          }}
        >
          {
            this.state.loading
              ? <CircularProgress />
              : this.state.cnf
              ? <div style={{ fontSize: 14, width: 288, margin: 24, textAlign: 'center', wordWrap: 'break-word' }}>
                {
                  `在“${this.state.currentSelectedIndex > -1
                    ? this.state.list[this.state.currentSelectedIndex].name
                      : this.renderCurrentDir()}”中创建新文件夹`
                }
              </div>
              : <div style={{ height: '100%', width: '100%' }}>
                {
                  this.state.list.length ? this.state.list.map((item, index) => (
                    <Row
                      key={item.uuid || item.path || item.name}
                      node={item}
                      selectNode={() => this.selectNode(index)}
                      enter={this.enter}
                      disable={this.isRowDisable(item)}
                      isSelected={index === this.state.currentSelectedIndex}
                    />
                  ))
                  : this.state.currentDir.type === 'publicRoot'
                  ? <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <div> { '尚未创建共享盘' } </div>
                    { this.props.apis.account && this.props.apis.account.data && this.props.apis.account.data.isAdmin &&
                    <FlatButton label="去创建" primary onTouchTap={() => { this.closeDialog; this.props.navTo('adminDrives') }} /> }
                  </div>
                  : <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    { '此文件夹为空' }
                  </div>
                }
              </div>
          }
        </div>

        {/* confirm button */}
        <div style={{ height: 68, display: 'flex', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
          <RaisedButton
            primary
            style={{ marginLeft: 16 }}
            label={this.getButtonText()}
            disabled={this.getButtonStatus()}
            disabledBackgroundColor="#FAFAFA"
            onTouchTap={this.move}
          />
          <div style={{ flexGrow: 1 }} />
          { /* can't add new fold in root or publicRoot */
            this.state.path.length > 1 && (this.state.path.length !== 2 || this.state.path[1].type !== 'publicRoot') &&
              <IconButton
                tooltip="新建文件夹" tooltipPosition="top-center"
                style={{ marginRight: 16 }} onTouchTap={() => this.setState({ cnf: true })}
                disabled={this.state.cnf}
              >
                <FileCreateNewFolder color="rgba(0,0,0,0.54)" />
              </IconButton>
          }
        </div>
      </div>
    )
  }
}

export default MoveDialog
