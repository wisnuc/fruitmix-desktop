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
		return (
			<div>
				<div onClick={this.toggleChildren.bind(this)}>
					<span>{item.abspath}</span>
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
		c.log(this.state)
		this.setState({
			open : !this.state.open
		})
	}

	getChildren() {
		// if (this.props.item.children && this.props.item.children.length != 0) {
		// 	return this.props.item.children.map(item1 => {
		// 		return <UploadTable item={item1}/>
		// 	})
		// }else {
		// 	return null
		// }
		// c.log(this.props.item.abspath)
		// c.log(this.state.open)
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
}



export default UploadTable