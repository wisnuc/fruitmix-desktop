import React, { Component, createClass } from 'react'
import FileFolder from 'material-ui/svg-icons/file/folder'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import ActionCheckCircle from 'material-ui/svg-icons/action/check-circle'
import NavigationCheck from 'material-ui/svg-icons/navigation/check'
const secondaryColor = '#FF4081'
class Row extends Component {
	constructor(props) {
		super(props)
		this.show = true
		this.isSelected = false
		this.shiftHover = false

		this.select = (s) => {
			this.isSelected = s
			this.forceUpdate()
		}

		this.hover = (h) => {
			this.shiftHover = h
			this.forceUpdate()
		}
	}

	renderLeading() {
		let style = {width:'4px',height:'0',backgroundColor:'#FFF',opacity:1,flex:'0 0 4px'}
		if (this.props.parent.lastSelected == this.props.index) {
			if (this.props.parent.ctrl) {
				Object.assign(style,{backgroundColor:secondaryColor,height:'20px'})
			}else {
				Object.assign(style,{backgroundColor:'rgba(0,0,0,.26)',height:'20px'})
			}
		}
		if (this.shiftHover) {
			Object.assign(style,{backgroundColor:secondaryColor,height:'100%'})
		}
		return (<div style={style}></div>)
	}

	renderCheckBox () {
		if (this.shiftHover) {
			if (this.props.index == this.props.parent.lastSelected || this.isSelected) {
				return <ActionCheckCircle style={{color: secondaryColor, opacity: 1, zIndex:1000}} />
			}else {
				return <NavigationCheck style={{color: '#000', opacity: 0.26}} />	
			}
		}

		if (this.isSelected && this.props.parent.selectedIndexArr.length == 1) {
			return null
		}
		if (this.isSelected && this.props.parent.selectedIndexArr.length>1) {
			return <ActionCheckCircle style={{color: secondaryColor, opacity: 1, zIndex:1000}} />
		}
	}

	render() {
		let style = {}
		if (this.isSelected) {
			style = {backgroundColor:'#f5f5f5'}
		}
		if (this.show) {
			return (
				<div className='row' style={style} 
					onMouseUp={this.rowClick.bind(this)}
					onDoubleClick={this.rowDClick.bind(this)}
					onMouseEnter={this.mouseEnter.bind(this)} 
					onMouseLeave={this.mouseLeave.bind(this)}
				>
					<div className='row-select'>
						{ this.renderLeading() }
						<div style={{flex: '0 0 12px'}} />
						<div style={{flex: '0 0 48px', display: 'flex', alignItems: 'center'}}>
						{ this.renderCheckBox() }
						</div>
						<div style={{flex: '0 0 8px'}} />
						<div style={{flex: '0 0 48px', display: 'flex', alignItems: 'center'}} >
						{
							this.props.infor.type=='folder'?
							<FileFolder style={{color: '#000', opacity: 0.54}} />:
							<EditorInsertDriveFile style={{color: '#000', opacity: 0.54}} />
						}
						</div>
					</div>
					<div>{this.props.infor.name}</div>
					<div className='row-time'>{this.props.infor.mtime}</div>
					<div className='row-size'>{this.props.infor.conversionSize}</div>
				</div>
				)
		}
	}

	rowClick(e) {
		let event = e.nativeEvent
		if (event.button == 1) {
			return
		}else if (event.button == 2) {
			if (this.isSelected) {
				
			}else {
				this.props.rowSelect(!this.isSelected,this.props.index)	
			}
			this.props.rightClick(e.nativeEvent)
		}else {
			this.props.rowSelect(!this.isSelected,this.props.index)	
		}
		
		
	}

	rowDClick() {
		this.props.rowDClick(this.props.index)
	}

	mouseEnter() {
		this.props.mouseEnter(this.props.index)
	}

	mouseLeave() {

	}
}

export default Row