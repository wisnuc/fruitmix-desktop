/**
 * @component FileApp
 * @description FileApp
 * @time 2016-4-28
 * @author liuhua
 **/

import Debug from 'debug'

const debug = Debug('app:file')

import React from 'react'

import { connect } from 'react-redux'
import Action from '../../actions/action'
import { command } from '../../lib/command'
import { fileNav, fileCreateNewFolder } from '../../lib/file'

import keypress from 'keypress.js'

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
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'

import { Divider, Paper, Menu, MenuItem, Dialog, 
  FlatButton, TextField, Checkbox, CircularProgress } from 'material-ui'

import { sharpCurve, sharpCurveDuration, sharpCurveDelay } from '../common/motion'

import { blue500, red500, greenA200 } from 'material-ui/styles/colors'

import FileUploadButton from './FileUploadButton'

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
  return time.getFullYear() + '/' + (time.getMonth() + 1) + '/' + time.getDay()
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

/////////////////////////////////////////////////////////////////////////////

/**
	//get table 
	getTable() {

		const listStyle = {
			height: 48,
			lineHeight:'48px'
		}

		if (this.props.state.file.view.state=='BUSY') {
			return (<div className='data-loading '><CircularProgress/></div>)
		} else {
			return (
				<Paper>
					<input className='upload-input' type="file" onChange={this.upLoadFile.bind(this)} multiple={true}/>
					<div onClick={e => console.log(e)}>
						{this.getBreadCrumb()}
						<IconMenu 
						      iconButtonElement={<span style={{cursor:'pointer'}}>{svg.add()}</span>}
						      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
						      targetOrigin={{horizontal: 'left', vertical: 'top'}}
						    >
						    <MenuItem innerDivStyle={listStyle} primaryText="新建文件夹" onClick={this.toggleUploadFolder.bind(this,true)}/>
							<MenuItem innerDivStyle={listStyle} primaryText="上传文件" onClick={this.openInputFile.bind(this)}/>
							<MenuItem innerDivStyle={listStyle} primaryText="上传文件夹" onClick={this.openInputFolder.bind(this)}/>
						</IconMenu>
					</div>
					<div >
						<FilesTable/>
						<Menu></Menu>
					</div>
				</Paper>
				)
      return <FilesTable key='file-table-content' />
		}
	}

	getDetail() {
		if (!this.props.state.view.detail) {
			return null
		}else {
			return (
				<Paper className='file-detail' style={{width:this.props.state.view.detail?'220px':'0px'}}>
					<Detail></Detail>
				</Paper>
				)
		}
	}

	getCreateFolderDialog() {
		if (!this.props.state.view.dialogOfFolder) {
			return null
		}else {
			let folderActions = [
			<FlatButton
				label="取消"
				primary={true}
				onTouchTap={this.toggleUploadFolder.bind(this,false)}
				labelStyle={{color:'#000',fontSize:'15px'}}
			/>,
			<FlatButton
				label="确认"
				primary={true}
				onTouchTap={this.upLoadFolder.bind(this)}
				backgroundColor='#ef6c00'
				labelStyle={{color:'#fff',fontSize:'16px'}}
				hoverColor='#ef6c00'
			/>,
			]
			return (
				<Dialog
					title="新建文件夹"
					titleClassName='create-folder-dialog-title'
					actions={folderActions}
					modal={false}
					open={this.props.state.view.dialogOfFolder}
					className='create-folder-dialog'
				       >
				    <div className='create-folder-dialog-label'>名称</div>
				    <TextField fullWidth={true} hintText="名称" id='folder-name'/>
				</Dialog>
			)
		}
	}

	getShareDialog() {
		if (!this.props.state.view.dialogOfShare) {
			return null
		}else {
			//let shareUserList = this.props.state.login.obj.users.map((item,index)=>{
      let shareUserList = this.props.state.node.server.users.map((item, index) => {
						if (item.username == this.props.state.login.obj.username) {
							return
						}
						return <Checkbox key={item.username} label={item.username} style={{marginBottom: 16}} labelPosition="left" onCheck={this.checkUser.bind(this,item.uuid)}/>
					})
			let shareActions = [
				<FlatButton
					label="取消"
					primary={true}
					onTouchTap={this.toggleShare.bind(this,false)}
					labelStyle={{color:'#000',fontSize:'15px'}}
				/>,
				<FlatButton
					label="确认"
					primary={true}
					onTouchTap={this.share.bind(this)}
					backgroundColor='#ef6c00'
					labelStyle={{color:'#fff',fontSize:'16px'}}
					hoverColor='#ef6c00'
				/>,
			]

			return (
				<Dialog 
					title='分享' 
					titleClassName='create-folder-dialog-title'
					actions={shareActions}
					open={this.props.state.view.dialogOfShare}
					className='create-folder-dialog'>
					<div className='share-user-list-container'>
					{shareUserList}
					</div>
				</Dialog>
				)
		}
	}

	//upload file
	upLoadFile(e) {
		let files = [];
		let map = new Map();
		let t = new Date();
		let dirUUID = this.props.state.file.current.directory.uuid
		for (let i=0;i<e.nativeEvent.target.files.length;i++) {
			var f = e.nativeEvent.target.files[i]
			var file = {
				uploadTime : Date.parse(t), // nonsense TODO
				parent : dirUUID,			// target
				status:0,					// 0, 100 progress
				uuid:null,					// return uuid
				checked:false,				// not used
				type:'file',				// file type (file or folder)
				owner:[this.props.state.login.obj.uuid],	// not used
				size:f.size,				// file size
				path:f.path,				// file local path (with name)
				name:f.name,				// file name (basename)
			}
			files.push(file);
			map.set(f.path+Date.parse(t),files[files.length-1]);
		}
		let fileObj = {data:files,map:map,length:files.length,success:0,failed:0,index:0,status:'ready',parent:this.props.state.file.current.directory.uuid,key:Date.parse(new Date())};
		this.props.dispatch(Action.addUpload(fileObj));
		ipc.send('uploadFile',fileObj);	
		this.props.dispatch(Action.setSnack(files.length+' 个文件添加到上传队列',true));
	}

	//get  bread
	getBreadCrumb(){

		var _this = this;
		var path = this.props.state.file.current.path;
		var pathArr = [];
		pathArr = path.map((item,index)=>{
			return(
				<span key={index} style={{display:'flex',alignItems:'center'}} 
          onClick={_this.selectBreadCrumb.bind(_this,item)}>
					{ item.key!='' ? 
              <span className='breadcrumb-text'>{item.key}</span> :
              <span className='breadcrumb-home'></span>
          }
					<span className={index==path.length-1?'breadcrumb-arrow hidden':'breadcrumb-arrow'}></span>
				</span>
			)});
		return pathArr;
	}

	//select bread crumb
	selectBreadCrumb(obj) {
		$('.bezierFrame').empty().append('<div class="bezierTransition1"></div><div class="bezierTransition2"></div>');
		if (obj.key == '') {
			// ipc.send('getRootData');
			// this.props.dispatch(Action.filesLoading());
      fileNav('HOME_DRIVE', null) 
		}else {
			this.props.dispatch(Action.cleanDetail());
			// ipc.send('enterChildren',obj.value);
      fileNav('HOME_DRIVE', obj.value.uuid)
		}
	}
	//create new folder
	upLoadFolder() {
		let name = $('#folder-name')[0].value;
		ipc.send('upLoadFolder',name,this.props.state.file.current.directory);
		this.toggleUploadFolder(false);
	}
	//open input of files
	openInputFile() {
		// $('.upload-input').trigger('click');
		ipc.send('uploadFile')
	}
	//toggle dialog of upload folder
	openInputFolder() {
		ipc.send('openInputOfFolder');
	}
	//toggle dialog of upload files
	toggleUploadFolder(b) {
		this.props.dispatch(Action.toggleDialogOfUploadFolder(b));
	}

	//toggle dialog of share
	toggleShare(b) {
		this.props.dispatch(Action.toggleShare(b));
	}
	//share files or folders
	share() {
		let files = []
		let users = []
		this.props.state.file.current.children.forEach(item => {
			if (item.checked) {
				files.push(item.uuid)
			}
		})
		//this.props.state.login.obj.users.forEach((item,index)=>{
    this.props.state.node.server.users.forEach((item, index) => {
			if (item.checked) {
				users.push(item.uuid);
			}
		})

		if (users.length == 0) {
			return
		}
		this.props.dispatch(Action.toggleShare(false));
		this.props.dispatch(Action.cancelUserCheck());
		
		ipc.send('share',files,users);
	}
	// select users be shared
	checkUser(uuid) {
		this.props.dispatch(Action.checkUser(uuid))
	}
}
**/
// export default AllFiles

