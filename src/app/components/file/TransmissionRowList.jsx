import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import Row from './TransmissionRow'
import FinishTaskRow from './TransmissionFinishRow'

class RowList extends Component {
	constructor(props) {
		super(props)
		this.taskSelected = this.props.taskSelected
		this.finishSelected = this.props.finishSelected
	}

	render() {
		return(
			<div className='trs-list-wrapper' ref='trs-list-wrapper'>
				{this.props.listType=='running'&&this.props.tasks.map((task, index) => {
					return <Row 
						selectTaskItem={this.selectTaskItem.bind(this)}
						ref={task.uuid}
						key={task.uuid}
						index={index}
						task={task}
						pause={this.pause.bind(this)}
						resume={this.resume.bind(this)}
						openMenu={this.openMenu.bind(this)}
					/>
				})}

				{this.props.listType=='finish' && this.props.tasks.map((task, index) => {
					return <FinishTaskRow 
						ref={task._id}
						key={task._id}
						index={index}
						task={task} 
						selectFinishItem={this.selectFinishItem.bind(this)}
						openMenu={this.openMenu.bind(this)}/>
				})}
			</div>
		)
	}

	pause(uuid) {
		if (this.props.type === 'download') ipcRenderer.send('PAUSE_DOWNLOADING', uuid)
	}

	resume(uuid) {
		if (this.props.type === 'download') ipcRenderer.send('RESUME_DOWNLOADING', uuid)
	}
	
	selectFinishItem(id, isSelected, index) {
		this.props.cleanTaskSelect()
		if (this.props.ctrl) {
			if (isSelected) {
				let index = this.finishSelected.findIndex(item => item == id)
				this.finishSelected.splice(index,1)
			}else {
				this.finishSelected.push(id)
			}
			this.refs[id].updateDom(!isSelected)
		}else if (this.props.shift) {

		}else {
			this.props.cleanFinishSelect()			
			this.finishSelected.push(id)
			this.refs[id].updateDom(true)
		}
	}

	selectTaskItem(id, isSelected, index) {
		// this.cleanFinishSelect()
		this.props.cleanFinishSelect()
		if (this.props.ctrl) {
			if (isSelected) {
				let index = this.taskSelected.indexOf(id)
				this.taskSelected.splice(index, 1)
			}else {
				this.taskSelected.push(id)
			}
			this.refs[id].updateDom(!isSelected)
		}else if (this.props.shift) {

		}else {
			this.props.cleanTaskSelect()
			this.taskSelected.push(id)
			this.refs[id].updateDom(true)
		}
	}
	
	openMenu(event) {
		let containerDom = document.getElementById('fileListContainer')
		let maxLeft = containerDom.offsetLeft + containerDom.clientWidth - 112
		let x = event.clientX>maxLeft?maxLeft:event.clientX
		let maxTop = containerDom.offsetTop + containerDom.offsetHeight -352
		let y = event.clientY>maxTop?maxTop:event.clientY
		this.setState({
			menuShow:true,
			x:x,
			y:y
		})
	}

	
}

export default RowList