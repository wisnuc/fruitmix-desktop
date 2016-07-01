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

	constructor(props) {
        super(props);
        this.state = { deleteShow: false };
    }
	render() {
		console.log(this);
		return (
			<div className='shared-files-container'>
				<div onClick={this.backRoot}>back root</div>
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
							<TableRow key={item.uuid} onDoubleClick={this.enterShare.bind(this,item)}>
								<TableRowColumn>{item.name}</TableRowColumn>
								<TableRowColumn>{this.getShareUser(item.owner)}</TableRowColumn>
								<TableRowColumn>
									<span onClick={this.download.bind(this,item)} style={{cursor:'pointer'}}>
										{svg.download()}
									</span>
									<span>删除</span>
								</TableRowColumn>
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

	download(item) {
		this.props.dispatch(Action.addDownload(item));
		ipc.send('download',item);	
	}

	enterShare(item) {
		console.log(item);
		if (item.type == 'folder') {
			ipc.send('enterShare',item);
		}
	}

	backRoot() {
		ipc.send('backShareRoot');
	}
}

function mapStateToProps (state) {
	return {
		data: state.data,
		login:state.login
	}
}

export default connect(mapStateToProps)(SharedFiles);