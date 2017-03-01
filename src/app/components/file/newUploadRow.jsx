/**
 * @component uploadRow
 * @description upload
 * @time 2017-2-28
 * @author liuhua
**/
import React, { Component } from 'react'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'
import FolderSvg from 'material-ui/svg-icons/file/folder'

const normalStyle = {}
const selectStyle = {backgroundColor:'#f4f4f4'}
class UploadRow extends Component {
	constructor() {
		super()
		this.state = {checked: false}
	}

	componentDidMount() {

	}

	render() {
		let task = this.props.task
		let s = this.state.checked? normalStyle: selectStyle
		return (
			<div className='trs-row' style={s} onClick={this.select.bind(this)}>
				<div className='trs-row-name'>
					<span>
						{
							task.type=='folder'?<FolderSvg style={{color: '#000', opacity: 0.54}}/>:
							<FileSvg style={{color: '#000', opacity: 0.54}}/>
						}
					</span>
					<span>{task.name}</span>
				</div>
				<div className='trs-row-rtime'>00:00:00</div>
				<div className='trs-row-progress'>50%</div>
				<div className='trs-row-tool'>...</div>
			</div>
		)
	}

	select() {
		this.setState({
			checked: !this.state.checked
		})
	}
}

export default UploadRow
