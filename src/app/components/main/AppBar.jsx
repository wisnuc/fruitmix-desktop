/**
 * @component Main content
 * @description main interface
 * @time 2016-4-28
 * @author liuhua
 **/
  'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import CSS from '../../utils/transition'
// import Component
import { AppBar, Toolbar, TextField, Drawer, Paper, Snackbar, FlatButton, IconMenu, MenuItem, IconButton, Dialog } from 'material-ui'
import Users from './userDialog';
import svg from '../../utils/SVGIcon'
import Action from '../../actions/action'

class Bar extends Component {

	constructor(props) {
        super(props);
        this.state = { userDialog: false};
    }

	render() {
		return (
      <div>
        {/*
        <AppBar style={{backgroundColor: 'white'}} id = 'global-appbar' title='WISNUC'>
          <Toolbar />
        </AppBar> */}

        <Paper style={{width: '100%', height:64}} />
        <Paper style={{width: '100%', height:56, backgroundColor: '#FAFAFA'}} />
        {/*
        iconElementRight={
          <IconMenu
            className='app-bar-right'
                  iconButtonElement={<IconButton>{svg.expandMore()}</IconButton>}
                  anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
              >
                {this.getList()}
                <MenuItem value="2" primaryText="注销" onTouchTap={this.logOff.bind(this)}/>
              </IconMenu>} */}
        {/* onLeftIconButtonTouchTap={this.leftNavClick.bind(this)} */}
        {/* <div className='app-bar-username'>{this.props.login.obj.username}</div> */}
        {/* <div className='app-bar-appifi' onClick={this.openAppifi.bind(this)}></div> */}
        {/* this.getUserManager() */}
      </div>
		)
	}

	getList() {
		let list = null;
		var name = this.props.login.obj.username;
		//let index = this.props.login.obj.allUser.findIndex(item=>(item.username == name));
    let index = this.props.node.server.users.findIndex(item => item.username === name)
    // console.log(this.props)
    // if (!this.props.server || !this.props.server.server) return null // dirty fix FIXME
    // let index = this.props.server.server.loginUsers.findIndex(usr => usr.username === name)
		// if ( this.props.login.obj.allUser[index].isAdmin) {
    if (this.props.node.server.users[index].isAdmin) {
			list = (<MenuItem value="1" primaryText="用户管理" onTouchTap={this.toggleUser.bind(this)}/>)
		}

		return list
	}

	getUserManager() {
		if (!this.state.userDialog) {
			return null
		}else {
			let folderActions = [
			<FlatButton
				label="取消"
				primary={true}
				onTouchTap={this.toggleUser.bind(this)}
				labelStyle={{color:'#000',fontSize:'15px'}}
			/>
			]
			return (
				<Dialog title="用户管理"
					titleClassName='create-folder-dialog-title'
					actions={folderActions}
					modal={false}
					open={this.state.userDialog}
					className='create-folder-dialog'>
					<Users login={this.props.login}></Users>
			    </Dialog>
				)
		}
	}

	//toggle left navigation
	leftNavClick() {
		this.props.dispatch(Action.navToggle());
	}

	openAppifi() {
		ipc.send('openAppifi')
	}

	logOff() {
		ipc.send('loginOff');
		// this.props.dispatch(Action.loginoff());
		window.location.hash = '/login';
	}

	toggleUser() {
		this.setState({
			userDialog: !this.state.userDialog
		});
	}

	componentWillReceiveProps() {
		c.log('app bar receive new props')
	}
}

var mapStateToProps = (state)=>({
    login: state.login,
    node: state.node   
  })

export default connect(mapStateToProps)(Bar)
