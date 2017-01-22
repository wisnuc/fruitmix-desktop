/**
 * @component FileApp
 * @description FileApp
 * @time 2016-4-28
 * @author liuhua
 **/

import Debug from 'debug'
const debug = Debug('view:file:app')

import React from 'react'

// import css from '../../../assets/css/react-treeview.css'
// import TreeView from 'react-treeview'

import TreeTable from '../common/TreeTable'
import { DialogImportFile } from '../common/Dialogs'

import Action from '../../actions/action'
import { command } from '../../lib/command'
//seem to be not word
// import { fileNav, fileCreateNewFolder } from '../../lib/file'

import keypress from '../common/keypress.js'
import request from 'superagent'

import svg from '../../utils/SVGIcon'

import { Avatar, Popover } from 'material-ui'

import IconButton from 'material-ui/IconButton'
import ActionCheckCircle from 'material-ui/svg-icons/action/check-circle'
import ActionDone from 'material-ui/svg-icons/action/done'
import NavigationCheck from 'material-ui/svg-icons/navigation/check'
import FileFolder from 'material-ui/svg-icons/file/folder'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box'
import ToggleCheckBoxOutlineBlank from 'material-ui/svg-icons/toggle/check-box-outline-blank'
import ToggleRadioButtonUnchecked from 'material-ui/svg-icons/toggle/radio-button-unchecked'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import FileCloudCircle from 'material-ui/svg-icons/file/cloud-circle'
import FileFolderShared from 'material-ui/svg-icons/file/folder-shared'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import FileFileDownload from 'material-ui/svg-icons/file/file-download'
import SocialShare from 'material-ui/svg-icons/social/share'
import SocialPeople from 'material-ui/svg-icons/social/people'
import DeviceStorage from 'material-ui/svg-icons/device/storage'
import ActionInfo from 'material-ui/svg-icons/action/info'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import NavigationCancel from 'material-ui/svg-icons/navigation/cancel'
import NavigationArrowForward from 'material-ui/svg-icons/navigation/arrow-forward'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'

import { Divider, Paper, Menu, MenuItem, Dialog,
  FlatButton, TextField, Checkbox, CircularProgress } from 'material-ui'

import { sharpCurve, sharpCurveDuration, sharpCurveDelay } from '../common/motion'

import { blue500, red500, greenA200 } from 'material-ui/styles/colors'
//import file module
import FileTable from './FileTable'
import FileUploadButton from './FileUploadButton'
import Upload from './Upload'
import Download from './Download'
import Detail from './Detail'

const LEFTNAV_WIDTH = 210

const isLeftClick = e => e.nativeEvent.button === 0
const isRightClick = e => e.nativeEvent.button === 2

const COLOR_WHITE = '#FFF'
const COLOR_LIGHT_GRAY = '#DFD'
const COLOR_DARK_GRAY = '#BFB'
const COLOR_BLACK = '#3F51B5'

const FONT_BLACK = '#000'
const FONT_WHITE = '#FFF'
const FONT_DARKOP1 = '84%'
const FONT_DARKOP2 = '55%'
const FONT_BRIGHTOP1 = '100%'
const FONT_BRIGHTOP2 = '70%'

///////////////////////////////////////////////////////////////////////////////

import { DialogInput, DialogConfirm } from '../common/Dialogs'

const secondaryColor = '#FF4081'

const formatTime = (mtime) => {
  if (!mtime) {
    return null
  }

  let time = new Date()
  time.setTime(parseInt(mtime))
  return time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
}

const formatSize = (size) => {

  if (!size) return null

  size = parseFloat(size)
  if (size < 1024)
    return size.toFixed(2)+' B'
  else if (size < 1024*1024)
    return (size/1024).toFixed(2)+' KB'
  else if(size<1024*1024*1024)
    return (size/1024/1024).toFixed(2)+ ' M'
  else
    return (size/1024/1024/1024).toFixed(2)+ ' G'
}

const rowColor = (props, state) => {

  if ((props.shift && props.range) || state.hover)
    return '#EEEEEE'
  else if (props.selected)
    return '#F5F5F5'
  else
    return  '#FFFFFF'
}

const rowLeading = (props, state) => {

  if (props.shift)
    if (props.range)
      return 'fullOn'
    else if (state.hover)
      return 'activeHint'
    else
      return 'none'
  else if (props.ctrl)
    if (props.specified)
      return 'activeHint'
  //  else if (state.hover)
  //    return 'inactiveHint'
    else
      return 'none'
  else
    return props.specified ? 'inactiveHint' : 'none'
}

const rowCheck = (props, state) => {

  if (props.shift) {

    if (props.selected)
      return 'checked'
    else if (props.range || state.hover)
      return 'checking'
    else
      return 'none'
  }
  else if (props.ctrl) {
    if (props.selected)
      return 'checked'
    else if (state.hover)
      return 'checking'
    else
      return 'none'
  }
  else {
    if (props.multi && props.selected)
      return 'checked'
    else
      return 'none'
  }
}

const rowEditing = (props, state) => {
  return props.editing
}

// props must has ctrl & shift
class FileTableRow extends React.Component {

  constructor(props) {
    super(props)
    this.state = { hover: false } // TODO
  }

  componentWillReceiveProps(nextProps) {
    this.setState(state => {
      let nextState = {}
      nextState.hover = state.hover
      nextState.rowColor = rowColor(nextProps, state)
      nextState.rowLeading = rowLeading(nextProps, state)
      nextState.rowCheck = rowCheck(nextProps, state)
      nextState.rowEditing = rowEditing(nextProps, state)
      return nextState
    })
  }

  shouldComponentUpdate(nextProps, nextState) {

    if (nextState.color === this.state.rowColor &&
        nextState.leading === this.state.rowLeading &&
        nextState.check === this.state.rowCheck &&
        nextState.editing === this.state.rowEditing)
      return false
    return true
  }

