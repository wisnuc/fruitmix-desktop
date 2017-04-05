/**
 * @component uploadFrame
 * @description upload
 * @time 2017-2-28
 * @author liuhua
**/
import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import Row from './TransmissionRow'
import FinishTaskRow from './TransmissionFinishRow'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'
import FolderSvg from 'material-ui/svg-icons/file/folder'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import { command } from '../../lib/command'

const svgStyle = {color: '#000', opacity: 0.54}
class Upload extends Component {
	constructor(props) {
		super(props)
		this.ctrl = false
		this.taskSelected = []
		this.finishSelected = []
		this.state = {
			x: 0,
			y: 0,
			menuShow: false
		}
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
				<div className='trs-title'>
					<span>{this.props.type=='download'?'下载中':'上传中'}</span>
					<span>({userTasks.length})</span>
				</div>
				<div className='trs-hr'></div>
				<div className='trs-list-wrapper'>
					{userTasks.map((task) => {
						return <Row 
							selectTaskItem={this.selectTaskItem.bind(this)} 
							ref={task.uuid} 
							key={task.uuid} 
							task={task} 
							pause={this.pause.bind(this)} 
							resume={this.resume.bind(this)}
						/>
					})}
				</div>
				<div className='trs-title'>
					<span>已完成</span>
					<span>({finishTasks.length})</span>
					<span onClick={this.cleanRecord.bind(this)}>
						<DeleteSvg style={svgStyle}></DeleteSvg>
						<span>清除记录</span>
					</span>
				</div>
				<div className='trs-hr'></div>
				<div className='trs-list-wrapper'>
					{finishTasks.map((task) => {
						return <FinishTaskRow 
							ref={task._id}
							key={task._id}
							task={task} 
							selectFinishItem={this.selectFinishItem.bind(this)}/>
					})}
				</div>
			</div>
		)
	}

	pause(uuid) {
		if (this.props.type === 'download') ipcRenderer.send('PAUSE_DOWNLOADING', uuid)

	}

	resume(uuid) {
		if (this.props.type === 'download') ipcRenderer.send('RESUME_DOWNLOADING', uuid)

	}

	cleanRecord() {
		if (this.props.type === 'download') command('', 'CLEAN_DOWNLOAD_RECORD',{})
		else command('', 'CLEAN_UPLOAD_RECORD',{})
	}

	selectTaskItem(id, checked) {
		console.log(id + ' ' + checked)
	}

	selectFinishItem(id, isSelected) {
		console.log(this.refs[id])
		//clear task select
		if (this.ctrl) {
			this.refs[id].updateDom(!isSelected)
		}else {
			if (isSelected) {
				
			}else {
				
			}
		}
	}	
}

export default Upload
