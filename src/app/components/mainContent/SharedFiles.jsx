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
import Row from './ShareTableRow'

class SharedFiles extends Component {

	constructor(props) {
        super(props);
        this.state = { deleteShow: false };
    }
	render() {
		console.log(this);
		return (
			<div className='shared-files-container'>
				{/*<div onClick={this.backRoot}>back root</div>*/}
				<div className="breadcrumb"></div>
	
				<table className="fileTable">
					<thead>
						<tr>
							<th>文件名</th>
							<th>分享者</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						{this.props.data.shareChildren.map(item=>(
							<Row 
								key={item.uuid}
								item={item}
								getShareUser={this.getShareUser.bind(this)}
								download={this.download.bind(this.item)}
								enterShare={this.enterShare.bind(this,item)}
							></Row>
							))}
					</tbody>
				</table>
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