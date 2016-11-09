/**
 * @component Collection
 * @description Collection
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {Tabs, Tab} from 'material-ui/Tabs'
import UploadTable from './UploadTable'
import DownloadTable from './DownloadTable'
// import Component 

class Collection extends Component {
	render() {
		return (
			<div className='transimission-container'>
				<Tabs tabItemContainerStyle={{backgroundColor:'#f3f3f3',color:'#9a9a9a'}} inkBarStyle={{marginLeft:'12.5%',width:'25%',backgroundColor:'red'}}>
					<Tab label='上传队列' style={{color:'#404040',fontSize:'14px'}}>
						<div className='transimissionRow'>
							<span>名称</span>
							<span>状态</span>
							<span>进度</span>
						</div>
						{this.props.transimission.upload.map(task => {
							return (
								<div>
									{task.roots.map(item => {
										return <UploadTable isRoot={true} key={item.target+item.abspath} item={item}/>
									})}
								</div>
								)
						})}
						
						
					</Tab>
					<Tab label='下载队列' style={{color:'#000'}}>
						<DownloadTable/>
					</Tab>
				</Tabs>
			</div>
		)
	}

	getSize(size) {
		size = parseFloat(size);
		if (size < 1024) {
			return size.toFixed(2)+' B'
		}else if (size < 1024*1024) {
			return (size/1024).toFixed(2)+' KB'
		}else if(size<1024*1024*1024) {
			return (size/1024/1024).toFixed(2)+ ' M'
		}else {
			return (size/1024/1024/1024).toFixed(2)+ ' G'
		}
	}

	getStutus(status) {
		if (status == 0) {
			return '准备'
		}else if (status == 1) {
			return '已完成'
		}else if (status == 1.01) {
			return '失败'
		}else if ((typeof status) == 'string' ){
			return status
		}else {
			return (status*100).toFixed(2)+' %'
		}
	}
}

var mapStateToProps = (state)=>({
	transimission: state.transimission,
})

export default connect(mapStateToProps)(Collection)