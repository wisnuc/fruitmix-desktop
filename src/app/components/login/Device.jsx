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
import {orange500, blue500} from 'material-ui/styles/colors';
//import svg
import svg from '../../utils/SVGIcon';

class Device extends React.Component {
	constructor(props) {
        super(props);
        let index = 0;
        
    	if(this.props.item.fruitmix == 'INITIAL' ) {
    		index = 1;
    	}else if (this.props.item.fruitmix == 'INITIALIZED') {
    		index = 2;
    	}else{
    		index = 0;
    	}
        this.state = { show: false, stepIndex:index };
    }

    componentWillReceiveProps(nextProps) {
    	if (nextProps.item.fruitmix == 'INITIALIZED') {
    		this.setState({
    			stepIndex:2
    		});
    	}else if(nextProps.item.fruitmix == 'INITIAL') {
    		this.setState({
    			stepIndex:1
    		});
    	}else {
    		this.setState({
    			stepIndex:0
    		});
    	}
    }

	render() {
		let item = this.props.item;
		let stepIndex = this.state.stepIndex;
		let content = null;
		if (this.state.show) {
			content = (
				<div className='add-device-detail'>
					<Stepper activeStep={stepIndex}>
          				<Step>
            				<StepLabel>WISNUC服务器设置</StepLabel>
          				</Step>
          				<Step>
            				<StepLabel>注册FruitMix管理员</StepLabel>
          				</Step>
          				<Step>
            				<StepLabel>配置成功</StepLabel>
          				</Step>
        			</Stepper>
        			
        			<div>
        				{this.getStepContent(stepIndex)}
        			</div>
				</div>
				);
		}
		let allOk = this.props.item.fruitmix=="INITIALIZED"
		let text = allOk?'':'(未配置)';
		let del = null;
		if (this.props.item.isCustom) {
			allOk = true;
			text = null;
			del = <span className='delete-server' onClick={this.delServer.bind(this)}>删除</span>
		}else {
			del = <span>{this.props.item.address}</span>
		}
		return (
			<div>
				<div className={allOk?'add-device-list':'add-device-list hover'} onClick={allOk?null:this.toggleDetail.bind(this)}>
					<span>{item.host}{text}</span>{del}
				</div>
				{content}
			</div>
			)
	}

	getStepContent(stepIndex) {
		let c = null;
		let item = this.props.item;
		const styles = {
  errorStyle: {
    color: orange500,
  },
  underlineStyle: {
    borderColor: orange500,
  },
  floatingLabelStyle: {
    color: orange500,
  },
  floatingLabelFocusStyle: {
    color: blue500,
  },
};
		switch (stepIndex) {
			case 0:
				return (
					<div>
						<div className='fruitmix-detail'>
							<div>1.设置磁盘卷</div>
							<div>2.启动FruitMix(WISNUC服务端)</div>
							<div>FruitMix状态 :{item.fruitmix?' 启动':' 未启动'}</div>
						</div>
						
						<FlatButton className='fruitmix-button' label="启动FruitMix" onTouchTap={this.createFruitmix.bind(this)}/>
						
					</div>
					);
			case 1:
				let admin = this.props.item.admin;
				return (
					<div className='register-admin-container'>
					{!admin && <TextField underlineStyle={{borderColor:'#999'}} underlineFocusStyle={styles.underlineStyle} hintStyle={{color:'#999'}} ref='username'  stype={{marginBottom: 10}} hintText="用户名" type="username" fullWidth={false} />}
					{!admin && <TextField underlineStyle={{borderColor:'#999'}} underlineFocusStyle={styles.underlineStyle} hintStyle={{color:'#999'}} onKeyDown={this.keyDown.bind(this)} ref='password' stype={{marginBottom: 10}} hintText="密码" type="password" fullWidth={false} />}
					{!admin && <FlatButton style={{marginTop: 10}} label='注册' onTouchTap={this.register.bind(this)} />}
					{admin && <div style={{marginBottom:'15px'}}>管理员帐号已存在</div>}
					</div>
					);
			case 2:
				return (
					<div>
						<div>配置成功，请返回登录</div>
						<div style={{marginBottom:'15px'}}>设备IP : {item.address}</div>
					</div>
					);
		}
	}

	componentDidMount() {

	}

	toggleDetail() {
		this.setState({
			show: !this.state.show
		});
	}

	createFruitmix() {
		ipc.send('createFruitmix',this.props.item);
	}

	keyDown(e) {
		if (e.nativeEvent.which == 13) {
			this.register();
		}
	}

	register() {
		let s = 'http://'+this.props.item.address+':3721';
		let username = this.refs.username.input.value;
		let password = this.refs.password.input.value;
		ipc.send('userInit',s,username,password,this.props.item);
	}

	delServer() {
		ipc.send('delServer',this.props.item);
	}
}

export default Device