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
import { fileNav } from '../../lib/file'

import keypress from 'keypress.js'

import svg from '../../utils/SVGIcon'

import { Popover } from 'material-ui'

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

import { Divider, Paper, Menu, MenuItem, Dialog, 
  FlatButton, TextField, Checkbox, CircularProgress } from 'material-ui'

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

const stm = () => window.store.getState().file.stm


///////////////////////////////////////////////////////////////////////////////

class PopMenu extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
  
    this.handleRequestClose = () => {
      this.setState({
        open: false,
      })
    }

  }

  componentDidMount() {
    debug('popmenu did mount')
  }

  componentWillUnmount() {
    debug('popmenu will unmount')
  }

  render() {

    debug('popmenu render', this.state, this.fired)

    return (
      <div>
        <div style={{width:'100%', height:'100%'}} 
          ref={element => {
            if (element) element.click()
          }} 

          onClick = {e => {
            console.log(e)
            this.setState({
              open: true,
              anchorEl: e.currentTarget 
            })
          }}
        />

        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            <MenuItem primaryText="Refresh" />
            <MenuItem primaryText="Help &amp; feedback" />
            <MenuItem primaryText="Settings" />
            <MenuItem primaryText="Sign out" />
          </Menu>
        </Popover>        
      </div>
    )
  }
}

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


