import React, { Component } from 'react'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'
import FolderSvg from 'material-ui/svg-icons/file/folder'
import PlaySvg from 'material-ui/svg-icons/av/play-arrow'
import PauseSvg from 'material-ui/svg-icons/av/pause'
import DetailSvg from 'material-ui/svg-icons/image/details'

const normalStyle = {}
const selectStyle = {backgroundColor:'#f4f4f4'}
const svgStyle = {color: '#000', opacity: 0.54}
class UploadRow extends Component {

	constructor(props) {
		super(props)
		this.selected = false
		this.updateDom = (isSelected) => {
			this.isSelected = isSelected
			this.forceUpdate()
		}
	}

	render() {
		let task = this.props.task
		let s = this.isSelected? selectStyle: normalStyle
		let pColor = task.pause?'#d4d4d4':'#89c2f2'
		let pWidth = task.completeSize / task.size * 100
		if (pWidth === Infinity || !pWidth) pWidth = 0
		return (
			<div className='trs-row' style={s} onMouseUp={this.selectTaskItem.bind(this)}>
				<div className='trs-row-name'>
					<span>
						{
							task.type=='folder'?<FolderSvg style={svgStyle}/>:
							<FileSvg style={svgStyle}/>
						}
					</span>
					<span>{task.name}</span>
				</div>
				<div className='trs-row-rtime'>{task.restTime}</div>
				<div className='trs-row-progress'>
					<div>
						<div className='trs-row-progress-bar'>
							<span style={{backgroundColor:pColor,width:pWidth + '%'}}></span>
						</div>
						<div>{this.getStatus(task)}</div>
					</div>
					<div className='trs-row-finishProcess'>
						{this.getUploadedSize(task)}
					</div>
				</div>
				<div className='trs-row-tool'>
					{task.pause?
						<PlaySvg style={svgStyle} onClick={this.props.resume.bind(this, task.uuid)}/>:
						<PauseSvg style={svgStyle} onClick={this.props.pause.bind(this, task.uuid)}/>}
				</div>
			</div>
		)
	}


	selectTaskItem(e) {
		let event = e.nativeEvent
		this.props.select('running', this.props.task.uuid, this.isSelected, null, event)
	}

	getStatus(task) {
		if (task.pause) return '暂停'
		if (task.state === 'visitless') return '等待中'
		if (task.state === 'visiting') return '正在校验本地文件' 
		if (task.state === 'diffing') return '正在校验本地文件' 
		if (task.state === 'finish') return '已完成'
		return ((task.completeSize / task.size)* 100).toFixed(2) + '%'
	}

	getUploadedSize(task) {
		if (task.type === 'folder') return task.finishCount +  '/' + task.count + ' ' + task.speed
		else if (task.type === 'file') return this.formatSize(task.completeSize) + ' ' + task.speed
		else return ''
	}

	formatSize(size) {
		if (!size) return 0 + 'KB'
		size = parseFloat(size)
		if (size < 1024) return size.toFixed(2) + 'B' 
		else if (size < (1024 * 1024)) return (size / 1024).toFixed(2) + 'KB'
		else if (size < (1024 * 1024 * 1024)) return (size / 1024 / 1024).toFixed(2) + 'M'
		else return (size / 1024 / 1024 / 1024).toFixed(2) + 'G'
	}
}

export default UploadRow
