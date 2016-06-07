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
 //import Action
import Action from '../../actions/action';

// import Component 

class SharedFiles extends Component {
	render() {
		return (
			<div className='shared-files-container'>
				<Table selectable={false}>
					<TableHeader displayRowCheckbox={false}>
							<TableRow>
								<TableHeaderColumn>1</TableHeaderColumn>
								<TableHeaderColumn>1</TableHeaderColumn>
							</TableRow>
						</TableHeader>
					<TableBody displayRowCheckbox={false}>
						{this.props.data.shareChildren.map((item)=>{return (
							<TableRow>
								<TableRowColumn>{item.name}</TableRowColumn>
								<TableRowColumn>{item.name}</TableRowColumn>
							</TableRow>
							)})}
					</TableBody>
				</Table>
			</div>
		)
	}
}

function mapStateToProps (state) {
	return {
		data: state.data
	}
}

export default connect(mapStateToProps)(SharedFiles);