const DataRow = ({
  uuid,
  index,
  name,
  type,
  mtime,
  size,

  selecting,
  editing,

  selected,
  specified,
  hover,

  leading,
  check,
  
  onMouseEnter,
  onMouseLeave,
  onClick,
  onDoubleClick,
  onRightClick
}) => {

  let style = {

    row: {
      width: '100%',
      flex: '0 0 40px',

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',

      backgroundColor: (hover || leading === 'active') ? '#EEEEEE' : selected ? '#F5F5F5' : '#FFF',

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

  const secondaryColor = '#FF4081'

  const renderLeading = () => {

    let height = '100%', backgroundColor = '#FFF', opacity = 0

    switch(leading) {
    case 'inactive':
      height = 24
      backgroundColor = '#000'
      opacity = 0.26
      break
    case 'activating':
      height = 24
      backgroundColor = '#000'
      opacity = 0.26
      break
    case 'active':
      backgroundColor = secondaryColor
      opacity = 1
      break
    }

    return <div style={{ flex: '0 0 4px', height, backgroundColor, opacity, zIndex:1000 }} /> 
  }

  return (

    <div style={style.row}
      onMouseEnter = {() => onMouseEnter(index)}
      onMouseLeave = {() => onMouseLeave(index)}
      onClick = {e => onClick(uuid, e)}
      onDoubleClick = {e => onDoubleClick(uuid, e)}
      onTouchTap = {e => e.nativeEvent.button === 2 && onRightClick(uuid, e.nativeEvent)}
    >

      { 
        // 4px width
        renderLeading() 
      } 

      <div style={{flex: '0 0 12px'}} />

      <div style={{flex: '0 0 48px', display: 'flex', alignItems: 'center'}} >
        {
          (check === 'checked' || check === 'unchecking') ? <ActionCheckCircle style={{color: secondaryColor, opacity: 1, zIndex:1000}} /> :
          check === 'checking' ? <NavigationCheck style={{color: '#000', opacity: 0.26}} /> : null
        }
      </div>
      
      <div style={{flex: '0 0 8px'}} />

      <div style={{flex: '0 0 48px', display: 'flex', alignItems: 'center'}} >
        {
          type === 'folder' ?  
            <FileFolder style={{color: '#000', opacity: 0.54}} /> : 
              <EditorInsertDriveFile style={{color: '#000', opacity: 0.54}} />
        }
      </div>

      {/* name column */}
      <div style={{width:'100%'}} >
        { editing ? 
          <TextField 
            hintText={name} 
            fullWidth={true} 
            ref={ input => { input && input.focus() }}
            onBlur={() => window.store.dispatch({
              type: 'FILE_ROW_NAME_ONBLUR',
              data: uuid
            })}
          /> : <span style={{fontSize: 14, opacity:0.87}}>{name}</span> 
        }
      </div>

      {/* time column */}
      <div style={style.time}>{formatTime(mtime)}</div>

      {/* size column */}
      <div style={style.size}>{formatSize(size)}</div>
    </div>
  )
}

class AllFiles extends React.Component {

  constructor(props) {

    super(props)

    this.state = { 
      file: null, 

      ctrl: false, 
      shift: false,

      clientX: 0,
      clientY: 0, 

      contextMenu: false,
    }

    this.rowMouseEnterBound = this.rowMouseEnter.bind(this)
    this.rowMouseLeaveBound = this.rowMouseLeave.bind(this)
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

    // subscribe to redux store
    this.unsubscribe = window.store.subscribe(() => {
      let newFile = window.store.getState().node.file
      if (newFile !== this.state.file) {
        this.nodeUpdate(newFile)
      }
    })

    let file = window.store.getState().node.file

    let state = { file }

    if (this.state.file === null && file) {
      state.list = file.children.map(item => Object.assign({}, item, { selected: false }))
      this.setState(state)
    } 
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
    this.unsubscribe && this.state.unsubscribe()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState !== this.state
  }

  nodeUpdate(newFile) {

    debug('nodeUpdate', newFile) 

    if (newFile === this.state.file) return

    let state = {
      file: newFile,
      list: newFile.children.map(item => Object.assign({}, item, { 
          specified: false,
          selected: false,
          hover: false,
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
    debug('nodeUpdate changed state', state)
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

  rowMouseLeave(index) {
    
    this.setState(state => Object.assign({}, state, {
      list: [
        ...state.list.slice(0, index),
        Object.assign({}, state.list[index], { hover: false }),
        ...state.list.slice(index + 1)
      ]
    }))
  }

  rowMouseEnter(index) {

    this.setState(state => Object.assign({}, state, {
      list: [
        ...state.list.slice(0, index),
        Object.assign({}, state.list[index], { hover: true }),
        ...state.list.slice(index + 1)
      ]
    }))
  }

  // mutate item, return new list
  rowClick(uuid, e) {

    debug('row click', e, e.ctrlKey, e.shiftKey)

    let list, nextState

    if (e.shiftKey) {
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
    else if (e.ctrlKey === true) {

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
    else {
      // normal: set target exclusively specified, set target exclusively selected
      let list = this.state.list.map(item => {
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
  }

  rowDoubleClick(uuid, e) {
    
  }

  rowRightClick(index, e) {

    // e is native event
    debug('row right click', e.clientX, e.clientY)

    if (this.state.ctrl || this.state.shift) return
          
    this.setState(Object.assign({}, this.state, { 
      clientX: e.clientX, 
      clientY: e.clientY,
      contextMenu: true
    }))  
  }

  renderList() {

    let specified, multi, min, max, hover
    let { ctrl, shift, list } = this.state

    specified = this.state.list.findIndex(item => item.specified)
    hover = this.state.list.findIndex(item => item.hover)

    if (specified !== -1 && hover !== -1) {
      min = Math.min(specified, hover)
      max = Math.max(specified, hover)
    }

    multi = this.state.list.filter(item => item.selected).length > 1
    
    let selecting = ctrl || shift 

    return this.state.list.map((item, index) => (
      <DataRow 

        key={item.uuid}

        index={index}
        name={item.name}
        type={item.type}
        uuid={item.uuid} 
        mtime={item.mtime}
        size={item.size}
       
        selected={item.selected}
        hover={item.hover}
        
        leading={(() => { // none, inactive, activating, active
          if (shift) {
            if (specified !== -1)
              return (index <= max && index >= min) ? 'active' : 'none'
            else  
              return item.hover ? 'activating' : 'none'
          }
          else 
            return item.specified ? 'inactive' : 'none'
        })()}

        check={(() => { // none, checking, unchecking, checked
          if (shift) {
            if (specified !== -1) {
              if (index <= max && index >= min) { // in range
                return item.selected ? 'checked' : 'checking'
              }
              else
                return item.selected ? 'checked' : 'none'
            }   
            else {
              if (item.selected)
                return 'checked'
              else if (item.hover)
                return 'checking'
              else 
                return 'none'
            }
          } 
          else if (ctrl) {
            if (item.selected && item.hover)
              return 'unchecking'
            else if (!item.selected && item.hover)
              return 'checking'
            else if (item.selected)
              return 'checked'
            else
              return 'none'
          }
          else {
            return (multi && item.selected) ? 'checked' : 'none'
          }
        })()}

        modifier={this.state.shift ? 'shift' : this.state.ctrl ? 'ctrl' : 'none'}

        selecting={selecting}
        specified={item.specified} 

        onMouseEnter={this.rowMouseEnterBound}
        onMouseLeave={this.rowMouseLeaveBound}
        onClick={this.rowClickBound}
        onDoubleClick={this.rowDoubleClickBound}
        onRightClick={this.rowRightClickBound}

      />))
  }

	render() {

    if (this.state.file === null) return null 

		return (
      <div style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor:'#EEE' 
      }}>
       
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
          <div style={{flex:'1 0 96px', backgroundColor: 'yellow'}} />
        </div>

        <FileUploadButton style={{position: 'absolute', right:48, bottom:48}} />

        { this.state.contextMenu && (
          <div 
            style={{position: 'fixed', top: 0, left: 0, width:'100%', height:'100%', zIndex:2000}}
            onTouchTap={() => this.setState(Object.assign({}, this.state, { contextMenu: false}))} 
          >
            <Paper style={{
              position: 'fixed', 
              top: this.state.clientY, 
              left: this.state.clientX,
              backgroundColor: '#F5F5F5'
            }}>
              <Menu >
                <MenuItem primaryText='hello' />
                <MenuItem primaryText='world' />
              </Menu>
            </Paper>
          </div>
        )}


        {/* this.props.state.file.view.state !== 'BUSY' && <FilesTable />  */}
        {/*file detail*/}
        {/*this.getDetail()*/}
        {/*create new folder dialog*/}
        {/*this.getCreateFolderDialog()*/}
        {/*share dialog*/}
        {/*this.getShareDialog() */}
      </div>
		)
	}

  /////////////////////////////////////////////////////////////////////////////

	//get table 
	getTable() {

		const listStyle = {
			height: 48,
			lineHeight:'48px'
		}

		if (this.props.state.file.view.state=='BUSY') {
			return (<div className='data-loading '><CircularProgress/></div>)
		} else {
/**
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
**/
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

// export default AllFiles

///////////////////////////////////////////////////////////////////////////////

const FileToolbar = ({showAppBar, showDetail, toggleLeftNav}) => {

  return (
    <Paper id='layout-middle-container-upper' 
      style={{ 
        position: 'absolute', width: '100%', height: 56,
        backgroundColor: '#2196F3',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }} 
      rounded={false} 
      zDepth={showAppBar ? 0 : 1}
    >
      <IconButton id='file-toolbar-menu-icon' key='toolbar-menu' 
        style={{marginLeft: 4}}
        iconStyle={{color: '#000', opacity:0.54}} 
        onTouchTap={() => toggleLeftNav()}
      > 
        <NavigationMenu />
      </IconButton>

      <div key='toolbar-title' style={{marginLeft: 20, fontSize: 21, whiteSpace: 'nowrap', color: '#FFF' }}>文件</div>

      <div key='toolbar-spacer-middle' style={{width: '100%'}} />

      <IconButton iconStyle={{color: '#000', opacity: 0.54}}>
        <FileCreateNewFolder />
      </IconButton>

      <IconButton iconStyle={{color: showDetail ? '#FFF' : '#000', opacity: showDetail ? 1 : 0.54}} 
        onTouchTap={() => window.store.dispatch({ type: 'TOGGLE_SOMETHING' })}>
        <ActionInfo />
      </IconButton> 

      <div style={{width: (showAppBar || showDetail) ? 0 : 48, height:48, transition: 'width 150ms'}} />

    </Paper>
  )
}

class FileDetailToolbar extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { showAppBar, showBanner, nudgeBanner } = this.props
    return (
      <Paper id='layout-right-container-upper' 
        style={{
          position: 'absolute', 
          width: '100%', height: 56, 

          backgroundColor:'#1976D2',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        rounded={false} 
        zDepth={showAppBar ? 0 : 1}
      >
        <div style={{flex: '1'}} />
        <IconButton style={{opacity: showBanner ? 0.54 : 0}}><ActionInfo /></IconButton>
        <div style={{width: nudgeBanner ? 48 : 0, height:48, transition: 'width 150ms'}} />
      </Paper>
    )
  }
}

class FileApp extends React.Component {

  constructor(props) {
    super(props)
    this.state = this.propsToState(props)
    this.toggleLeftNavBound = this.toggleLeftNav.bind(this)
  }

  // functional
  propsToState(props) {

   let state = {
      showAppBar: props.showAppBar,
      showDetail: props.showDetail,
      nudgeBanner: !props.showAppBar && !props.showDetail
    } 

    if (props.showDetail) {
      state.detailShowBanner = true
      state.detailNudgeBanner = !props.showAppBar
    }

    if (!this.state) {
      state.leftNav = false
    }
    else {
      state.leftNav = this.state.leftNav
    }

    return state
  }

  toggleLeftNav() {
    this.setState(Object.assign({}, this.state, { leftNav: !this.state.leftNav }))
  }

  // state delay
  componentWillReceiveProps(nextProps) {

    let nextState = this.propsToState(nextProps)

    if (this.state.showDetail === false && nextProps.showDetail === true) {
      this.setState(Object.assign({}, nextState, { detailShowBanner: false }))
      return setTimeout(() => this.setState(nextState), 450)
    }
    else if (this.state.showDetail === true && nextProps.showDetail === false) {
      this.setState(Object.assign({}, this.state, { detailShowBanner: false }))
      return setTimeout(() => this.setState(nextState), 450)
    }
    
    this.setState(nextState)
  } 

  render() {

    const detailWidth = 500
    const { showAppBar, showDetail } = this.props

    return (
    <div style={this.props.style} >
      <div id='layout-main-container' 
        style={{ height: '100%', backgroundColor:'blue' }}
      >
        { false && ( // don't delete me, floating left nav
        <Paper style={{
          width: 280, 
          height: '100%', 
          position: 'absolute', 
          left: this.state.leftNav ? 0 : -280, 
          transition: 'left 100ms', 
          zIndex: 1000 }} 
          rounded={false}
          zDepth={2} 
        >
          { renderLeftNav() }
        </Paper> ) }

        {/* this.state.leftNav && <div style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'black', zIndex: 999, opacity:0.05}} onTouchTap={this.toggleLeftNavBound} /> */}

        <div id='layout-middle-container' 
          style={{
            position: 'absolute',

            backgroundColor: 'red',

            // imporant! using props (next)
            width: this.props.showDetail ? `calc(100% - ${detailWidth}px)` : '100%', 
            transition: 'width 300ms',
            height:'100%'
          }}
        >
          {/* important ! */}
          <Divider />

          <FileToolbar showAppBar={showAppBar} showDetail={showDetail} toggleLeftNav={this.toggleLeftNavBound} />

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
              transition: 'left 150ms cubic-bezier(0.4, 0.0, 0.6, 1)'
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
              transition: 'margin-left 150ms cubic-bezier(0.4, 0.0, 0.6, 1)',

              width: '100%', 
              height: '100%', 
              backgroundColor:'yellow', 
              // overflow: 'auto'
            }}>
              {/* <Content dispatch={window.store.dispatch} state={storeState()}/> */}
              <AllFiles dispatch={window.store.dispatch} state={window.store.getState()}/>
            </div>
          </div>

        </div> 
        <div id='layout-rightnav-container' 
          style={{
            width: detailWidth, 
            height: '100%', 
            backgroundColor: '#EBEBEB', 
            position: 'absolute', 
            right: showDetail ? 0 : -detailWidth, 
            transition: 'right 150ms cubic-bezier(0.4, 0.0, 0.6, 1)'
        }}>
          <Divider />

          { this.state.showDetail && <FileDetailToolbar showAppBar={this.state.showAppBar} showBanner={this.state.detailShowBanner} nudgeBanner={this.state.detailNudgeBanner} /> }
        </div>
      </div>
    </div>
    )
  }
}

export default FileApp