  render() {

    let { index, item, onMouseEnter, onMouseLeave, onClick, onDoubleClick, onRightClick } = this.props

    let style = {
      row: {
        width: '100%',
        flex: '0 0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: this.state.rowColor,
        color: '#000',
        opacity: 0.87
      },

      time: {
        flex: '0 0 160px',
        fontSize: 13,
        opacity: 0.54,
        textAlign: 'right',
      },

      size: {
        flex: '0 0 160px',
        fontSize: 13,
        opacity: 0.54,
        textAlign: 'right',
        marginRight: 24
      },
    }

    const renderLeading = () => {

      let height = '100%', backgroundColor = '#FFF', opacity = 0

      switch(this.state.rowLeading) {
      case 'inactiveHint':
        height = 20
        backgroundColor = '#000'
        opacity = 0.26
        break
      case 'activeHint':
        height = 20
        backgroundColor = secondaryColor
        opacity = 1
        break
      case 'fullOn':
        backgroundColor = secondaryColor
        opacity = 1
        break
      }

      return <div style={{ flex: '0 0 4px', height, backgroundColor, opacity, zIndex:1000 }} />
    }

  const renderCheckBox = () =>
    (this.state.rowCheck === 'checked' || this.state.rowCheck === 'unchecking') ?
      <ActionCheckCircle style={{color: secondaryColor, opacity: 1, zIndex:1000}} /> :
        this.state.rowCheck === 'checking' ? <NavigationCheck style={{color: '#000', opacity: 0.26}} /> : null

  const renderIcon = () =>
    this.props.item.type === 'folder' ?
      <FileFolder style={{color: '#000', opacity: 0.54}} /> :
        <EditorInsertDriveFile style={{color: '#000', opacity: 0.54}} />

  return (
    <div style={style.row}
      onMouseEnter = {() => {
        if (this.props.noMouseEvent) return
        onMouseEnter(index)
        this.setState(state => ({ hover: true }))
      }}
      onMouseLeave = {() => {
        if (this.props.noMouseEvent) return
        this.setState(state => ({ hover: false }))
        onMouseLeave(index)
      }}

      onClick = {e => onClick(this.props.item.uuid, e)}
      onDoubleClick = {e => onDoubleClick(this.props.item.uuid, e)}
      onTouchTap = {e => e.nativeEvent.button === 2 && onRightClick(this.props.item.uuid, e.nativeEvent)}
    >
        { renderLeading() }
      <div style={{flex: '0 0 12px'}} />
      <div style={{flex: '0 0 48px', display: 'flex', alignItems: 'center'}}>
        { renderCheckBox() }
      </div>
      <div style={{flex: '0 0 8px'}} />
      <div style={{flex: '0 0 48px', display: 'flex', alignItems: 'center'}} >
        { renderIcon() }
      </div>
      <div style={{width:'100%'}}> {
        this.props.editing ?
          <TextField
            id={this.props.item.uuid}
            defaultValue={this.props.item.name}
            fullWidth={false}
            ref={ input => { input && input.focus() }}
            onChange={this.props.editingOnChange}
            onBlur={this.props.editingOnBlur}
          /> :
          <div style={{fontSize: 14, opacity:0.87}}>{this.props.item.name}</div>
      }</div>
      <div style={style.time}>{formatTime(this.props.item.mtime)}</div>
      <div style={style.size}>{formatSize(this.props.item.size)}</div>
    </div>
  )
  }
}


class Throttler extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.render
  }

  render() {
    return <div>{this.props.children}</div>
  }
}

const toolbarStyle = {

  activeIcon: {
    color: '#000',
    opacity: 0.54
  },

  inactiveIcon: {
    color: '#000',
    opacity: 0.26
  },

  whiteIcon: {
    color: '#FFF',
    opacity: 1
  },

  hiddenIcon: {
    color: '#FFF',
    opacity: 0
  }
}

