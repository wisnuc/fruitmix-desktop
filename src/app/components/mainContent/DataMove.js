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
 			if (item.name.indexOf('nobody') == -1) {
				userArr.push(item)
			}else {
				sambaArr.push(item)
			}
 		})
 		var sambaDOM = null
 		if (sambaArr.length != 0) {
 			sambaDOM= <Row item={{name:'共享文件夹',path:sambaArr}} samba={false}></Row>
 		}
 		return (
 			<div className='data-move-container'>
	 			<table className="fileTable hasCheckBox datamovetable">
					{/*table header*/}
					<thead>
						<tr>
							<th>数据文件</th>
							<th>路径</th>
							<th>操作</th>
						</tr>
					</thead>
					{/*table body*/}
					<tbody>
						{
							userArr.map((item,index)=>{
								return <Row item={item} samba={true}></Row>
							})
						}

						{sambaDOM}
					</tbody>
				</table>
 			</div>
 			)
 	}
 }


export default Setting;