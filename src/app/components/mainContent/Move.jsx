/**
 * @component MoveDialog
 * @description MoveDialog
 * @time 2016-6-23
 * @author liuhua
**/
'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
import { connect } from 'react-redux';
//material
import { SvgIcon } from 'material-ui'
//import Action
import Action from '../../actions/action';
import svg from '../../utils/SVGIcon';

class Move extends Component {
	render() {
		let left = this.props.navigation.menu?this.props.isShow.move.x-220:this.props.isShow.move.x-20;
		let top = this.props.isShow.move.y-120;  
		let scroll = !!document.getElementsByClassName('file-area')[0]?document.getElementsByClassName('file-area')[0].scrollTop:0
		const style = {
			display: this.props.isShow.move.open==false?'none':'block',
			top:top+scroll,
			left:left,
		}
		if (this.props.tree.isNull) {
			return null
		}
		return (
			<div style={style} className='move-dialog'>
				<div className='move-title'>
					<SvgIcon style={{marginLeft:'14px',cursor:'pointer'}} onClick={this.moveSelect.bind(this,this.props.tree.parent)}>{svg['back']()}</SvgIcon>
					<span className='move-title-name'>{this.props.tree.name}</span>
					<SvgIcon className='move-close' onClick={this.closeMove.bind(this)}>{svg['close']()}</SvgIcon>
				</div>
				<div className='move-content'>
					<div className='move-list-container'>
						{this.props.tree.children.map(item=>
							<div className={item.checked?'move-list-selected move-list':'move-list'} key={item.uuid}>
								<span className='move-folder-icon'></span>
								<span>{item.name}</span>
								<span className='moveEnter'{this.shouldEnter.bind(this,item)} onClick={this.moveSelect.bind(this,item.uuid)}></span>
							</div>
						)}
					</div>
					<div className='move-button-container'>
						<div className={this.props.tree.uuid==this.props.data.directory.uuid?'move-botton move-botton-disable':'move-botton'} onClick={this.move.bind(this)}>move</div>
					</div>
				</div>
			</div>
			)
	}

	closeMove() {
		this.props.dispatch(Action.closeMove());
	}

	moveSelect(uuid) {
		ipc.send('getTreeChildren',uuid);
	}

	move() {
		if (this.props.tree.uuid==this.props.data.directory.uuid) {
			return false
		}
	}
}

function mapStateToProps(state) {
	return {
		isShow: state.isShow,
		navigation: state.navigation,
		tree: state.tree,
		data:state.data
	}
}
export default connect(mapStateToProps)(Move);