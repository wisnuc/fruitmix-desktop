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
		this.state = {index:0}
	}

	render() {
		return (
			<div>{this.state.index}</div>
			)
	}
}

export default UserList