/**
 * @component uploadFrame
 * @description upload
 * @time 2017-2-28
 * @author liuhua
**/
import React, { Component } from 'react'
import Row from './newUploadRow'


class Upload extends Component {
	constructor() {
		super()
	}
	
	render() {
		let transmission = window.store.getState().transmission
		let userTasks = transmission.userTasks
		let finishTasks = transmission.finishTasks
		return (
			<div id='trs-wrap'>
				<div className='trs-title'>上传中</div>
				<div className='trs-hr'></div>
				<div className='trs-list-wrapper'>
					{userTasks.map((task) => {
						return <Row key={task.uuid} task={task}/>
					})}
				</div>
				<div className='trs-title'>已完成</div>
				<div className='trs-hr'></div>
				<div className='trs-list-wrapper'>
					{finishTasks.map((task) => {
						return <Row key={task.uuid} task={task}/>
					})}
				</div>
			</div>
			)
	}
}

export default Upload
