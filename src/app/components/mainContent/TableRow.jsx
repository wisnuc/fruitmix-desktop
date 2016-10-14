import React, { findDOMNode, Component, PropTypes } from 'react';
import svg from '../../utils/SVGIcon';
class Row extends Component {

	shouldComponentUpdate(nextP) {
		if (this.props.item.checked == nextP.item.checked && this.props.item.name == nextP.item.name) {
			return false
		}else {
			return true
		}
	}

	render() {
		var _this = this
		return (
			<tr onTouchTap={_this.props.selectChildren.bind(_this,this.props.index)} onDoubleClick={_this.props.enterChildren.bind(_this,this.props.index)} 
			className={this.props.item.checked==true?'tr-selected-background':''}>
				<td onClick={this.props.addBezier.bind(this,this.props.index)} data-selected={this.props.item.checked} className='first-td'>
					<div className='selectBox'>
						<div>{this.props.item.checked==false?svg.blackFrame():svg.select()}</div>
						<div className='bezierFrame' style={{width:48,height:48}}>
							<div className="bezierTransition1"></div>
							<div className="bezierTransition2"></div>
						</div>
					<div></div>
					</div>
				</td>
				<td title={this.props.item.name}>
					<div data-uuid={this.props.item.uuid}>
						<span className={'file-type-icon '+this.getTypeOfFile(this.props.item)}></span>
						<span className='file-name'>{this.props.item.name}</span>
					</div>
				</td>
				<td >{this.getTime(this.props.item.mtime)}</td>
				<td>{this.getSize(this.props.item.size)}</td>
			</tr>
			)
	}

	getSize(size) {
		if (!size) {
			return null
		}
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

	getTime(mtime) {
		if (!mtime) {
			return null
		}
		let time = new Date()
		time.setTime(parseInt(mtime))
		return time.getFullYear() + '/' + (time.getMonth() + 1) + '/' + time.getDay()
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
export default Row;