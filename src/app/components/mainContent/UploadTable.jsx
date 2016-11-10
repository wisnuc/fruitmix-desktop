/**
 * @component uploadTable
 * @description uploadTable
 * @time 2016-11-8
 * @author liuhua
 **/
  'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react'
// import Component 

class UploadTable extends Component {
	constructor() {
		super()
		this.state = {open:false}
	}
	render() {
		let item = this.props.item
		let classname = !!this.props.isRoot?'transimissionRoot':''
		return (
			<div className={classname}>
				<div className='transimissionRow' onClick={this.toggleChildren.bind(this)}>
					<span>{item.name}</span>
					<span>{item.state}</span>
					<span>{item.success}</span>
				</div>
				<div style={{paddingLeft:'30px'}}>
					{this.getChildren()}
				</div>
			</div>
		)
	}

	toggleChildren() {
		this.setState({
			open : !this.state.open
		})
	}

	getChildren() {
		let result
		if (!this.state.open || !this.props.item.children ) {
			return null
		}else {
			return this.props.item.children.map(item => {
				return <UploadTable key={item.target+item.abspath} item={item}/>
			})
		}
		return result
	}

	getState(state) {
		if (state == 'ready' || state == 'hashless') {
			return '准备'
		}else if (state == 'running') {
			return '上传中'
		}else if (state == 'hashing') {
			return '正在校验本地文件'
		}else if (false) {
			return ''
		}
		else {
			return state
		}
	}
}



export default UploadTable