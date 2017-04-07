/**
 * @component uploadFrame
 * @description upload
 * @time 2017-2-28
 * @author liuhua
**/
import React, { Component } from 'react'
import RowList from './TransmissionRowList'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import { command } from '../../lib/command'

const svgStyle = {color: '#000', opacity: 0.54}
class Upload extends Component {
	constructor(props) {
		super(props)
		this.taskSelected = []
		this.finishSelected = []
		this.special = null
		this.state = {
			x: 0,
			y: 0,
			ctrl: false,
			shift: false,
			menuShow: false
		}
		this.kd = this.keydown.bind(this)
		this.ku = this.keyup.bind(this)
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
				<div className='trs-title'>
					<span>{this.props.type=='download'?'下载中':'上传中'}</span>
					<span>({userTasks.length})</span>
				</div>
				<div className='trs-hr'></div>
				<RowList
					type = {this.props.type}
					ref='running'
					listType = 'running'
					tasks = {userTasks}
					taskSelected = {this.taskSelected}
					finishSelected = {this.finishSelected}
					ctrl = {this.state.ctrl}
					shift = {this.state.shift}
					cleanFinishSelect = {this.cleanFinishSelect.bind(this)}
					cleanTaskSelect = {this.cleanTaskSelect.bind(this)}
				/>
				<div className='trs-title'>
					<span>已完成</span>
					<span>({finishTasks.length})</span>
					<span onClick={this.cleanRecord.bind(this)}>
						<DeleteSvg style={svgStyle}></DeleteSvg>
						<span>清除记录</span>
					</span>
				</div>
				<div className='trs-hr'></div>
				<RowList
					type={this.props.type}
					listType='finish'
					ref='finish'
					tasks={finishTasks}
					taskSelected = {this.taskSelected}
					finishSelected = {this.finishSelected}
					ctrl = {this.state.ctrl}
					shift = {this.state.shift}
					cleanFinishSelect = {this.cleanFinishSelect.bind(this)}
					cleanTaskSelect = {this.cleanTaskSelect.bind(this)}
				/>
			</div>
		)
	}

	cleanRecord() {
		if (this.props.type === 'download') command('', 'CLEAN_DOWNLOAD_RECORD',{})
		else command('', 'CLEAN_UPLOAD_RECORD',{})
	}

	cleanTaskSelect() {
		this.taskSelected.forEach(item => {
				this.refs['running'].refs[item].updateDom(false)
		})
		this.taskSelected.length = 0
	}

	cleanFinishSelect() {
		this.finishSelected.forEach(item => {
				this.refs['finish'].refs[item].updateDom(false)
		})
		this.finishSelected.length = 0
	}
}

export default Upload
