/**
 * @component SharedFiles
 * @description SharedFiles
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';
 import { connect, bindActionCreators } from 'react-redux';
 import { Table,TableHeader, TableHeaderColumn, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
 import svg from '../../utils/SVGIcon';
 //import Action
import Action from '../../actions/action';

// import Component 

class SharedFiles extends Component {
	render() {
		return (
			<div className='shared-files-container'>
				<Table selectable={false}>
					<TableHeader displaySelectAll={false} adjustForCheckbox={false}>
							<TableRow>
								<TableHeaderColumn>文件名</TableHeaderColumn>
								<TableHeaderColumn>分享者</TableHeaderColumn>
								<TableHeaderColumn>下载</TableHeaderColumn>
							</TableRow>
						</TableHeader>
					<TableBody displayRowCheckbox={false}>
						{this.props.data.shareChildren.map((item)=>{return (
							<TableRow key={item.uuid}>
								<TableRowColumn>{item.name}</TableRowColumn>
								<TableRowColumn>{this.getShareUser(item.owner)}</TableRowColumn>
								<TableRowColumn><span style={{cursor:'pointer'}}>{svg.download()}</span></TableRowColumn>
							</TableRow>
							)})}
					</TableBody>
				</Table>
			</div>
		)
	}

	getShareUser(item) {
		let user = this.props.login.obj.allUser.find((i)=>{return item == i.uuid});
		return user.username;
		console.log(user);
	}
}

function mapStateToProps (state) {
	return {
		data: state.data,
		login:state.login
	}
}

export default connect(mapStateToProps)(SharedFiles);