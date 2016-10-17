/**
 * @component AllFilesTable
 * @description AllFilesTable
 * @time 2016-5-6
 * @author liuhua
 **/
 'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react'
import { connect } from 'react-redux';
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
								<div>{this.props.file.view.selectAll?svg.select():svg.blackFrame()}</div>
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
						this.props.file.current.children.map((item,index)=>{
							return (
								<Row index={index} item={item} key={item.uuid} selectChildren={this.selectChildren.bind(this)} enterChildren={this.enterChildren.bind(this)} addBezier={this.addBezier.bind(this)}></Row>
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
        //c.log(document.getElementsByClassName('file-area')[0].scrollTop);
    }
	//select all
	selectAllChildren() {
 		this.props.dispatch(Action.selectAllChildren())

	}
	//select files
	selectChildren (rowNumber,e) {
		c.log(e)
		//bezier
		if (this.props.file.current.children[rowNumber].checked == true) {
			this.bez1(rowNumber);
		}else {
			this.bez2(rowNumber);
		}
		if (e.nativeEvent.button == 2) {
			//right click
			let x = e.nativeEvent.pageX;
			let y = e.nativeEvent.pageY;
			if (this.props.file.current.children[rowNumber].checked == false) {	
				this.props.dispatch(Action.toggleMenu(rowNumber,x,y,true));
				this.props.dispatch(Action.selectChildren(rowNumber))
			}else {
				this.props.dispatch(Action.toggleMenu(rowNumber,x,y,true));
			}
			return
		}
		this.props.dispatch(Action.selectChildren(rowNumber))
		
	}
	//double click
	enterChildren (rowNumber) {
		//bezier 
		$('.bezierFrame').empty().append('<div class="bezierTransition1"></div><div class="bezierTransition2"></div>');

		var children = this.props.file.current.children;
		if (children[rowNumber] && children[rowNumber].type == 'folder') {
			ipc.send('enterChildren',children[rowNumber]);
		}
	}

	addBezier (rowNumber) {
		if (this.props.file.current.children[rowNumber].checked == false) {
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

	componentWillReceiveProps() {
		c.log('2')
		c.log((new Date()).getTime())
	}

	componentDidUpdate() {
		c.log('3')
		c.log((new Date()).getTime())	
	}
}

var mapStateToProps = (state)=>({
	     file: state.file,
	})

export default connect(mapStateToProps)(AllFilesTable)