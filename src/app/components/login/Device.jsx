/**
 * @component Index
 * @description 查找设备
 * @time 2016-7-11
 * @author liuhua
 **/
 'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
//import material 
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {TextField} from 'material-ui';
//import svg
import svg from '../../utils/SVGIcon';

class Device extends React.Component {
	constructor(props) {
        super(props);
        this.state = { show: false, stepIndex:0 };
    }

	render() {
		let item = this.props.item;
		let haveDetail;
		let stepIndex = this.state.stepIndex;
		if (item.isCustom) {
			haveDetail = null;
		}else {
			haveDetail = (
				<span className='add-device-detail-icon' onClick={this.toggleDetail.bind(this)}>{svg.settings()}</span>
				);
		}

		let content = null;
		if (this.state.show) {
			content = (
				<div className='add-device-detail'>
					<Stepper activeStep={stepIndex}>
          				<Step>
            				<StepLabel>启动fruitmix</StepLabel>
          				</Step>
          				<Step>
            				<StepLabel>注册管理员</StepLabel>
          				</Step>
          				<Step>
            				<StepLabel>欢迎使用</StepLabel>
          				</Step>
        			</Stepper>
        			
        			<div>
        				{this.getStepContent(stepIndex)}
        				<FlatButton label="上一步" disabled={stepIndex === 0} onTouchTap={this.handlePrev.bind(this)} style={{marginRight: 12}}/>
            			<RaisedButton label="下一步" disabled={stepIndex === 2} primary={true} onTouchTap={this.handleNext.bind(this)}/>
        			</div>
				</div>
				);
		}
		return (
			<div>
				<div className='add-device-list'>
					<span>{item.host}</span>
					{haveDetail}
				</div>
				{content}
			</div>
			)
	}

	componentDidMount() {
		ipc.send('getUserList',this.props.item);
	}

	toggleDetail() {
		this.setState({
			show: !this.state.show
		});
	}

	handlePrev() {
		let stepIndex = this.state.stepIndex;
	    if (stepIndex > 0) {
	      	this.setState({stepIndex: stepIndex - 1});
	    }
	}

	handleNext() {
	    let stepIndex = this.state.stepIndex;
	    if (stepIndex < 2) {
	   		this.setState({stepIndex: stepIndex + 1});
	    }
	}

	getStepContent(stepIndex) {
		let c = null;
		let item = this.props.item;
		console.log(item.fruitmix);
		switch (stepIndex) {
			case 0:
				return (
					<div>
						<span>fruitmix状态 :{item.fruitmix?' 启动':' 未启动'}</span>
						<FlatButton label="启动fruitmix" disabled={item.fruitmix} onTouchTap={this.createFruitmix.bind(this)}/>
						{/*<FlatButton label="刷新状态" onTouchTap={this.refreshFruitmix.bind(this)}/>*/}
					</div>
					);
			case 1:
				return (
					<div className='register-admin-container'>
					<TextField ref='username'  stype={{marginBottom: 10}} hintText="用户名" type="username" fullWidth={false} />
					<TextField onKeyDown={this.kenDown.bind(this)} ref='password' stype={{marginBottom: 10}} hintText="密码" type="password" fullWidth={false} />
					<FlatButton style={{marginTop: 10}} label='注册' onTouchTap={this.register.bind(this)} />
					</div>
					);
			case 2:
				return (
					<div>
						<div>设备IP : {item.addresses[0]}</div>
					</div>
					);
		}
	}

	refreshFruitmix() {
		ipc.send('findFruitmix',this.props.item);
	}

	createFruitmix() {
		ipc.send('createFruitmix',this.props.item);
	}

	kenDown() {

	}

	register() {
		let s = 'http://'+this.props.item.addresses+':'+this.props.item.port;
		let username = this.refs.username.input.value;
		let password = this.refs.password.input.value;
		ipc.send('userInit',s,username,password);
	}
}

export default Device