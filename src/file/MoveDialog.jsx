import React from 'react'
import i18n from 'i18n'
import { IconButton, CircularProgress, RaisedButton, TextField } from 'material-ui'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'
import { ShareDisk } from '../common/Svg'

class Row extends React.PureComponent {
  render() {
    const { node, disable, isSelected } = this.props
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
      path: [{ name: i18n.__('Box Title'), uuid: this.path[0].uuid, type: 'root' }, ...this.path],
      loading: false,
      currentSelectedIndex: -1,
      errorText: '',
      newFoldName: ''
    }

    /** actions * */

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

      if (node.tag === 'home' || node.type === 'public') { // home drive or public drives, driveUUID = dirUUID
        this.list(dirUUID, dirUUID)
          .then((list) => {
            /* reset driveUUID */
            path[0].uuid = dirUUID
            this.updateState(path, currentDir, list)
          })
          .catch(err => console.log(err))
      } else if (node.type === 'directory') { // normal directory in drives
        this.list(driveUUID, dirUUID)
          .then((list) => {
            this.updateState(path, currentDir, list)
          })
          .catch(err => console.log(err))
      } else if (node.type === 'publicRoot') { // list public drives
        const myUUID = this.props.apis.account.data && this.props.apis.account.data.uuid
        const list = this.props.apis.drives.value().filter(d => d.type === 'public' && d.writelist.find(u => u === myUUID))
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

      if (currentDir.type === 'directory' || currentDir.type === 'public') { // normal directory
        this.list(driveUUID, dirUUID)
          .then(list => this.updateState(path, currentDir, list))
          .catch(err => console.log(err))
      } else if (currentDir.type === 'root') { // root
        const drives = this.props.apis.drives.value()
        const list = [
          { name: i18n.__('Home Title'), type: 'directory', uuid: drives.find(d => d.tag === 'home').uuid, tag: 'home' },
          { name: i18n.__('Public Drive'), type: 'publicRoot' }
        ]
        setImmediate(() => this.updateState(path, currentDir, list))
      } else if (currentDir.type === 'publicRoot') { // list public drives
        const myUUID = this.props.apis.account.data && this.props.apis.account.data.uuid
        const list = this.props.apis.drives.value().filter(d => d.type === 'public' && d.writelist.find(u => u === myUUID))
        setImmediate(() => this.updateState(path, currentDir, list))
      }
    }

    /* create new folder */
    this.createNewFolder = () => {
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
          this.setState({ errorText: i18n.__('Mkdir Failed') })
        } else {
          const node = data.find(entry => entry.name === this.state.newFoldName).data
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
        this.setState({ newFoldName, errorText: i18n.__('Name Exist Error') })
      } else if (newFoldName !== newValue) {
        this.setState({ newFoldName, errorText: i18n.__('Name Invalid Error') })
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
      const type = this.props.type === 'copy' ? i18n.__('Copy') : this.props.type === 'move' ? i18n.__('Move') : i18n.__('Share')
      if (error) {
        this.setState({ loading: false })
        this.closeDialog()
        this.props.refresh()
        return this.props.openSnackBar(type.concat(i18n.__('+Failed')))
      }
      this.getTaskState(data.uuid).asCallback((err) => {
        if (err) {
          this.setState({ loading: false })
          this.closeDialog()
          this.props.refresh()
          return this.props.openSnackBar(type.concat(i18n.__('+Failed')))
        }
        this.setState({ loading: false })
        this.closeDialog()
        this.props.refresh()
        return this.props.openSnackBar(type.concat(i18n.__('+Success')))
      })
    }

    /* request task state */
    this.getTaskState = async (uuid) => {
      const res = await this.props.apis.pureRequestAsync('task', { uuid })
      const data = this.props.apis.stationID ? res.body.data : res.body
      if (!data.isStopped) {
        await this.sleep(500)
        await this.getTaskState(uuid)
      }
      return data
    }

    /* close dialog */
    this.closeDialog = () => this.props.onRequestClose()

    /** apis and other funcs * */
    /* sort file list */
    this.sort = data => [...data.entries].sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'directory') return 1
      return a.name.localeCompare(b.name)
    })

    this.sleep = time => new Promise(resolve => setTimeout(resolve, time))

    /* get file list */
    this.list = async (driveUUID, dirUUID) => {
      this.setState({ loading: true })
      const res = await this.props.apis.pureRequestAsync('listNavDir', { driveUUID, dirUUID })
      const data = this.props.apis.stationID ? res.body.data : res.body
      return this.sort(data)
    }
  }

  componentWillMount() {
    if (this.props.type === 'share') this.enter({ type: 'publicRoot', name: i18n.__('Public Drive'), setRoot: true })
  }

  /* Button disabled ? */
  getButtonStatus() {
    const { name, uuid, type } = this.state.currentDir
    const selectedObj = this.state.currentSelectedIndex !== -1 ? this.state.list[this.state.currentSelectedIndex] : null
    if (this.state.loading || this.state.cnf) return true

    if (type !== 'directory' && type !== 'publicRoot' && type !== 'public' && name !== uuid) return true

    if (this.state.currentSelectedIndex !== -1) {
      if (type === 'directory') {
        if (!this.selectedArr.findIndex(item => item.uuid === selectedObj.uuid) === -1) {
          return true
        }
      }
      if (selectedObj.uuid === this.directory.uuid) return true

    } else if (type === 'directory' && this.inSameDirectory()) {
      return true
    } else if (type === 'publicRoot') {
      return true
    }
    return false
  }

  getButtonText() {
    const type = this.props.type === 'copy' ? i18n.__('Copy') : this.props.type === 'move' ? i18n.__('Move') : i18n.__('Share')
    if (this.state.currentSelectedIndex !== -1 || this.directory.uuid === this.state.currentDir.uuid) {
      return i18n.__('%s To Selected Folder', type)
    }
    return i18n.__('%s To Current Folder', type)
  }

  inSameDirectory() {
    return this.state.currentDir.uuid === this.directory.uuid
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

  isRowDisable(node) {
    const type = node.type
    if (type === 'file') {
      return true
    } else if (node.type === 'directory') {
      if (this.inSameDirectory()) {
        if (this.selectedArr.findIndex(item => item.uuid === node.uuid) === -1) return false
        return true
      }
      return false
    }
    return false
  }

  renderCurrentDir() {
    const type = this.state.currentDir.type
    return this.state.currentDir.name === this.state.currentDir.uuid
      ? i18n.__('Home Title')
      : type === 'publicRoot'
        ? i18n.__('Public Drive')
        : type === 'root'
          ? i18n.__('Box Title')
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
                  i18n.__('Create New Folder in %s', this.state.currentSelectedIndex > -1 ?
                  this.state.list[this.state.currentSelectedIndex].name : this.renderCurrentDir())
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
                  ? <div
                    style={{
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column' }}
                  >
                    <div> { i18n.__('No Public Drive') } </div>
                    {
                      this.props.apis.account && this.props.apis.account.data && this.props.apis.account.data.isAdmin &&
                        <FlatButton
                          label={i18n.__('Jump to Create')}
                          primary
                          onTouchTap={() => { this.closeDialog; this.props.navTo('adminDrives') }}
                        />
                    }
                    </div>
                  : <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    { i18n.__('Empty Folder Text') }
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
                tooltip={i18n.__('Create New Folder')}
                tooltipPosition="top-center"
                style={{ marginRight: 16 }}
                onTouchTap={() => this.setState({ cnf: true })}
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
