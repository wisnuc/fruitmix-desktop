/**
 * @component uploadTable
 * @description uploadTable
 * @time 2016-11-8
 * @author liuhua
 **/
  'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react'
import { connect } from 'react-redux'
// import Component 

class UploadTable extends Component {
	render() {
		return (
			<div>
				<table className="fileTable">
					<thead>
						<tr>
							<th>文件名称</th>
							<th>大小</th>
							<th>状态</th>
						</tr>
					</thead>
					<tbody>
					</tbody>
				</table>
			</div>
		)
	}
}

var mapStateToProps = (state)=>({
	transimission: state.transimission,
})

export default connect(mapStateToProps)(UploadTable)