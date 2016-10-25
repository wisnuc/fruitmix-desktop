/**
 * @component Index
 * @description loginComponent
 * @time 2016-10-23
 * @author liuhua
**/

// require core module
import React, { findDOMNode, Component, PropTypes } from 'react'
//import Action
import Action from '../../actions/action'

class UserList extends React.Component {
	constructor(props) {
		super(props)
		this.state = {index:-1}
	}

	render() {
		let content
		if (this.state.index) {
			
		}
		return (
			<div>
				{content}
			</div>
			)
	}
}

export default UserList