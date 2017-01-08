/**
 * @component downloadFrame
 * @description download
 * @time 2016-12-6
 * @author liuhua
**/
//import core module
import React, { Component } from 'react'
//import file module
import DownloadTable from './DownloadTable'


class Upload extends Component {
	constructor() {
		super()
	}

	render() {
		return (
			<div className='transimission-container'>
				<div className='transimissionRow transimissionTitle'>
					<span></span>
					<span>名称</span>
					<span>大小</span>
					<span>进度</span>
				</div>
				{window.store.getState().transimission.download.map(task => {
					return (
						<div>
							{task.roots.map(item => {
								return <DownloadTable isRoot={true} key={item.uuid} item={item}/>
							})}
						</div>
						)
				})}
			</div>
			)
	}
}

export default Upload
