/**
 * @component AllFilesTable
 * @description AllFilesTable
 * @time 2016-5-6
 * @author liuhua
 **/
 'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
//import Action
import Action from '../../actions/action';
import svg from '../../utils/SVGIcon';
import Row from './TableRow';


class AllFilesTable extends Component {
	render() {
		var _this = this;
		return (
			<table className="fileTable hasCheckBox">
				{/*table header*/}
				<thead>
					<tr>
						<th onClick={this.selectAllChildren.bind(this)}>
							<div className='selectBox' >
								<div>{this.props.state.data.selectAll?svg.select():svg.blackFrame()}</div>
								<div></div>
								<div></div>
							</div>
						</th>
						<th>名称</th>
						<th>修改时间</th>
						<th>大小</th>
					</tr>
				</thead>
				{/*table body*/}
				<tbody>
					{
						this.props.state.data.children.map((item,index)=>{
							if (index > this.props.state.data.showSize) {
								return false
							}
							return (
								<Row dispatch={this.props.dispatch} data={this.props.state.data} index={index} item={item} key={index} selectChildren={this.selectChildren.bind(this)} enterChildren={this.enterChildren.bind(this)} getTypeOfFile={this.getTypeOfFile.bind(this)} getSize={this.getSize.bind(this)} getTime={this.getTime.bind(this)} addBezier={this.addBezier.bind(this)}></Row>
							)
						}
					)}
				</tbody>
			</table>
			)
		}
	componentDidMount() {
		this.bindWindowScrollEvent();
	}
	componentWillUnmount() {
		this.bindWindowScrollEvent({ isUnset:  true });
	}
	//bindScroll event
    bindWindowScrollEvent(options) {
        var isUnset = !!options && options.isUnset,
            scrollCallback = this.windowScrollCallback.bind(this);
        $('.all-files-container')[isUnset ? 'unbind' :  'click']('scroll', scrollCallback);
    }
    windowScrollCallback() {
        c.log(document.getElementsByClassName('file-area')[0].scrollTop);
    }
	//select all
	selectAllChildren() {
 		this.props.dispatch(Action.selectAllChildren());
	}
	//select files
	selectChildren (rowNumber,e) {
		//bezier
		// if (this.props.state.data.children[rowNumber].checked == true) {
		// 	this.bez1(rowNumber);
		// }else {
		// 	this.bez2(rowNumber);
		// }
		if (e.nativeEvent.button == 2) {
			//right click
			let x = e.nativeEvent.pageX;
			let y = e.nativeEvent.pageY;
			if (this.props.state.data.children[rowNumber].checked == false) {	
				this.props.dispatch(Action.toggleMenu([this.props.state.data.children[rowNumber]],x,y,false));
			}else {
				this.props.dispatch(Action.toggleMenu([this.props.state.data.children[rowNumber]],x,y,true));
			}
		}else {
			//left click
			this.props.dispatch(Action.selectChildren(rowNumber));	
		}
		
	}
	//double click
	enterChildren (rowNumber) {
		//bezier 
		$('.bezierFrame').empty().append('<div class="bezierTransition1"></div><div class="bezierTransition2"></div>');

		var children = this.props.state.data.children;
		if (children[rowNumber] && children[rowNumber].type == 'folder') {
			ipc.send('enterChildren',children[rowNumber]);
		}
	}

	addBezier (rowNumber) {
		if (this.props.state.data.children[rowNumber].checked == false) {
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



	getTime(date) {
		return date
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
			if (arr[i].reg.test(file.name)) {
				return arr[i].type
			}
		}
		return 'file'
	}
}


export default AllFilesTable;