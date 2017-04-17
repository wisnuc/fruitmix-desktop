import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import Row from './TransmissionRow'
import FinishTaskRow from './TransmissionFinishRow'

class RowList extends Component {  
	constructor(props) {
		super(props)
		this.taskSelected = this.props.taskSelected
		this.finishSelected = this.props.finishSelected
		this.select = this.select.bind(this)
	}

	render() {
		return(
			<div className='trs-list-wrapper' ref='trs-list-wrapper'>
				{this.props.listType=='running'&&this.props.tasks.map((task, index) => {
					return <Row 
						select={this.select}
						ref={task.uuid}
						key={task.uuid}
						index={index}
						task={task}
						pause={this.pause.bind(this)}
						resume={this.resume.bind(this)}/>
				})}

				{this.props.listType=='finish' && this.props.tasks.map((task, index) => {
					return <FinishTaskRow 
						ref={task.uuid}
						key={task.uuid}
						index={index}
						task={task} 
						select={this.select}/>
				})}
			</div>
		)
	}

	pause(uuid) {
		if (this.props.type === 'download') ipcRenderer.send('PAUSE_DOWNLOADING', uuid)
		else ipcRenderer.send('PAUSE_UPLOADING', uuid)
	}

	resume(uuid) {
		if (this.props.type === 'download') ipcRenderer.send('RESUME_DOWNLOADING', uuid)
		else ipcRenderer.send('RESUME_UPLOADING', uuid)
	}

	select(type, id, isSelected, index, e) {
		let arr = type === 'running' ? this.taskSelected : this.finishSelected
		type === 'running' ? this.props.cleanFinishSelect() : this.props.cleanTaskSelect()
		if (this.props.ctrl) {
			//'ctrl 按下'
			if (isSelected) {
				//'取消选中'
				if (e.button !== 2) {
					let index = arr.indexOf(id)
					arr.splice(index, 1)
					this.refs[id].updateDom(!isSelected)	
				}
			}else {
				//'选中'
				arr.push(id)
				this.refs[id].updateDom(!isSelected)
			}
			
			//shift enter
		}else if (this.props.shift) {

		}else{
			//右键选中文件 不进行操作 只打开菜单
			if (!(e.button == 2 && isSelected)) {
				//'单选一个任务'
				type === 'running' ? this.props.cleanTaskSelect() : this.props.cleanFinishSelect()
				arr.push(id)
				this.refs[id].updateDom(true)
			}
		}
		console.log('当前选中任务数量 : ' + arr.length)
		

		
		if (e.button == 2) {
			let tasks = []
			let play,pause
			arr.forEach(item => {
				if (this.refs[item]) {
					tasks.push(this.refs[item].props.task)
				}
			})
			if (this.props.listType !== 'finish') {
				for(let i = 0; i < tasks.length; i++) {
					if (play !== undefined && pause !== undefined) break
					if (tasks[i].pause) play = false
					else pause = false
				}
				if (play === undefined) play = true
				if (pause === undefined) pause = true
			}else {
				play = true
				pause = true
			}
			let obj = {
				type: this.props.listType,
				pause: pause,
				play: play,
				tasks
			}
			this.props.openMenu(e, obj)
		}
	}
}

export default RowList