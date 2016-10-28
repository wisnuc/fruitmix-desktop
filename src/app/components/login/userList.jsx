/**
 * @component Index
 * @description loginComponent
 * @time 2016-10-23
 * @author liuhua
**/

// require core module
import React, { findDOMNode, Component, PropTypes } from 'react'
//require material
import { FlatButton } from 'material-ui'
//import Action
import Action from '../../actions/action'

class UserList extends React.Component {
	constructor(props) {
		super(props)
		this.state = {index:-1,userList:false}
	}

	selectUser(index,event) {
		this.setState({
			index:index,
			userList:false
		})
	}

	backList() {
		this.setState({
			index: -1
		})
	}

	openUserList() {
		this.setState({userList:true})
	}

	submit() {
		let username = this.props.device.users[this.state.index].username
		let password = this.refs.password.value
		// ipc.send('login','Alice','123456')
		// ipc.send('login','Bob','123456')
		ipc.send('login',username,password)
	}

	kenDown(e) {
		if (e.nativeEvent.which == 13) {
			this.submit()
		}
	}

	render() {
		return (
			<div >
				{this.getContent()}
			</div>
			)
	}

	getContent() {
		let {users} = this.props.device
		let {index} = this.state
		if (this.state.userList) {
			return(
				<div className='login-large-userList'>
					{users.map((item,i) => {
						return (
							<div className='login-userIcon' onClick={this.selectUser.bind(this,i)} key={item.username}>
								<span style={{backgroundColor:item.color}}>{item.username.charAt(0)}</span>
								<span>{item.username}</span>
							</div>
							)
					})}
				</div>
				)
		}
		if (this.state.index == -1) {
			return (
				<div className='login-footer-userList'>
					{users.map((item,i) => {
						if (i == 4) {
							return (
								<div key='moreUsers' className='login-users-more' onClick={this.openUserList.bind(this)}>...</div>
								)
						}
						if (i > 4) {
							return null
						}
						return (
							<div className='login-userIcon' onClick={this.selectUser.bind(this,i)} key={item.username}>
								<span style={{backgroundColor:item.color}}>{item.username.charAt(0)}</span>
								<span>{item.username}</span>
							</div>
							)
					})}
				</div>
				)
		}else {
			return (
				<div className='login-footer-userSelected'>
					<div className='login-userIcon'>
						<span style={{backgroundColor:users[index].color}}>{users[index].username.charAt(0)}</span>
						<span></span>
					</div>
					<div className='login-password-container'>
						<span>{users[index].username}</span>
						<input onKeyDown={this.kenDown.bind(this)} className='login-password' type="password" ref='password' placeholder='密码'/>
					</div>
					<div className='login-submit-button' onClick={this.submit.bind(this)}>登录</div>
					<div className='login-cancel-button' onClick={this.backList.bind(this)}>返回</div>
				</div> 
				)
		}
	}

	componentWillReceiveProps(nextProps) {
		c.log(nextProps)
		if (this.props.device.address != nextProps.device.address) {
			console.log('not equal')
			this.setState({
				index : -1
			})
		}
	}
}

export default UserList