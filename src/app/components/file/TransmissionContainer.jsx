/**
 * @component transmissionFrame
 * @description upload
 * @time 2017-2-28
 * @author liuhua
**/
import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import { Paper, Menu, MenuItem } from 'material-ui'
import RowList from './TransmissionRowList'
import { command } from '../../lib/command'

const svgStyle = {color: '#000', opacity: 0.54}
class Upload extends Component {
	constructor(props) {
		super(props)
		this.taskSelected = []
		this.finishSelected = []
		this.state = {
			x: 0,
			y: 0,
			ctrl: false,
			shift: false,
			play: true,
			pause: true,
			menuShow: false,
			tasks: []
		}
		this.kd = this.keydown.bind(this)
		this.ku = this.keyup.bind(this)
		this.hideMenu = this.hideMenu.bind(this)
		this.play = this.play.bind(this)
		this.pause = this.pause.bind(this)
		this.delete = this.delete.bind(this)
		this.open = this.open.bind(this)
	}

	componentDidMount() {
		document.addEventListener('keydown', this.kd)
		document.addEventListener('keyup', this.ku)
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.kd)
		document.removeEventListener('keyup', this.ku)
	}

	keydown(event) {
		if (event.ctrlKey == this.ctrl && event.shiftKey == this.shift) return
		this.setState({
			ctrl: event.ctrlKey,
			shift: event.shiftKey
		})
	}

	keyup(event) {
		if (event.ctrlKey == this.ctrl && event.shiftKey == this.shift) return
		this.setState({
			ctrl: event.ctrlKey,
			shift: event.shiftKey
		})
	}

	render() {
		let transmission,userTasks,finishTasks
		transmission = window.store.getState().transmission
		if (this.props.type == 'download') {
			userTasks = transmission.downloadingTasks
			finishTasks = transmission.downloadedTasks
		}else {
			userTasks = transmission.uploadingTasks
			finishTasks = transmission.uploadedTasks
		}
		
		return (
			<div id='trs-wrap'>
				{/*title*/}
				<div className='trs-title'>
					<span>{this.props.type=='download'?'下载中':'上传中'}</span>
					<span>({userTasks.length})</span>
				</div>
				<div className='trs-hr'></div>
				{/*list*/}
				<RowList
					type = {this.props.type}
					ref = 'running'
					listType = 'running'
					tasks = {userTasks}
					taskSelected = {this.taskSelected}
					finishSelected = {this.finishSelected}
					ctrl = {this.state.ctrl}
					shift = {this.state.shift}
					cleanFinishSelect = {this.cleanFinishSelect.bind(this)}
					cleanTaskSelect = {this.cleanTaskSelect.bind(this)}
					openMenu = {this.openMenu.bind(this)}
				/>
				{/*title*/}
				<div className='trs-title'>
					<span>已完成</span>
					<span>({finishTasks.length})</span>
					<span onClick={this.cleanRecord.bind(this)}>
						<DeleteSvg style={svgStyle}></DeleteSvg>
						<span>清除记录</span>
					</span>
				</div>
				<div className='trs-hr'></div>
				{/*list*/}
				<RowList
					type = {this.props.type}
					listType = 'finish'
					ref = 'finish'
					tasks = {finishTasks}
					taskSelected = {this.taskSelected}
					finishSelected = {this.finishSelected}
					ctrl = {this.state.ctrl}
					shift = {this.state.shift}
					cleanFinishSelect = {this.cleanFinishSelect.bind(this)}
					cleanTaskSelect = {this.cleanTaskSelect.bind(this)}
					openMenu = {this.openMenu.bind(this)}
				/>
				{this.state.menuShow && (
					<div className='trs-menu-container' onTouchTap={this.hideMenu}>
						<Paper style={{position:'absolute',top:this.state.y,left:this.state.x}}>
							<Menu>
								<MenuItem primaryText='开始下载' disabled={this.state.play} onTouchTap={this.play}/>
								<MenuItem primaryText='暂停' disabled={this.state.pause} onTouchTap={this.pause}/>
								<MenuItem primaryText='打开所在文件夹' onTouchTap={this.open}/>
								<MenuItem primaryText='删除' onTouchTap={this.delete}/>
							</Menu>
						</Paper>
					</div>
				)}
			</div>
		)
	}

	cleanRecord() {
		if (this.props.type === 'download') command('', 'CLEAN_DOWNLOAD_RECORD',{})
		else command('', 'CLEAN_UPLOAD_RECORD',{}, (err, data) => {
			console.log(err, data)
		})
	}

	cleanTaskSelect() {
		this.taskSelected.forEach(item => {
			if (this.refs['running'].refs[item]) {
				this.refs['running'].refs[item].updateDom(false)	
			}
		})
		this.taskSelected.length = 0
	}

	cleanFinishSelect() {
		this.finishSelected.forEach(item => {
			if (this.refs['finish'].refs[item]) {
				this.refs['finish'].refs[item].updateDom(false)
			}
		})
		this.finishSelected.length = 0
	}

	openMenu(event, obj) {
		let containerDom = document.getElementById('fileListContainer')
		let maxLeft = containerDom.offsetLeft + containerDom.clientWidth - 112
		let x = event.clientX>maxLeft?maxLeft:event.clientX
		let maxTop = containerDom.offsetTop + containerDom.offsetHeight -208
		let y = event.clientY>maxTop?maxTop:event.clientY
		this.setState({menuShow: true, x, y, play: obj.play, pause: obj.pause, tasks: obj.tasks})
	}

	hideMenu() {
		this.setState({
			menuShow: false
		})
	}

	play() {
		if (this.props.type === 'download') {
			this.state.tasks.forEach(item => ipcRenderer.send('RESUME_DOWNLOADING', item.uuid))
		}
	}

	pause() {
		if (this.props.type === 'download') {
			this.state.tasks.forEach(item => ipcRenderer.send('PAUSE_DOWNLOADING', item.uuid))
		}
	}

	delete() {
		console.log(this.state.tasks)
		if (this.props.type === 'download') 
			this.state.tasks.forEach(item => 
				ipcRenderer.send(this.taskSelected.length?'DELATE_DOWNLOADING':'DELETE_DOWNLOADED', this.state.tasks)
			)
		else this.state.tasks.forEach(item => 
			ipcRenderer.send(this.taskSelected.length?'DELETE_UPLOADING':'DELETE_UPLOADED', this.state.tasks)
			)
	}

	open() {
		if (this.props.type === 'download') {
			ipcRenderer.send('OPEN_DOWNLOAD', this.state.tasks, this.taskSelected.length?'running':'finish')
		}
	}
}

export default Upload