///////////////////////////////////////////////////////////////////////////////

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
  children
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

      <div style={{marginLeft: 20, flex: '0 0 138px', fontSize: 21, whiteSpace: 'nowrap', color: '#FFF'}}>
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
      navTopList: null,
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
    }

    this.refresh = () => {
      command('fileapp', 'FILE_NAV', {
        context: this.state.navContext,
        folderUUID: this.state.directory.uuid,
        rootUUID: this.state.path[0].uuid
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

      if (!this.state.list.find(item => item.selected)) return
      command('fileapp', 'FILE_DELETE', {
        dir: this.state.directory.uuid,
        nodes: this.state.list.filter(item => item.selected).map(item => item.uuid),
      }, (err, data) => {
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
    	let downloadArr = this.state.list.filter(item => item.selected)
    	let folders = []
    	let files = []
    	this.state.list.forEach(item => {
    		if (item.selected && item.type == 'folder') {
    			folders.push(item)
    		}else if (item.selected && item.type == 'file') {
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
    this.showDeleteConfirmDialog = () => assign({ deleteConfirm: true })

    this.renderLeftNav = () => (

      <Paper style={{
        width: LEFTNAV_WIDTH, 
        height: '100%', 
        position: 'absolute', 
        left: this.state.leftNav ? 0 : -LEFTNAV_WIDTH, 
        transition: sharpCurve('left'), 
        zIndex: 1000 }} 

        transitionEnabled={false}
        rounded={false}
        zDepth={this.state.leftNav ? 3 : 0} 
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
        <Menu autoWidth={false} width={LEFTNAV_WIDTH}>
          <MenuItem primaryText='我的文件' leftIcon={<DeviceStorage />} 
            innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}/>
          <MenuItem primaryText='我分享的文件' leftIcon={<SocialShare />} 
            innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}/>
          <Divider />
          <MenuItem primaryText='分享给我的文件' leftIcon={<SocialPeople />}
            innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}/>
          <Divider />
          <MenuItem primaryText='上传任务' leftIcon={<FileFileUpload />}
            innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}/>
          <MenuItem primaryText='下载任务' leftIcon={<FileFileDownload />}
            innerDivStyle={{fontSize:14, fontWeight:'medium', opacity:0.87}}/>
        </Menu> 
      </Paper>
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

     
    this.rowClickBound = this.rowClick.bind(this)
    this.rowDoubleClickBound = this.rowDoubleClick.bind(this)
    this.rowRightClickBound = this.rowRightClick.bind(this)
    
    this.keypress = null
    this.unsubscribe = null

    debug('constructed')    
  }

  componentDidMount() {

    // create keypress listener
    this.keypress = new keypress.Listener()

    // listen window keydown keyup event
    window.addEventListener('keydown', this.keypress)
    window.addEventListener('keyup', this.keypress)

    // register ctrl
    this.keypress.register_combo({
      "keys"              : "ctrl",
      "on_keydown"        : this.handleCtrlDown,
      "on_keyup"          : this.handleCtrlUp,
      "on_release"        : null,
      "this"              : this,
      "prevent_default"   : true,
      "prevent_repeat"    : true,
      "is_unordered"      : false,
      "is_counting"       : false,
      "is_exclusive"      : false,
      "is_solitary"       : false,
      "is_sequence"       : false
    })

    // register shift
    this.keypress.register_combo({
      "keys"              : "shift",
      "on_keydown"        : this.handleShiftDown,
      "on_keyup"          : this.handleShiftUp,
      "on_release"        : null,
      "this"              : this,
      "prevent_default"   : true,
      "prevent_repeat"    : true,
      "is_unordered"      : false,
      "is_counting"       : false,
      "is_exclusive"      : false,
      "is_solitary"       : false,
      "is_sequence"       : false
    })

    this.keypress.register_combo({
      "keys"              : "enter",
      "on_keydown"        : this.enterKeyDown,
      "on_keyup"          : null,
      "on_release"        : null,
      "this"              : this,
      "prevent_default"   : true,
      "prevent_repeat"    : true,
      "is_unordered"      : false,
      "is_counting"       : false,
      "is_exclusive"      : false,
      "is_solitary"       : false,
      "is_sequence"       : false
   })

/****

    // subscribe to redux store
    this.unsubscribe = window.store.subscribe(() => {
      let newFile = window.store.getState().node.file
      if (newFile !== this.state.file) {
        this.nodeUpdate(newFile)
      }
    })

****/

    setImmediate(() => 
      command('fileapp', 'FILE_NAV', { context: 'HOME_DRIVE' }, (err, data) => {
        if (err) return // todo
        this.navUpdate('HOME_DRIVE', data) 
      }))

  }

  componentWillUnmount() {

    // clean up keypress
    this.keypress.reset()
    this.keypress.stop_listening()
    this.keypress.destroy()
    this.keypress = null

    // remove listener
    window.removeEventListener('keydown', this.keypress, false)
    window.removeEventListener('keyup', this.keypress, false)

    // unsubscribe redux store
//    this.unsubscribe && this.unsubscribe()
  }

/**
  shouldComponentUpdate(nextProps, nextState) {
    return nextState !== this.state
  }
**/

  navUpdate(context, data) {

    debug('navUpdate', context, data) 

    let state = {
      navContext: context,
      navList: null,
      navRoot: data.path[0],

      // the last one
      directory: data.path[data.path.length - 1],
      path: data.path,

      specified: -1,

      list: data.children.map(item => Object.assign({}, item, { 
          specified: false,
          selected: false,
        }))
        .sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1
          }
          else
            return a.name.localeCompare(b.name)
        }),
    }

    this.setState(state)
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

    debug('row click', uuid, e, e.ctrlKey, e.shiftKey)
    if (e.shiftKey) 
      return this.rowShiftClick(uuid, e) 
    else if (e.ctrlKey === true)
      return this.rowCtrlClick(uuid, e)
    else 
      return this.rowJustClick(uuid, e)
  }

  rowDoubleClick(uuid, e) {
    
    let item = this.state.list.find(i => i.uuid === uuid)
    if (!item) return
    if (item.type !== 'folder') return
    command('fileapp', 'FILE_NAV', { context: 'HOME_DRIVE', folderUUID: uuid }, (err, data) => {
      if (err) return // todo
      this.navUpdate('HOME_DRIVE', data) 
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
      // multi-selected, just context menu
      if (this.state.list.filter(item => item.selected).length > 1) {
        this.setState(state => 
          Object.assign({}, state, { 
            clientX: e.clientX, 
            clientY: e.clientY,
            contextMenu: true
          }))  
      }
      else { // only one or none selected, act as left click then context menu
        this.rowJustClick(uuid, e)       
        // use function version of setState
        this.setState(state => 
          Object.assign({}, state, { 
            clientX: e.clientX, 
            clientY: e.clientY,
            contextMenu: true
          }))  
      }
    }
  }

	renderBreadCrumb(){

    if (!this.state.path) return null

    let list = []
    this.state.path.forEach((node, index, arr) => {
      list.push(
        <span
          style={{
            fontSize: 21,
            fontWeight: 'medium',
            color: '#FFF',
            opacity: index === arr.length - 1 ? 1 : 0.7,
          }}

          onTouchTap={() => {
            command('fileapp', 'FILE_NAV', { 
              context: 'HOME_DRIVE', 
              folderUUID: node.uuid, 
              rootUUID: arr[0].uuid  
            }, (err, data) => {
              if (err) return // todo
              this.navUpdate('HOME_DRIVE', data) 
            })
          }}
        >
          {index === 0 ? '我的文件' :  node.name}
        </span>
      ) 

      if (index !== arr.length - 1) 
        list.push(<NavigationChevronRight />)
    })

    return list
    
    return (
      <div style={{fontSize: 16, display:'flex', alignItems: 'baseline', color: '#FFF'}}>
        { list }
      </div>
    )
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

    if (!this.state.list) return null 

		return (
      <div style={{ width: '100%', height: '100%', backgroundColor:'#EEE' }}>
        <div style={{width: '100%', height:40, backgroundColor:'#FFF', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}> 
          <div style={{flex: '0 0 120px'}} />
          <div style={{flex: 1, fontSize: 14, fontWeight: 'bold', opacity: 0.54}}>文件名称</div>
          <div style={{flex: '0 0 160px', fontSize: 14, opacity: 0.54, textAlign: 'right'}}>时间</div>
          <div style={{flex: '0 0 160px', fontSize: 14, opacity: 0.54, textAlign: 'right', marginRight: 24 + 16 /* 16 supposed to be scrollbar width */ }}>大小</div>
        </div>
        <Divider style={{marginLeft: 120}} />
        <div style={{width: '100%', height: 'calc(100% - 40px)', overflowY: 'scroll', backgroundColor: '#FFF', display: 'flex', flexDirection: 'column'}}>
          { this.renderList() }
          <div style={{flex:'1 0 96px', backgroundColor: '#FFF'}} 
            onTouchTap={() => {
              console.log('hello world')
            }}
          />
        </div>
        <FileUploadButton path={this.state.path} style={{position: 'absolute', right:48, bottom:48}} />

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
                <MenuItem primaryText='移动' /> 
                <MenuItem primaryText='分享' /> 
                <MenuItem primaryText='下载' onTouchTap={this.download}/>
                <MenuItem primaryText='删除' onTouchTap={this.showDeleteConfirmDialog} /> 
                <MenuItem primaryText='详情' onTouchTap={this.showDetail} />
              </Menu>
            </Paper>
          </div>
        )}

        {/*this.getDetail()*/}
        {/*share dialog*/}
        {/*this.getShareDialog() */}
      </div>
		)
	}

  

  render() {

    const detailWidth = 500
    debug('fileapp render')

    return (
    <div style={this.props && this.props.style} >
      <div style={{ height: '100%', backgroundColor:'blue', display: 'flex', justifyContent: 'space-between' }}>

        { this.state.leftNav &&
          <div id='file-left-nav-mask' 
            style={{backgroundColor: '#000', opacity: 0.1, 
            width: '100%', height: '100%', zIndex:999}} 
            onTouchTap={() => this.setState(Object.assign({}, this.state, { leftNav: false }))}
          />
        }

        { false && this.renderLeftNav() }

        <div id='layout-middle-container' 
          style={{
            position: 'absolute',
            backgroundColor: 'red',
            width: this.state.detailOn ? `calc(100% - ${detailWidth}px)` : '100%', 
            transition: sharpCurve('width'),
            height:'100%'
          }}
        >
          {/* important ! */}
          <Divider />

          <FileToolbar 
            nudge={this.props.nudge && !this.state.detailOn}
            title='文件'
            breadCrumb={this.renderBreadCrumb()} 
            suppressed={true || !this.props.maximized}
            toggleLeftNav={this.toggleLeftNav} 
          >
            <IconButton iconStyle={toolbarStyle.activeIcon}
              onTouchTap={() => this.setState(Object.assign({}, this.state, { 
                createNewFolder: true
              }))}
            >
              <FileCreateNewFolder />
            </IconButton>

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
            display:'flex'
          }}>

            <div style={{
              position: 'absolute',
              width: LEFTNAV_WIDTH,
              height: '100%',
              left: this.state.leftNav ? 0 : -LEFTNAV_WIDTH,
              transition: sharpCurve('left')
            }}>
              <Menu autoWidth={false} listStyle={{width: LEFTNAV_WIDTH}}>
                <MenuItem style={{fontSize: 14}} primaryText='我的文件' leftIcon={<DeviceStorage />} animation={null}/>
                <MenuItem style={{fontSize: 14}} primaryText='我分享的文件' leftIcon={<SocialShare />} />
                <Divider />
                <MenuItem style={{fontSize: 14}} primaryText='分享给我文件' leftIcon={<SocialPeople />} />
                <Divider />
                <MenuItem style={{fontSize: 14}} primaryText='上传任务' leftIcon={<FileFileUpload />} />
                <MenuItem style={{fontSize: 14}} primaryText='下载任务' leftIcon={<FileFileDownload />} />
              </Menu> 
            </div>

            <div style={{
              // for suppressed leftNav, TODO
              marginLeft: this.state.leftNav ? LEFTNAV_WIDTH : 0, 
              transition: sharpCurve('margin-left'),

              width: '100%', 
              height: '100%', 
              backgroundColor:'yellow', 
            }}>
              { this.renderListView() }
            </div>
          </div>

        </div> 

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
          transitionEnabled={false} 
        >
          <FileDetailToolbar 
            nudge={this.props.nudge} 
            suppressed={false && !this.props.maximized}
            show={!this.state.detailResizing}
          > 
            <IconButton 
              iconStyle={toolbarStyle.activeIcon}
              onTouchTap={this.toggleDetail}
            >
              <NavigationClose />
            </IconButton>
          </FileDetailToolbar>
        </div>

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
            this.setState(Object.assign({}, this.state, { createNewFolder: false }))
            this.createNewFolder(name)
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

      </div>
    </div>
    )
  }
}

export default FileApp



