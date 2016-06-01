/**
 * @component AllFilesTable
 * @description AllFilesTable
 * @time 2016-5-6
 * @author liuhua
 **/
 'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
import { connect, bindActionCreators } from 'react-redux';
//import Action
import Action from '../../actions/action';
import svg from '../../utils/SVGIcon';


class AllFilesTable extends Component {
	render() {
		var _this = this;
		return (
			<table className="allFileTable">
				<thead>
					<tr>
						<th onClick={this.selectAllChildren.bind(this)}>
							<div className='selectBox' >
								<div>{this.props.data.selectAll?svg.select():svg.blackFrame()}</div>
								<div></div>
								<div></div>
							</div>
						</th>
						<th>名称</th>
						<th>修改时间</th>
						<th>大小</th>
					</tr>
				</thead>
				<tbody>
					{this.props.data.children.map((item,index)=>{
						return (
							<tr key={index} onTouchTap={_this.selectChildren.bind(_this,index)} onDoubleClick={_this.enterChildren.bind(_this,index)} 
							className={item.checked==true?'tr-selected-background':''}>
								<td onClick={this.addBezier.bind(this,index)} data-selected={item.checked} className='first-td'>
									<div className='selectBox'>
										<div>{item.checked==false?svg.blackFrame():svg.select()}</div>
										<div className='bezierFrame' style={{width:48,height:48}}>
											<div className="bezierTransition1"></div>
											<div className="bezierTransition2"></div>
										</div>
										<div></div>
									</div>
								</td>
								<td title={item.attribute.name}><div data-uuid={item.uuid}><span className={'file-type-icon '+this.getTypeOfFile(item)}></span><span className='file-name'>{item.attribute.name}</span></div></td>
								<td title={item.attribute.changetime}>{this.getTime(item.attribute.changetime)}</td>
								<td title={item.attribute.size}>{this.getSize(item.attribute.size)}</td>
							</tr>
							)
					})}
				</tbody>
			</table>
			)
		}

	enterChildren (rowNumber) {
		//bezier 
		$('.bezierFrame').empty().append('<div class="bezierTransition1"></div><div class="bezierTransition2"></div>');

		var children = this.props.data.children;
		if (children[rowNumber] && children[rowNumber].type == 'folder') {
			ipc.send('enterChildren',children[rowNumber]);
		}
	}

	selectChildren (rowNumber,e) {
		//bezier
		if (this.props.data.children[rowNumber].checked == true) {
			this.bez1(rowNumber);
		}else {
			this.bez2(rowNumber);
		}
		if (e.nativeEvent.button == 2) {
			//right click
			let x = e.nativeEvent.pageX;
			let y = e.nativeEvent.pageY;
			if (this.props.data.children[rowNumber].checked == false) {	
				this.props.dispatch(Action.toggleMenu([this.props.data.children[rowNumber]],x,y,false));
			}else {
				this.props.dispatch(Action.toggleMenu([this.props.data.children[rowNumber]],x,y,true));
			}
		}else {
			//left click
			this.props.dispatch(Action.selectChildren(rowNumber));	
		}
		
	}

	addBezier (rowNumber) {
		if (this.props.data.children[rowNumber].checked == false) {
			this.bez2(rowNumber);
			$('tbody>tr:eq('+rowNumber+') .bezierFrame').children('.bezierTransition1').addClass('open');
		}else {
			this.bez1(rowNumber);
			$('tbody>tr:eq('+rowNumber+') .bezierFrame').children('.bezierTransition2').addClass('open');
			
		}
	}
	bez1 (rowNumber) {
		$('tbody>tr:eq('+rowNumber+') .bezierFrame').children('.bezierTransition1').remove();
		$('tbody>tr:eq('+rowNumber+') .bezierFrame').append('<div class="bezierTransition1"></div>');
	}

	bez2 (rowNumber) {
		$('tbody>tr:eq('+rowNumber+') .bezierFrame').children('.bezierTransition2').remove();
		$('tbody>tr:eq('+rowNumber+') .bezierFrame').append('<div class="bezierTransition2"></div>');
	}

	selectAllChildren() {
 		this.props.dispatch(Action.selectAllChildren());
	}

	getTime(date) {
		let t = date.indexOf('T');
		let d = date.substring(0,t);
		let time = date.substring(t+1,t+9);
		return  d+' '+time;
	}

	getSize(size) {
		size = parseFloat(size);
		if (size < 1024) {
			return size.toFixed(2)+' B'
		}else if (size < 1024*1024) {
			return (size/1024).toFixed(2)+' KB'
		}else if(size<1024*1024*1024) {
			return (size/1024/1024).toFixed(2)+ ' M'
		}else {
			return (size/1024/1024/1024).toFixed(2)+ ' G'
		}
	}

	getTypeOfFile(file){
		if (file.type == 'folder') {
			return 'folder'
		}

		let arr = [
		{type:'txt',reg: new RegExp("^.*\\.txt$")},
		{type:'doc',reg:new RegExp("^.*\\.doc$")},
		{type:'docx',reg:new RegExp("^.*\\.docx$")},
		{type:'wps',reg:new RegExp("^.*\\.wps$")},
		{type:'ppt',reg:new RegExp("^.*\\.ppt$")},
		{type:'pptx',reg:new RegExp("^.*\\.pptx$")},
		{type:'xls',reg:new RegExp("^.*\\.xls$")},
		{type:'psd',reg:new RegExp("^.*\\.psd$")},
		{type:'pdf',reg:new RegExp("^.*\\.pdf$")},
		{type:'jpg',reg:new RegExp("^.*\\.jpg$")},
		{type:'png',reg:new RegExp("^.*\\.png$")},
		{type:'gif',reg:new RegExp("^.*\\.gif$")},
		{type:'mp3',reg:new RegExp("^.*\\.mp3$")},
		{type:'mp4',reg:new RegExp("^.*\\.mp4$")}
		];

		for (let i =0;i<arr.length;i++) {
			if (arr[i].reg.test(file.attribute.name)) {
				return arr[i].type
			}
		}
		return 'file'
	}
}

function mapStateToProps (state) {
	return {
		data: state.data
	}
}

export default connect(mapStateToProps)(AllFilesTable);