/**
 * @component uploadRow
 * @description upload
 * @time 2017-2-28
 * @author liuhua
**/
import React, { Component } from 'react'


class UploadRow extends Component {
	constructor() {
		super()
	}

	componentDidMount() {

	}

	render() {
		let task = this.props.task
		return (
			<div className='trs-row'>
				<span>{task.name}</span>
				<span>{task.size}</span>
				<span>123...</span>
			</div>
		)
	}
}

export default UploadRow
