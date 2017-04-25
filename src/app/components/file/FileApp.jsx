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

// import keypress from '../common/keypress.js'
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

//import file module
import FileTable from './FileTable'
import FileUploadButton from './FileUploadButton'
import TransmissionContainer from './TransmissionContainer'
import Detail from './Detail'

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

const DETAIL_WIDTH = 300
const LEFTNAV_WIDTH = 210

///////////////////////////////////////////////////////////////////////////////

import { DialogInput, DialogConfirm } from '../common/Dialogs'

//import model
import FileModel from './FileModel'

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
    this.fileModel = null
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

      clientX: 0,
      clientY: 0,
      contextMenu: false,

      createNewFolder: false,
      deleteConfirm: false,
      importDialog: null,

      fileModel: null
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
    		folders: !!folders.length?folders:[],
    		files: !!files.length?files:[]
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



    this.toggleLeftNav = () => assign({ leftNav: !this.state.leftNav })



    this.drop = e => {
      if (window.store.getState().login.state !== "LOGGEDIN") return
      if (this.state.navContext !== 'HOME_DRIVE') return
      let files = []
      for(let item of e.dataTransfer.files) {
        files.push(item.path)
      }
      command('fileapp','DRAG_FILE',{files,dirUUID:this.state.directory.uuid})
    }
  }

  componentDidMount() {
    document.addEventListener('drop', this.drop)

    setImmediate(() =>
    	command('fileapp', 'FILE_NAV', { context: 'HOME_DRIVE' }, (err, data) => {
        if (err) return // todo
        	this.navUpdate('HOME_DRIVE', data)
      }))

    this.fileModel = new FileModel('HOME_DRIVE')
  }

  componentWillUnmount() {
    document.removeEventListener('drop', this.drop)
  }

  renderBreadCrumb(){
    let list = []
    let _this = this
    if (!this.state.path) return null
    if (this.state.navContext=='SHARED_WITH_ME' || this.state.navContext=='SHARED_WITH_OTHERS') {
      let name = this.state.navContext=='SHARED_WITH_ME'?'分享给我的文件':'我分享的文件'
      list.push(
        <span 
        key={name}
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
        style={{opacity:this.state.path.length>0?0.7:1}}>
          {name}
        </span>
        )
      if (this.state.path.length !== 0) {
        list.push(<NavigationChevronRight key='chevron-share' style={{fill:'rgba(255,255,255,.7)'}}/>)
      }
    }
    this.state.path.forEach((node, index, arr) => {
      let name = index === 0 && this.state.navContext=='HOME_DRIVE'? '我的文件' :  node.name
      if (arr.length>3) {
        if (index == 1) {
          list.push(
            <div key={'ellipsis' + node.uuid}>...</div>
            )
          list.push(<NavigationChevronRight key={'chevron-ellipsis' + node.uuid} style={{fill:'rgba(255,255,255,.7)'}}/>)
          return
        }else if (index > 1 && index <arr.length -2) {
          return
        }
      }
      list.push(
        <span
          key={node.uuid}
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
        list.push(<NavigationChevronRight key={'chevron' + node.uuid} style={{fill:'rgba(255,255,255,.7)'}}/>)
    })

    return list
  }

  renderListView() {
    if (this.state.navContext == 'DOWNLOAD') {
      return <TransmissionContainer key='download' type='download'/>
    }

    if (this.state.navContext == 'UPLOAD') {
      return <TransmissionContainer key='upload' type='upload'/>
    }

    if (!this.state.list) return null

    return (
      <div style={{position:'relative',overflow:'auto',height:'100%'}}>
        {/*table*/}
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
  }

  // context
  // data : {
  //   children: []
  //   path: [], 1..n -> path[0] root, path[last] current directory
  // }

  // context will be (HOME_DRIVE/SHARED_WITH_OTHERS/SHARED_WITH_ME/UPLOAD/DOWNLOAD)
  // update state 
  navUpdate(context, data) {
    //sort list (transmission data will be null)
    let sortedList = data.children.map(item => Object.assign({}, item, {
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

    let state = {
      navContext: context,
      directory: data.path.length>1?data.path[data.path.length - 1]:data.path[data.path.length - 1],
      path: data.path,
      list: sortedList
    }
    if ((context === 'SHARED_WITH_ME' || context === 'SHARED_WITH_OTHERS') ) {
      this.setState(state)
      this.refs.FileTable.setList(sortedList)
    }else if (context === 'HOME_DRIVE') {
      Object.assign(state, {navRoot: data.path[0]})  
      this.setState(state)
      this.refs.FileTable.setList(sortedList)
    }else {
      this.setState(state)
    }
  }
  //will command request to server && update when callback trigger
  leftNavSelect(context) {
    command('fileapp', 'FILE_NAV', { context }, (err, data) => {
      if (err) return
      this.navUpdate(context, data)
    })
  }

  rowDoubleClick(uuid, e) {
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

  importOldFile() {
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
  }

  render() {

    return (
    <div style={this.props && this.props.style} >
      <div style={{ height: '100%', backgroundColor:'blue', display: 'flex', justifyContent: 'space-between' }}>

      	{/*file app container*/}
        <div id='layout-middle-container'
          style={{
            position: 'absolute',
            backgroundColor: 'red',
            width: this.state.detailOn ? `calc(100% - ${DETAIL_WIDTH}px)` : '100%',
            transition: sharpCurve('width'),
            height:'100%'
          }}>
          {/* important ! */}
          <Divider />
          {/*tool bar*/}
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
          {/*left navigation && content*/}
          <div id='layout-middle-container-lower' style={{
            width: '100%',
            height: 'calc(100% - 56px)',
            backgroundColor: '#EEEEEE',
            marginTop: '56px',
            display:'flex'}}>
          	{/*left navigation*/}
            <div style={{
              position: 'absolute',
              width: LEFTNAV_WIDTH,
              height: '100%',
              left: this.state.leftNav ? 0 : -LEFTNAV_WIDTH,
              transition: sharpCurve('left')}}>
              <Menu autoWidth={false} listStyle={{width: LEFTNAV_WIDTH}}>
                <MenuItem style={{fontSize: 14}} primaryText='我的文件' leftIcon={<DeviceStorage />}
                	onTouchTap = {this.leftNavSelect.bind(this, 'HOME_DRIVE')}
                />
                <MenuItem style={{fontSize: 14}} primaryText='我分享的文件' leftIcon={<SocialShare />}
                  onTouchTap={this.leftNavSelect.bind(this, 'SHARED_WITH_OTHERS')}
                />
                <Divider />
                <MenuItem style={{fontSize: 14}} primaryText='分享给我文件' leftIcon={<SocialPeople />} 
                	onTouchTap={this.leftNavSelect.bind(this, 'SHARED_WITH_ME')}
                />
                <Divider />
                <MenuItem style={{fontSize: 14}} primaryText='上传任务' leftIcon={<FileFileUpload />}
                  rightIcon={window.store.getState().transmission.uploadFinish?null:svg.transmission()} 
                	onTouchTap={this.navUpdate.bind(this, 'UPLOAD', {children:[],path:[]})}
                />
                <MenuItem style={{fontSize: 14}} primaryText='下载任务' leftIcon={<FileFileDownload />}
                  rightIcon={window.store.getState().transmission.downloadFinish?null:svg.transmission()} 
                	onTouchTap={this.navUpdate.bind(this, 'DOWNLOAD', {children:[],path:[]})}
                />
                <Divider />
                <MenuItem primaryText='导入旧版本文件' leftIcon={<NavigationArrowForward />}
                  innerDivStyle={{fontSize: 14, fontWeight: 'medium', color: 'rgba(0,0,0,0.87'}}
                  onTouchTap={this.importOldFile.bind(this)}
                />
              </Menu>
            </div>
          	{/*file list*/}
            <div style={{
              // for suppressed leftNav, TODO
              marginLeft: this.state.leftNav ? LEFTNAV_WIDTH : 0,
              transition: sharpCurve('margin-left'),
              overflow: 'auto',
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
            width: DETAIL_WIDTH,
            height: '100%',
            backgroundColor: '#FAFAFA',
            position: 'absolute',
            right: this.state.detailOn ? 0 : - DETAIL_WIDTH,
            transition: sharpCurve('right'),
            borderStyle: 'solid',
            borderWidth: '0 0 0 1px',
            borderColor: '#BDBDBD'
          }}>
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

            let addr = window.store.getState().login.device.address
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
