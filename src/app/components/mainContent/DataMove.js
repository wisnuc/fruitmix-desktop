/**
 * @component dataMove
 * @description dataMove
 * @time 2016-5-30
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 import Row from './MoveRow'

 class Setting extends Component {
 	render() {

 		var sambaArr = []
 		var userArr = []
 		this.props.state.moveData.data.forEach(item => {
 			c.log(item.path.indexOf('nobody'))
 			if (item.path.indexOf('nobody') == -1) {
				userArr.push(item)
			}else {
				sambaArr.push(item)
			}
 		})
 		var sambaDOM = null
 		if (sambaArr.length != 0) {
 			sambaDOM= <tr>
							<th>共享文件夹</th>
							<th></th>
							<th className='hoverLight' onClick={this.move.bind(this,sambaArr)}>迁移</th>
						</tr>
 		}
 		return (
 			<div className='data-move-container'>
	 			<table className="fileTable hasCheckBox datamovetable">
					{/*table header*/}
					<thead>
						<tr>
							<th>数据文件</th>
							<th>路径</th>
							<th>迁移</th>
						</tr>
					</thead>
					{/*table body*/}
					<tbody>
						{
							userArr.map((item,index)=>{
								return <Row key={item.name} item={item} samba={true}></Row>
							})
						}
						{sambaDOM}
					</tbody>
				</table>
 			</div>
 			)
 	}

 	move(path) {
 		path.forEach(item => {
				ipc.send('move-data',item.path)
			})
 	}
 }


export default Setting;