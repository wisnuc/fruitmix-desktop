/**
 * @component uploadFrame
 * @description upload
 * @time 2017-2-28
 * @author liuhua
**/
import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import Row from './newUploadRow'
import FinishTaskRow from './FinishRow'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'
import FolderSvg from 'material-ui/svg-icons/file/folder'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import { command } from '../../lib/command'

const svgStyle = {color: '#000', opacity: 0.54}
class Upload extends Component {
	constructor() {
		super()
		this.ctrl = 
		this.selectList = []
	}

	render() {
		let transmission = window.store.getState().transmission
		let userTasks = transmission.downloadingTasks
		let finishTasks = transmission.downloadedTasks
		return (
			<div id='trs-wrap'>
				<div className='trs-title'>
					<span>下载中</span>
					<span>({userTasks.length})</span>
				</div>
				<div className='trs-hr'></div>
				<div className='trs-list-wrapper'>
					{userTasks.map((task) => {
						return <Row 
											selectItem={this.selectItem.bind(this)} 
											ref={task.uuid} 
											key={task.uuid} 
											task={task} 
											pause={this.pause} 
											resume={this.resume}
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
						return <FinishTaskRow key={task.uuid} task={task}/>
					})}
				</div>
			</div>
		)
	}

	pause(uuid) {
		ipcRenderer.send('PAUSE_DOWNLOADING', uuid)
	}

	resume(uuid) {
		ipcRenderer.send('RESUME_DOWNLOADING', uuid)
	}

	cleanRecord() {
		command('', 'CLEAN_DOWNLOAD_RECORD',{})
	}

	selectItem(id, checked) {
		console.log(id + ' ' + checked)
	}
}

export default Upload
