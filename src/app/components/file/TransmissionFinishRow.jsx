import React, { Component } from 'react'
import FolderSvg from 'material-ui/svg-icons/file/folder'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'

const svgStyle = {color: '#000', opacity: 0.54}
const normalStyle = {}
const selectStyle = {backgroundColor:'#f4f4f4'}

class FinishTaskRow extends Component {
	constructor(props) {
		super(props)
		this.createDate = new Date()
		this.isSelected = false
		this.updateDom = (isSelected) => {
			this.isSelected = isSelected
			this.forceUpdate()
		}
	}

	render() {
		let s = this.isSelected? selectStyle: normalStyle
		let task = this.props.task
		return (
			<div className='trs-row' style={s} onMouseUp={this.selectFinishItem.bind(this)}>
				<div className='trs-row-name'>
					<span>
						{
							task.type=='folder'?<FolderSvg style={svgStyle}/>:
							<FileSvg style={svgStyle}/>
						}
					</span>
					<span>{task.name}</span>
				</div>
				<div className='trs-row-finishDate'>
					<span>{this.getFinishDate(task.finishDate)}</span>
				</div>
			</div>
			)
	}

	getFinishDate(date) {
		let d = this.createDate
		let year = d.getFullYear()
		let mouth = d.getMonth() + 1
		let day = d.getDate()
		let hour = d.getHours()
		let minute = d.getMinutes()
		if (year === date[0] && mouth === date[1] && day === date[2]) return date[3] + ':' + date[4]
		if (year === date[0] && mouth === date[1] && day === date[2] + 1) return '昨天'
		return date[0] + '-' + date[1] + '-' + date[2]
	}

	shouldComponentUpdate() {
		return false
	}

	selectFinishItem(e) {
		let event = e.nativeEvent
		this.props.select('finish', this.props.task.uuid, this.isSelected, null, event)
	}
}

export default FinishTaskRow