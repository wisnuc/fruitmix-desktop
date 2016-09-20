/**
 * @component Collection
 * @description Collection
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import {Tabs, Tab} from 'material-ui/Tabs';
// import Component 

class Collection extends Component {
	render() {
		let t = this.props.state.transmission;
		let uploadList = [];
		let downloadList = [];
		t.upload.forEach(item=>{
			if (item.type == 'folder') {
				uploadList.push(
					<tr>
						<td title={item.name}>{item.name}</td>
						<td></td>
						<td>{item.status}</td>
					</tr>
					);
			}else {
				item.data.forEach(item1=>{
					uploadList.push(
						<tr key={item1.name+item1.uploadTime}>
							<td title={item1.name}>{item1.name}</td>
							<td>{this.getSize(item1.size)}</td>
							<td>{this.getStutus(item1.status)}</td>
						</tr>
						);
				});
			}
			
		})
		t.download.forEach(item=>{
			if (item.type == 'folder') {
				downloadList.push(
					<tr>
						<td key={item.data.name}>{item.data.name+' (文件夹)'}</td>
						<td></td>
						<td>{item.status}</td>
					</tr>
					);
			}else {
				item.data.forEach(item1=>{
					downloadList.push(
						<tr key={item1.name+item1.downloadTime}>
							<td title={item1.name}>{item1.name}</td>
							<td>{this.getSize(item1.size)}</td>
							<td>{this.getStutus(item1.status)}</td>
						</tr>
					);
				});	
			}
		})
		return (
			<div className='transmission-container'>
				<Tabs tabItemContainerStyle={{backgroundColor:'#f3f3f3',color:'#9a9a9a'}} inkBarStyle={{marginLeft:'12.5%',width:'25%',backgroundColor:'red'}}>
					<Tab label='上传队列' style={{color:'#404040',fontSize:'14px'}}>
						<table className="fileTable">
							<thead>
								<tr>
									<th>文件名称</th>
									<th>大小</th>
									<th>状态</th>
								</tr>
							</thead>
							<tbody>
							{uploadList}
							</tbody>
						</table>
						
					</Tab>
					<Tab label='下载队列' style={{color:'#000'}}>
						<table className="fileTable">
							<thead>
								<tr>
									<th>文件名称</th>
									<th>大小</th>
									<th>状态</th>
								</tr>
							</thead>
							<tbody>
							{downloadList}
							</tbody>
						</table>
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

export default Collection;