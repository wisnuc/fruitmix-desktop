/**
 * @component SharedByMe
 * @description SharedByMe
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
import { connect, bindActionCreators } from 'react-redux';
// import Component 
import Action from '../../actions/action';
import svg from '../../utils/SVGIcon';	

class SharedByMe extends Component {
	render() {
		return (
			<div className='files-shared-byme-container'>
			<table className="fileTable">
				{/*table header*/}
				<thead>
					<tr>
						<th>名称</th>
						<th>分享给</th>
						<th>操作</th>
					</tr>
				</thead>
				{/*table body*/}
				<tbody>
					{
						this.props.data.filesSharedByMe.map((item,index)=>{
							if (index > this.props.data.showSize) {
								return false
							}
							return (
								<tr key={item.uuid}>
									<td title={item.name}>{item.name}</td>
									<td>{this.findUser(item)}</td>
									<td>
										<span onClick={this.cancelShare.bind(this,item)}>取消分享</span>
										{/*<span onClick={this.reShare.bind(this,item)}>重新分享</span>*/}
									</td>
								</tr>
							)
						})
					}
				</tbody>
			</table>
			</div>
		)
	}

	findUser(file) {
		c.log(file.writelist[0]);
		let users = '';
		let allUser = this.props.login.obj.allUser;
		file.writelist.forEach((item,index)=>{
			let i = allUser.findIndex(i=>i.uuid==item);
			if (i != -1) {
				if (index == file.writelist.length-1) {
					users += allUser[i].username;
				}else {
					users += allUser[i].username+',';
				}
				
			}
		});
		return users
	}

	cancelShare(item) {
		ipc.send('cancelShare',item);
	}

	reShare() {
		
	}

}

function mapStateToProps (state) {
	return {
		data: state.data,
		login: state.login
	}
}

export default connect(mapStateToProps)(SharedByMe);