const FileToolbar = ({
  nudge,
  title,
  breadCrumb,
  suppressed,
  toggleLeftNav,
  children,
  leftNav
}) => {

  return (
    <Paper
      style={{
        position: 'absolute', width: '100%', height: 56,
        backgroundColor: '#2196F3',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}
      rounded={false}
      transitionEnabled={false}
      zDepth={suppressed ? 0 : 1}
    >
      <IconButton style={{marginLeft: 4}}
        iconStyle={toolbarStyle.activeIcon}
        onTouchTap={toggleLeftNav}
      >
        <NavigationMenu />
      </IconButton>

      <div className='breadcrumb' style={{marginLeft: leftNav?228:20, flex: '0 0 138px', fontSize: 18, whiteSpace: 'nowrap', color: '#FFF', transition:sharpCurve('all')}}>
        { breadCrumb }
      </div>

      <div style={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
        { children }
      </div>

      <div style={{width: nudge ? 56 : 0, height:48, transition: sharpCurve('width')}} />
    </Paper>
  )
}

const FileDetailToolbar = ({
  nudge,
  suppressed,
  show,
  children
}) => (

    <div
      style={{
        position: 'absolute',
        width: '100%', height: 56,
        backgroundColor: '#FAFAFA', //'#1E88E5', // '#1976D2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{flex:1, display: 'flex', justifyContent:'flex-end'}}>
        { show && children }
      </div>
      <div style={{width: nudge ? 56 : 0, height:48, transition: sharpCurve('width')}} />
    </div>
  )

class FileApp extends React.Component {

  constructor(props) {

    super(props)

    const assign = (props) => this.setState(state => Object.assign({}, state, props))

    this.inputValue = null
    this.state = {

      file: null,

      // for home_drive, navList is null, navRoot is home root uuid
      // for shared_xxxx, navList is share list, navRoot is null or current share list item
      navContext: 'HOME_DRIVE',
      // navTopList: null,
      navRoot: null,

      detailOn: false,
      leftNav: true,
      detailResizing: false,

      shift: false,
      hover: -1,    // index of row currently hovered
      editing: null,  // uuid of row currently editing

      clientX: 0,
      clientY: 0,
      contextMenu: false,

      createNewFolder: false,
      deleteConfirm: false,
      importDialog: null,
    }

    // FIXME !!!
    this.refresh = () => {
      command('fileapp', 'FILE_NAV', {
        context: this.state.navContext,
        folderUUID: this.state.directory.uuid
      }, (err, data) => {
        if (err) return // TODO
        this.navUpdate(this.state.navContext, data) // TODO
      })
    }

    this.createNewFolder = (name) => {

      if (typeof name !== 'string' || name.length === 0) return

      command('fileapp', 'FILE_CREATE_NEW_FOLDER', {
          dir: this.state.directory.uuid,
          name
        }, (err, data) => {
          if (err) return // TODO
          setImmediate(this.refresh)
        })
    }

    this.deleteSelected = () => {
      let deleteArr = this.refs.FileTable.getSelectedItem().map(item => item.uuid)
      if (deleteArr.length == 0) return
      command('fileapp', 'FILE_DELETE', {
        dir: this.state.directory.uuid,
        nodes: deleteArr
      }, (err, data) => {
        console.log('刪除 返回~~')
        setImmediate(this.refresh)
      })
    }

    // avoid binding
    this.toggleDetail = () => {
      this.setState(Object.assign({}, this.state, {
        detailResizing: true,
        detailOn: !this.state.detailOn
      }))
      setTimeout(() => this.setState(Object.assign({}, this.state, {
        detailResizing: false
      })), sharpCurveDelay)
    }

    this.showDetail = () => {

      if (this.state.detailOn) return
      debug('showDetail()')
      this.setState(state => Object.assign({}, state, {
        detailResizing: true,
        detailOn: true
      }))
      setTimeout(() => this.setState(Object.assign({}, this.state, {
        detailResizing: false
      })), sharpCurveDelay)
    }

    this.download = () => {
    	let folders = []
    	let files = []
    	this.refs.FileTable.getSelectedItem().forEach(item => {
    		if (item.type == 'folder') {
    			folders.push(item)
    		}else if (item.type == 'file') {
    			files.push(item)
    		}
    	})
    	command('fileapp', 'DOWNLOAD', {
    		folders: !!folders.length?folders:undefined,
    		files: !!files.length?files:undefined
    	}, (err) => {
    		if (err) {
    			console.log('download task error')
    		}else {
    			console.log('download task success')
    		}
    	})
    }

    this.hideContextMenu = () => {
      if (!this.state.contextMenu) return

      debug('hideContextMenu()')
      this.setState(state => Object.assign({}, state, {
        contextMenu: false
      }))
    }

    this.showCreateNewFolderDialog = () => assign({ createNewFolder: true })
    this.showRenameDialog = () => {
      let dom = this.refs.FileTable
      assign({editing: dom.list[dom.selectedIndexArr[0]]})}
    this.showDeleteConfirmDialog = () => assign({ deleteConfirm: true })

    this.renderLeftNav = () => (

      <div style={{
        width: LEFTNAV_WIDTH,
        height: '100%',
        position: 'absolute',
        left: this.state.leftNav ? 0 : -LEFTNAV_WIDTH,
        transition: sharpCurve('left'),
        zIndex: 1000 }}

        transitionEnabled={false}
        rounded={false}
        zDepth={this.state.leftNav ? 3 : 0}

        onTouchTap={e => console.log(e)}
      >
        <div style={{width: '100%', height: 56, display: 'flex', alignItems: 'center',
          backgroundColor: blue500 }}>
          <div style={{marginLeft:4, width:68}}>
            <IconButton iconStyle={{color: '#FFF'}}
              onTouchTap={() => this.setState(Object.assign({}, this.state, {
                leftNav: false
              }))}>
              <NavigationMenu />
            </IconButton>
          </div>
          <div style={{fontSize:21, fontWeight: 'medium', color: '#FFF' }}>文件</div>
        </div>
        <Menu autoWidth={false} width={LEFTNAV_WIDTH}
          onItemTouchTap={() => console.log('-------------- >>>>')}
        >
          <MenuItem primaryText='我的文件' leftIcon={<DeviceStorage />}
            innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}
            onTouchTap={() => {
              debug('left menu my files selected')
              const context = 'HOME_DRIVE'
              command('fileapp', 'FILE_NAV', { context }, (err, data) => {
                if (err) return
                this.navUpdate(context, data)
              })
            }}
          />
          <MenuItem
            key='leftnav-shared-with-others'
            id='leftnav-shared-with-others'
            primaryText='我分享的文件' leftIcon={<SocialShare />}
            innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}
            onTouchTap={() => {

              debug('Left menu sharedWithOthers selected')
              const context = 'SHARED_WITH_OTHERS'
              command('fileapp', 'FILE_NAV', { context }, (err, data) => {
                if (err) return
                setImmediate(() => this.navUpdate(context, data))
              })
            }}
          />
          <Divider />
          <MenuItem primaryText='分享给我的文件' leftIcon={<SocialPeople />}
            innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}
          />
          <Divider />
          <MenuItem primaryText='上传任务' leftIcon={<FileFileUpload />}
            innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}
          />
          <MenuItem primaryText='下载任务' leftIcon={<FileFileDownload />}
            innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}
          />
        </Menu>
      </div>
    )

    this.toggleLeftNav = () => assign({ leftNav: !this.state.leftNav })

    this.rowEditingOnBlur = () => {
      this.inputValue = null
      assign({ editing: null })
    }

    this.rowEditingOnChange = e => {
      this.inputValue = e.target.value
    }

    this.rowMouseLeave = index => {
      return this.setState(state =>
        Object.assign({}, state, { hover: -1 }))
    }

    this.rowMouseEnter = index => {
      return this.setState(state =>
        Object.assign({}, state, { hover: index }))
    }

    this.drop = e => {
      if (window.store.getState().login.state !== "LOGGEDIN") return
      if (this.state.navContext !== 'HOME_DRIVE') return
      let files = []
      for(let item of e.dataTransfer.files) {
        files.push(item.path)
      }
      command('fileapp','DRAG_FILE',{files,dirUUID:this.state.directory.uuid})
    }


    this.rowClickBound = this.rowClick.bind(this)
    this.rowDoubleClickBound = this.rowDoubleClick.bind(this)
    this.rowRightClickBound = this.rowRightClick.bind(this)

    this.keypress = null
    this.unsubscribe = null

    debug('constructed')
  }

  componentDidMount() {

    document.addEventListener('drop', this.drop)

   //  // create keypress listener
   //  this.keypress = new keypress.Listener()

   //  // listen window keydown keyup event
   //  window.addEventListener('keydown', this.keypress)
   //  window.addEventListener('keyup', this.keypress)

   //  // register ctrl
   //  this.keypress.register_combo({
   //    "keys"              : "ctrl",
   //    "on_keydown"        : this.handleCtrlDown,
   //    "on_keyup"          : this.handleCtrlUp,
   //    "on_release"        : null,
   //    "this"              : this,
   //    "prevent_default"   : true,
   //    "prevent_repeat"    : true,
   //    "is_unordered"      : false,
   //    "is_counting"       : false,
   //    "is_exclusive"      : false,
   //    "is_solitary"       : false,
   //    "is_sequence"       : false
   //  })

   //  // register shift
   //  this.keypress.register_combo({
   //    "keys"              : "shift",
   //    "on_keydown"        : this.handleShiftDown,
   //    "on_keyup"          : this.handleShiftUp,
   //    "on_release"        : null,
   //    "this"              : this,
   //    "prevent_default"   : true,
   //    "prevent_repeat"    : true,
   //    "is_unordered"      : false,
   //    "is_counting"       : false,
   //    "is_exclusive"      : false,
   //    "is_solitary"       : false,
   //    "is_sequence"       : false
   //  })

   //  this.keypress.register_combo({
   //    "keys"              : "enter",
   //    "on_keydown"        : this.enterKeyDown,
   //    "on_keyup"          : null,
   //    "on_release"        : null,
   //    "this"              : this,
   //    "prevent_default"   : true,
   //    "prevent_repeat"    : true,
   //    "is_unordered"      : false,
   //    "is_counting"       : false,
   //    "is_exclusive"      : false,
   //    "is_solitary"       : false,
   //    "is_sequence"       : false
   // })

    setImmediate(() =>
    	command('fileapp', 'FILE_NAV', { context: 'HOME_DRIVE' }, (err, data) => {
        if (err) return // todo
        	this.navUpdate('HOME_DRIVE', data)
      }))
  }

  componentWillUnmount() {

    // clean up keypress
    // this.keypress.reset()
    // this.keypress.stop_listening()
    // this.keypress.destroy()
    // this.keypress = null

    // remove listener
    // window.removeEventListener('keydown', this.keypress, false)
    // window.removeEventListener('keyup', this.keypress, false)
    document.removeEventListener('drop', this.drop)
  }

  // context
  // data : {
  //   children: []
  //   path: [], 1..n -> path[0] root, path[last] current directory
  // }

  // context share
  // 1, same as HOME_DRIVE
  // 2.
  navUpdate(context, data) {
    debug('navUpdate', context, data)

    let sortedList = data.children.map(item => Object.assign({}, item, {
      specified: false,
      selected: false,
      mtime:formatTime(item.mtime),
      size:item.size,
      conversionSize:formatSize(item.size),
      name:item.name?item.name:item.uuid
    })).sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }else {
        return a.name.localeCompare(b.name) 
      }
    })

    if ((context === 'SHARED_WITH_ME' || context === 'SHARED_WITH_OTHERS') ) {
      // virtual list
      let state = {
        navContext: context,
        // navList: null,
        // navRoot: null,

        directory: data.path.length>1?data.path[data.path.length - 1]:null,
        path: data.path,

        specified: -1,

        list: sortedList
      }

      this.setState(state)
      debug('navUpdate, shared virtual root directory', state)
      this.refs.FileTable.setList(sortedList)
      return
    }

    let state = {

      navContext: context,
      // navList: null,
      navRoot: data.path[0],

      // the last one
      directory: data.path[data.path.length - 1],
      path: data.path,

      specified: -1,

      list: sortedList
    }
    this.setState(state)
    this.refs.FileTable.setList(sortedList)
    debug('navUpdate changed state', state)
  }

  handleCtrlDown() {
    debug('ctrl down')
    this.setState(Object.assign({}, this.state, { ctrl: true }))
  }

  handleCtrlUp() {
    debug('ctrl up')
    this.setState(Object.assign({}, this.state, { ctrl: false }))
  }

  handleShiftDown() {
    debug('shift down')
    this.setState(Object.assign({}, this.state, { shift: true }))
  }

  handleShiftUp() {
    debug('shift up')
    this.setState(Object.assign({}, this.state, { shift: false }))
  }

  enterKeyDown() {

    if (this.state.editing) {

      debug('enter down, editing', this.inputValue)

      let uuid = this.state.editing
      let item = this.state.list.find(item => item.uuid === uuid)
      let oldName = item.name
      let newName = this.inputValue

      this.inputValue = null
      this.setState(state => Object.assign({}, state, { editing: null }))

      if (oldName === newName) return

      command('fileapp', 'FILE_RENAME', {
        dir: this.state.directory.uuid,
        node: uuid,
        name: newName
      }, (err, data) => this.refresh())
    }
    else if (this.state.createNewFolder) {
      // TODO
    }
  }

  rowShiftClick(uuid, e) {

    let list, nextState
    let begin = this.state.list.findIndex(item => item.specified)
    if (begin !== -1) { // specified
      let end = this.state.list.findIndex(item => item.uuid === uuid)

      if (begin === end) // user unspecify
        list = [
          ...this.state.list.slice(0, begin),
          Object.assign({}, this.state.list[begin], { specified: false }),
          ...this.state.list.slice(begin + 1)
        ]
      else
        list = this.state.list.map((item, index, arr) => {
          if ((index >= begin && index <= end) || (index <=begin && index >= end)) {
            if (item.specified)
              return Object.assign({}, item, { specified: false, selected: true })
            if (!item.selected)
              return Object.assign({}, item, { selected: true })
          }
          return item
        })
    }
    else { // not specified
      list = this.state.list.map(item => {
        if (item.uuid === uuid)
          return Object.assign({}, item, { specified: true, selected: true })
        else
          return item
      })
    }
    nextState = Object.assign({}, this.state, { list, ctrl: e.ctrlKey, shift: e.shiftKey })
    return this.setState(nextState)
  }

  rowCtrlClick(uuid, e) {

    let list, nextState
    list = this.state.list.map(item => {
      if (item.uuid === uuid) // target, toggle selected, set specified the same with selected !!!
        return Object.assign({}, item, { specified: !item.selected, selected: !item.selected })
      else if (item.specified) // non-target
        return Object.assign({}, item, { specified: false })
      else
        return item
    })

    nextState = Object.assign({}, this.state, { list })
    this.setState(nextState)
  }

  rowJustClick(uuid, e) {

    let list, nextState
    // normal: set target exclusively specified, set target exclusively selected
    list = this.state.list.map(item => {
      if (item.uuid === uuid) {  // target
        if (item.selected && item.specified)
          return item
        else
          return Object.assign({}, item, { specified: true, selected: true })
      }
      else { // not target
        if (item.selected || item.specified)
          return Object.assign({}, item, { specified: false, selected: false })
        else
          return item
      }
    })

    nextState = Object.assign({}, this.state, { list, ctrl: e.ctrlKey, shift: e.shiftKey })
    this.setState(nextState)
  }

  // mutate item, return new list
  rowClick(uuid, e) {

    // debug('row click', uuid, e, e.ctrlKey, e.shiftKey)
    if (e.shiftKey)
      return this.rowShiftClick(uuid, e)
    else if (e.ctrlKey === true)
      return this.rowCtrlClick(uuid, e)
    else
      return this.rowJustClick(uuid, e)
  }

  rowDoubleClick(uuid, e) {
  	// console.log('enter double click enent -----------')
  	// console.log('current path is :' )
  	// console.log( this.state.path)
  	// console.log('current state is : ' )
  	// console.log(this.state.navRoot)
    let item = this.state.list.find(i => i.uuid === uuid)
    let navContext = this.state.navContext
    let rUUID
    if (!item) return
    if (item.type !== 'folder') return
    if (navContext == 'HOME_DRIVE') {
    	rUUID = null
    }else if (navContext == 'SHARED_WITH_OTHERS' || navContext == 'SHARED_WITH_ME') {
    	if (this.state.path.length == 0) {
    		rUUID = item.uuid
    		this.state.navRoot = item
    	}else {
    		rUUID = this.state.navRoot.uuid
    	}
    }
    command('fileapp', 'FILE_NAV', { context: this.state.navContext, folderUUID: uuid, rootUUID:rUUID }, (err, data) => {
      if (err) return // todo
      this.navUpdate(this.state.navContext, data)
    })
  }

  rowRightClick(uuid, e) {

    // e is native event
    debug('row right click', uuid, e.ctrlKey, e.shiftKey, e.clientX, e.clientY)

    if (e.shiftKey) {
      let specified = this.state.list.findIndex(item => item.specified)
      if (specified !== -1) {
        let list = [
          ...this.state.list.slice(0, specified),
          Object.assign({}, this.state.list[specified], { specified: false }),
          ...this.state.list.slice(specified + 1)
        ]

        let nextState = Object.assign({}, this.state, { list, ctrl: e.ctrlKey, shift: e.shiftKey })
        return this.setState(nextState)
      }
      else {
        // similar with rowCtrlClick but not changing specified
        let list, nextState
        list = this.state.list.map(item => {
          if (item.uuid === uuid) // target, toggle selected, set specified the same with selected !!!
            return Object.assign({}, item, { selected: !item.selected })
          else
            return item
        })

        nextState = Object.assign({}, this.state, { list })
        return this.setState(nextState)
      }
    }
    else if (e.ctrlKey) {
      this.rowCtrlClick(uuid, e)
    }
    else {
    	let containerDom = document.getElementById('fileListContainer')
    	let maxLeft = containerDom.offsetLeft +  containerDom.clientWidth - 112
    	let x = e.clientX>maxLeft?maxLeft:e.clientX
    	let maxTop = containerDom.offsetTop + containerDom.offsetHeight -352
    	let y = e.clientY>maxTop?maxTop:e.clientY
    	console.log(maxTop)
    	console.log(e.clientY)
      // multi-selected, just context menu
      if (this.state.list.filter(item => item.selected).length > 1) {

        this.setState(state =>
          Object.assign({}, state, {
            clientX: x,
            clientY: y,
            contextMenu: true
          }))
      }
      else { // only one or none selected, act as left click then context menu
        this.rowJustClick(uuid, e)
        // use function version of setState
        this.setState(state =>
          Object.assign({}, state, {
            clientX: x,
            clientY: y,
            contextMenu: true
          }))
      }
    }
  }

	renderBreadCrumb(){
		let list = []
		let _this = this
		if (!this.state.path) return null
		if (this.state.navContext=='SHARED_WITH_ME' || this.state.navContext=='SHARED_WITH_OTHERS') {
			let name = this.state.navContext=='SHARED_WITH_ME'?'分享给我的文件':'我分享的文件'
			list.push(
				<span 
				onTouchTap={()=> {
					_this.state.navRoot = null
					command('FileApp','FILE_NAV',{context:_this.state.navContext},(err,data) => {
						if (err) {
							return
						}
						this.navUpdate(_this.state.navContext, data)
					})
				}}
				title={name}
				style={{
					opacity:this.state.path.length>0?0.7:1
				}}
				>
				{name}
				</span>
				)
			if (this.state.path.length !== 0) {
				list.push(<NavigationChevronRight style={{fill:'rgba(255,255,255,.7)'}}/>)
			}
		}
		this.state.path.forEach((node, index, arr) => {
			let name = index === 0 && this.state.navContext=='HOME_DRIVE'? '我的文件' :  node.name
			if (arr.length>3) {
				if (index == 1) {
					list.push(
						<div>...</div>
						)
					list.push(<NavigationChevronRight style={{fill:'rgba(255,255,255,.7)'}}/>)
					return
				}else if (index > 1 && index <arr.length -2) {
					return
				}
			}
			list.push(
				<span
					title={name}
					style={{
						fontWeight: 'medium',
						color: '#FFF',
						opacity: index === arr.length - 1 ? 1 : 0.7
					}}

					onTouchTap={() => {
						command('fileapp', 'FILE_NAV', {
							context: this.state.navContext,
							folderUUID: node.uuid,
							rootUUID:this.state.navRoot.uuid
						}, (err, data) => {
	              if (err) return // todo
	              	this.navUpdate(_this.state.navContext, data)
	          		}
	          			)
					}}
				>
				{name}
				</span>
				)

			if (index !== arr.length - 1)
				list.push(<NavigationChevronRight style={{fill:'rgba(255,255,255,.7)'}}/>)
		})

		return list
	}

  renderList() {

    let specified, multi, min, max, hover
    let { ctrl, shift, list, editing } = this.state

    specified = this.state.list.findIndex(item => item.specified)
    hover = this.state.hover

    if (specified !== -1 && hover !== -1) {
      min = Math.min(specified, hover)
      max = Math.max(specified, hover)
    }

    multi = this.state.list.filter(item => item.selected).length > 1

    let selecting = ctrl || shift

    return this.state.list.map((item, index) => (

      <FileTableRow
        key={item.uuid}
        item={item}
        index={index}
        ctrl = {this.state.ctrl}
        shift = {this.state.shift}
        specified = {item.specified}
        selected={item.selected}
        editing={item.uuid === editing}
        multi={multi}
        range={(specified !== -1 && hover !== -1 && index >= min && index <= max)}
        noMouseEvent={!!editing}
        editingOnChange={this.rowEditingOnChange}
        editingOnBlur={this.rowEditingOnBlur}
        onMouseEnter={this.rowMouseEnter}
        onMouseLeave={this.rowMouseLeave}
        onClick={this.rowClickBound}
        onDoubleClick={this.rowDoubleClickBound}
        onRightClick={this.rowRightClickBound}
      />))
  }

	renderListView() {
		if (this.state.navContext == 'DOWNLOAD') {
			return <Download/>
		}

		if (this.state.navContext == 'UPLOAD') {
			return <Upload/>
		}

    if (!this.state.list) return null

    return (
      <div style={{position:'relative',overflow:'auto',height:'100%'}}>
        <FileTable ref='FileTable' parent={this}/>
        {/*upload button*/}
        <FileUploadButton path={this.state.path} style={{position: 'absolute', right:48, bottom:48}} />
        {/*right click menu*/}
        { this.state.contextMenu && this.state.navContext == 'HOME_DRIVE' && (
          <div
            style={{position: 'fixed', top: 0, left: 0, width:'100%', height:'100%', zIndex:2000}}
            onTouchTap={() => this.hideContextMenu()}
          >
            <Paper style={{
              position: 'fixed',
              top: this.state.clientY,
              left: this.state.clientX,
              backgroundColor: '#F5F5F5'
            }}>
              <Menu>
                <MenuItem primaryText='新建文件夹' onTouchTap={this.showCreateNewFolderDialog}/>
                <MenuItem primaryText='重命名' disabled={this.refs.FileTable.selectedIndexArr.length!==1} onTouchTap={this.showRenameDialog.bind(this)}/>
                <MenuItem primaryText='移动' disabled={true}/>
                <MenuItem primaryText='分享' onTouchTap={this.showDetail}/>
                <MenuItem primaryText='下载' onTouchTap={this.download}/>
                <MenuItem primaryText='删除' onTouchTap={this.showDeleteConfirmDialog} />
                <MenuItem primaryText='详情' onTouchTap={this.showDetail} />
              </Menu>
            </Paper>
          </div>
        )}
      </div>
      )

		return (
      <div style={{ width: '100%', height: '100%', backgroundColor:'#EEE' }}>
      	{/*file table title*/}
        <div style={{width: '100%', height:40, backgroundColor:'#FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{flex: '0 0 120px'}} />
          <div style={{flex: 1, fontSize: 14, fontWeight: 'bold', opacity: 0.54}}>文件名称</div>
          <div style={{flex: '0 0 160px', fontSize: 14, opacity: 0.54, textAlign: 'right'}}>时间</div>
          <div style={{flex: '0 0 160px', fontSize: 14, opacity: 0.54, textAlign: 'right', marginRight: 24 + 16 /* 16 supposed to be scrollbar width */ }}>大小</div>
        </div>
        <Divider style={{marginLeft: 120}} />
      	{/*file table*/}
        <div style={{width: '100%', height: 'calc(100% - 40px)', overflowY: 'scroll', backgroundColor: '#FFF', display: 'flex', flexDirection: 'column'}}>
          { this.renderList() }
          <div style={{flex:'1 0 96px', backgroundColor: '#FFF'}}
            onTouchTap={() => {
              console.log('hello world')
            }}
          />
        </div>
      	{/*upload button*/}
        <FileUploadButton path={this.state.path} style={{position: 'absolute', right:48, bottom:48}} />
      	{/*right click menu*/}
        { this.state.contextMenu && (
          <div
            style={{position: 'fixed', top: 0, left: 0, width:'100%', height:'100%', zIndex:2000}}
            onTouchTap={() => this.hideContextMenu()}
          >
            <Paper style={{
              position: 'fixed',
              top: this.state.clientY,
              left: this.state.clientX,
              backgroundColor: '#F5F5F5'
            }}>
              <Menu>
                <MenuItem primaryText='新建文件夹' onTouchTap={this.showCreateNewFolderDialog}/>
                <MenuItem primaryText='重命名' onTouchTap={() => {
                  let select = this.state.list.filter(item => item.selected)
                  if (select.length === 1) {
                    this.inputValue = select[0].name
                    debug(this.inputValue)
                    this.setState(state => Object.assign({}, state, { editing: select[0].uuid }))
                  }
                }}/>
                <MenuItem primaryText='移动' disabled={true}/>
                <MenuItem primaryText='分享' />
                <MenuItem primaryText='下载' onTouchTap={this.download}/>
                <MenuItem primaryText='删除' onTouchTap={this.showDeleteConfirmDialog} />
                <MenuItem primaryText='详情' onTouchTap={this.showDetail} />
              </Menu>
            </Paper>
          </div>
        )}
      </div>
		)
	}

	getSelectedList() {
		if (!this.state.list) {
			return []
		}
		return this.state.list.filter(item => item.selected)
	}

	getDirectory() {
		if (!this.state.list) {
			return {}
		}
		return this.state.directory
	}

  render() {
  	// console.log('run render ------------------')
  	// console.log(this.state)
    const detailWidth = 300
    // debug('fileapp render')

    return (
    <div style={this.props && this.props.style} >
      <div style={{ height: '100%', backgroundColor:'blue', display: 'flex', justifyContent: 'space-between' }}>

      	{/*left file app container*/}
        <div id='layout-middle-container'
          style={{
            position: 'absolute',
            backgroundColor: 'red',
            width: this.state.detailOn ? `calc(100% - ${detailWidth}px)` : '100%',
            transition: sharpCurve('width'),
            height:'100%'
          }}>
          {/* important ! */}
          <Divider />

          <FileToolbar
            nudge={this.props.nudge && !this.state.detailOn}
            title='文件'
            breadCrumb={this.renderBreadCrumb()}
            suppressed={true || !this.props.maximized}
            toggleLeftNav={this.toggleLeftNav}
            leftNav={this.state.leftNav}>
            {this.state.navContext=='HOME_DRIVE' && <IconButton iconStyle={toolbarStyle.activeIcon}
              onTouchTap={() => this.setState(Object.assign({}, this.state, {
                createNewFolder: true
              }))}
            >
              <FileCreateNewFolder />
            </IconButton>}

            <IconButton
              iconStyle={ this.state.detailOn ? toolbarStyle.whiteIcon : toolbarStyle.activeIcon }
              onTouchTap={this.toggleDetail}
            >
              <ActionInfo />
            </IconButton>
          </FileToolbar>

          <div id='layout-middle-container-spacer' style={{height: 56}} />

          <div id='layout-middle-container-lower' style={{
            width: '100%',
            height: 'calc(100% - 56px)',
            backgroundColor: '#EEEEEE',
            display:'flex'}}>
          	{/*left navigation*/}
            <div style={{
              position: 'absolute',
              width: LEFTNAV_WIDTH,
              height: '100%',
              left: this.state.leftNav ? 0 : -LEFTNAV_WIDTH,
              transition: sharpCurve('left')}}>
              <Menu autoWidth={false} listStyle={{width: LEFTNAV_WIDTH}}>
                <MenuItem style={{fontSize: 14}} primaryText='我的文件' leftIcon={<DeviceStorage />} animation={null}
                	onTouchTap = {() => {
                		setImmediate(() =>
								      command('fileapp', 'FILE_NAV', { context: 'HOME_DRIVE' }, (err, data) => {
								        if (err) return // todo
								        this.navUpdate('HOME_DRIVE', data)
								      }))
                	}}
                />
                <MenuItem
                  style={{fontSize: 14}}
                  primaryText='我分享的文件'
                  leftIcon={<SocialShare />}
                  onTouchTap={() => {
                    debug('Left menu sharedWithOthers selected')
                    const context = 'SHARED_WITH_OTHERS'
                    command('fileapp', 'FILE_NAV', { context }, (err, data) => {
                      if (err) return
                      setImmediate(() => this.navUpdate(context, data))
                    })
                  }}
                />
                <Divider />
                <MenuItem style={{fontSize: 14}} primaryText='分享给我文件' leftIcon={<SocialPeople />} 
                	onTouchTap={()=> {
                		let context = 'SHARED_WITH_ME'
                		command('fileapp', 'FILE_NAV', { context }, (err, data) => {
                      if (err) return
                      setImmediate(() => this.navUpdate(context, data))
                    })
                	}}
                />
                <Divider />
                <MenuItem style={{fontSize: 14}} primaryText='上传任务' leftIcon={<FileFileUpload />}
                  rightIcon={window.store.getState().transimission.uploadFinish?null:svg.transmission()} 
                	onTouchTap={() => {
                		this.navUpdate('UPLOAD',{children:[],path:[]})
                	}}
                />
                <MenuItem style={{fontSize: 14}} primaryText='下载任务' leftIcon={<FileFileDownload />}
                  rightIcon={window.store.getState().transimission.downloadFinish?null:svg.transmission()} 
                	onTouchTap={() => {
                		this.navUpdate('DOWNLOAD',{children:[],path:[]})
                	}}
                />
                <Divider />
                <MenuItem primaryText='导入旧版本文件' leftIcon={<NavigationArrowForward />}
                  innerDivStyle={{fontSize: 14, fontWeight: 'medium', color: 'rgba(0,0,0,0.87'}}
                  onTouchTap={() => {
                   
                    let index = window.store.getState().login.selectIndex
                    let addr = window.store.getState().login.device[index].address
                    let url = `http://${addr}:3721/winsun`

                    request
                      .get(url)
                      .set('Accept', 'application/json')
                      .end((err, res) => {
                
                        debug('winsun request', url, err || !res.ok || res.body)

                        // FIXME
                        if (err || !res.ok) return
                        this.setState(Object.assign({}, this.state, { 
                          importDialog: {
                            data: res.body
                          }
                        }))
                      })
                  }}
                />
              </Menu>
            </div>
          	{/*file list*/}
            <div style={{
              // for suppressed leftNav, TODO
              marginLeft: this.state.leftNav ? LEFTNAV_WIDTH : 0,
              transition: sharpCurve('margin-left'),

              width: '100%',
              height: '100%',
              backgroundColor: '#FAFAFA'}}
            	id='fileListContainer'>
              { this.renderListView() }
            </div>
          </div>
        </div>
      	{/*right detail container*/}
        <div
          style={{
            width: detailWidth,
            height: '100%',
            backgroundColor: '#FAFAFA',
            position: 'absolute',
            right: this.state.detailOn ? 0 : -detailWidth,
            transition: sharpCurve('right'),
            borderStyle: 'solid',
            borderWidth: '0 0 0 1px',
            borderColor: '#BDBDBD'
          }}
          rounded={false}
          transitionEnabled={false}>
          <FileDetailToolbar
            nudge={this.props.nudge}
            suppressed={false && !this.props.maximized}
            show={!this.state.detailResizing}
          >
          	<div></div>
            <IconButton
              iconStyle={toolbarStyle.activeIcon}
              onTouchTap={this.toggleDetail}
            >
              <NavigationClose />
            </IconButton>
          </FileDetailToolbar>
          <Detail ref='detail' parent={this}/>
        </div>
        {/*dialogs*/}
        <DialogInput
          title={(() => {
            if (this.state.createNewFolder)
              return '新建文件夹'
            else
              return ''
          })()}

          hint={(() => {
            if (this.state.createNewFolder)
              return '新建文件夹'
            else
              return ''
          })()}

          open={this.state.createNewFolder}

          onCancel={() => {
            this.setState(Object.assign({}, this.state, { createNewFolder: false }))
          }}

          onOK={name => {
            if (name.length == 0 ) return
            console.log(this.state.list.find(item => item.name == name))
            if (this.state.list.findIndex(item => item.name == name) != -1) return
            this.setState(Object.assign({}, this.state, { createNewFolder: false }))
            this.createNewFolder(name)
          }}
        />

        <DialogInput
          title={(() => {
            if (this.state.editing)
              return '重命名'
            else
              return ''
          })()}

          hint={(() => {
            if (this.state.editing)
              return '重命名'
            else
              return ''
          })()}

          open={!!this.state.editing}

          onCancel={() => {
            this.setState(Object.assign({}, this.state, { editing: null }))
          }}

          onOK={name => {
            this.setState(Object.assign({}, this.state, { editing: null }))
            let uuid = this.state.editing.uuid
            let oldName = this.state.editing.name
            let newName = name
            if (oldName === newName) return
            command('fileapp', 'FILE_RENAME', {
              dir: this.state.directory.uuid,
              node: uuid,
              name: newName
            }, (err, data) => {
              let newData = JSON.parse(data)
              Object.assign(newData,{size:formatSize(newData.size),mtime:formatTime(newData.mtime)})
              let dom = this.refs.FileTable
              dom.updateFileNode(newData)
              dom.forceUpdate()
            })
          }}
        />

        <DialogConfirm
          title={(() => {
            if (this.state.deleteConfirm)
              return '确认删除选中内容？'
            else
              return ''
          })()}

          open={this.state.deleteConfirm}

          onCancel={() => {
            this.setState(Object.assign({}, this.state, { deleteConfirm: false }))
          }}

          onOK={() => {
            this.setState(Object.assign({}, this.state, { deleteConfirm: false}))
            this.deleteSelected()
          }}
        />

        <DialogImportFile

          open={!!this.state.importDialog}
          data={this.state.importDialog && this.state.importDialog.data}
          columns={[
            {
              headerStyle: { 
                width: 200, 
                backgroundColor: 'blue' 
              },
              name: 'hello'
            },
            {
              headerStyle: { 
                width: 200, 
                backgroundColor: 'yellow' 
              },
              name: 'bar'
            }
          ]}

          showHeader={false}
          status={{ message: 'what' }}       

          onCancel={() => {
            this.setState(Object.assign({}, this.state, {
              importDialog: null
            }))
          }}

          onOK={select => {

            let index = window.store.getState().login.selectIndex
            let addr = window.store.getState().login.device[index].address
            let url = `http://${addr}:3721/winsun`
            let data = {
              src: select.path,
              dst: this.state.directory.uuid
            }

            request
              .post(url)
              .set('Accept', 'application/json')
              .send(data)
              .end((err, res) => {

                if (err || !res.ok) {
                  window.store.dispatch({
                    type: 'SET_SNACK',
                    open: true,
                    text: '错误：' + err ? err.message : 'Bad Response' 
                  })
                }
                else {
                  window.store.dispatch({
                    type: 'SET_SNACK',
                    open: true,
                    text: '文件导入成功！'
                  }) 
                }

                this.refresh()
                this.setState(Object.assign({}, this.state, {
                  importDialog: null
                })) 
              })
          }}
        />

      </div>
    </div>
    )
  }

  updateFileNode(node) {
    console.log(node)
  	let index = this.state.list.findIndex(item => item.uuid == node.uuid)
  	if (index !== -1) {
  		this.setState({
  			list : [...this.state.list.slice(0,index),Object.assign(node,{selected:true}),...this.state.list.slice(index+1)]
  		})
  	}
  }
}
export default FileApp
