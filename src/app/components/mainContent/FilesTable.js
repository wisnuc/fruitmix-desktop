/**
 * @component AllFilesTable
 * @description AllFilesTable
 * @time 2016-5-6
 * @author liuhua
 **/

import React, { findDOMNode, Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Action from '../../actions/action'
import { fileNav } from '../../lib/file'

import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'

import svg from '../../utils/SVGIcon'

import IconButton from 'material-ui/IconButton'
import CheckCircle from 'material-ui/svg-icons/action/check-circle'
import NavigationCheck from 'material-ui/svg-icons/navigation/check'
import FileFolder from 'material-ui/svg-icons/file/folder'

const isLeftClick = e => e.nativeEvent.button === 0
const isRightClick = e => e.nativeEvent.button === 2

const COLOR_WHITE = '#FFF'
const COLOR_LIGHT_GRAY = '#DFD'
const COLOR_DARK_GRAY = '#BFB'
const COLOR_BLACK = '#3F51B5'

const FONT_BLACK = '#000'
const FONT_WHITE = '#FFF'
const FONT_DARKOP1 = '84%'
const FONT_DARKOP2 = '55%'
const FONT_BRIGHTOP1 = '100%'
const FONT_BRIGHTOP2 = '70%'

const stm = () => window.store.getState().file.stm

class DataRow extends Component {

	render() {

    let checked = this.props.checked
    let mouseOver = stm().mouseOver === this.props.item.uuid

    let checkCircleColor = checked ? '#FFF' : mouseOver ? COLOR_BLACK : '#EEE'

    let style = {

      row: {

        width: '100%',
        height: 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',

        // marginLeft: this.props.ctrl > 0 && checked !== true ? 16 : 0,

        backgroundColor: (() => {
          if (checked) {
            return mouseOver ? 
              '#3D5AFE' :   // indigo A400 // '#5C6BC0' :   // indigo 400
              '#3F51B5'     // indigo 500
          }
          else {
            return mouseOver ?
              '#EEEEEE' :   // indigo 50 // '#C5CAE9' :  // indigo 100
              '#FFFFFF'     // white
          }
        })(),

        // backgroundColor: this.props.checked ? COLOR_ALACK : COLOR_WHITE,
        // color: this.props.checked ? COLOR_WHITE : COLOR_BLACK,

        color: checked ? '#FFF' : '#000',
        opacity: checked ? '87%' : '100%'
      },

      spacer: {
        // width: mouseOver ? 0 : 2,
        // transition: 'width 30ms'
      },

      sticky: {
        marginLeft: 16,
        width: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },

      icon: {
        width: 128,
      },

      name: {
        width: '100%',
      },

      size: {
        width: 240,
      },
      
      time: {
        width: 240
      },
    }

    return (
      <div style={style.row} zDepth={this.props.checked ? 2 : 0}
        onMouseEnter = {() => window.store.dispatch({type: 'FILE_ROW_MOUSE_ENTER', data: this.props.item.uuid})}
        onMouseLeave = {() => window.store.dispatch({type: 'FILE_ROW_MOUSE_LEAVE', data: this.props.item.uuid})}
      > 

        {/* sticky column */}
        <div style={style.sticky} >
          { (this.props.ctrl > 0 || this.props.shift > 0) && <IconButton iconStyle={{padding:0, width:26, height:26, color:checkCircleColor}}><CheckCircle /></IconButton> }
        </div>
       
        {/* icon colume */} 
        <div style={style.icon} >
          { this.props.item.type === 'folder' && (<FileFolder color='#757575'/>) }
        </div>

        {/* name column */}
				<div style={style.name}
          onTouchTap={
            e => isLeftClick(e) &&
              window.store.dispatch({
                type: 'FILE_ROW_RAWCLICK',
                childUUID: this.props.item.uuid,
                column: 'name'
              })
          }
        >
          { this.props.editing ? 
            <TextField 
              hintText={this.props.item.name} 
              fullWidth={true} 
              ref={ input => { input && input.focus() }}
              onBlur={() => window.store.dispatch({
                type: 'FILE_ROW_NAME_ONBLUR',
                data: this.props.item.uuid
              })}
            /> : <span className='file-name'>{this.props.item.name}</span> 
          }
				</div>

        {/* time column */}
				<div style={style.time}
          onTouchTap={
            e => isLeftClick(e) &&
              window.store.dispatch({
                type: 'FILE_ROW_RAWCLICK',
                childUUID: this.props.item.uuid,
                column: 'nonname'
              })
          }
        >
          {this.getTime(this.props.item.mtime)}
        </div>

        {/* size column */}
				<div style={style.size} 
          onTouchTap={
            e => {
              return isLeftClick(e) ?
              window.store.dispatch({
                type: 'FILE_ROW_RAWCLICK',
                childUUID: this.props.item.uuid,
                column: 'nonname'
              }) : isRightClick(e) ?
              window.store.dispatch({
                type: 'FILE_ROW_RIGHTCLICK',
                data: this.props.item.uuid
              }) : null
            }
          }
        >
          {this.getSize(this.props.item.size)}
        </div>
			</div>
    )
	}

	getSize(size) {
		if (!size) 
			return null
		
		size = parseFloat(size);
		if (size < 1024) 
			return size.toFixed(2)+' B'
		else if (size < 1024*1024)
			return (size/1024).toFixed(2)+' KB'
		else if(size<1024*1024*1024)
			return (size/1024/1024).toFixed(2)+ ' M'
		else 
			return (size/1024/1024/1024).toFixed(2)+ ' G'
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

const fileState = () => window.store.getState().file

class AllFilesTable extends Component {

  constructor(props) {
    super(props)
    this.state = {
      ctrl: 0,
      shift: 0,
    }

    this.handleKeyEventBound = this.handleKeyEvent.bind(this)
  }

  handleKeyEvent(e) {

    let newState

    if (e.key === 'Control') {
      if (e.type === 'keydown') {
        if (this.state.ctrl === 0)
          newState = Object.assign({}, this.state, { ctrl: 1 })
        else 
          this.state.ctrl++
      }
      else if (e.type === 'keyup') {
        if (this.state.ctrl === 1) 
          newState = Object.assign({}, this.state, { ctrl: 0 })
        else if (this.state.ctrl > 0) 
          this.state.ctrl--
      }
    }
    else if (e.key === 'Shift') {
      if (e.type === 'keydown') {
        if (this.state.shift === 0) 
          newState = Object.assign({}, this.state, { shift: 1 })
        else 
          this.state.shift++
      }
      else if (e.type === 'keyup') {
        if (this.state.shift === 1) 
          newState = Object.assign({}, this.state, { shift: 0 })
        else 
          this.state.shift--
      }
    }
    if (newState) {
      console.log(newState)
      this.setState(newState)
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyEventBound, false)
    window.addEventListener('keyup', this.handleKeyEventBound, false)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyEventBound, false)
    window.removeEventListener('keyup', this.handleKeyEventBound, false)
  }	

	render() {
    console.log('redraw')
		return (
      <div style={{ width: '100%', backgroundColor:'#EEE', display:'flex', flexDirection:'column', alignItems:'center' }} >
        
        { fileState().children.map((item,index)=> (
          <DataRow 
            ctrl={this.state.ctrl}
            shift={this.state.shift}
            index={index} 
            item={item} 
            checked={window.store.getState().file.stm.selection.has(item.uuid)}
            key={item.uuid} 
            selectChildren={this.selectChildren.bind(this)} 
            enterChildren={this.enterChildren.bind(this)} 
            editing={item.uuid === window.store.getState().file.stm.editing }
          />))
        }
      </div>
	  )
  }

	//select all
	selectAllChildren() {
 		this.props.dispatch(Action.selectAllChildren())
	}

	//select files
	selectChildren (rowNumber,e) {

		//bezier
		if (fileState().children[rowNumber].checked == true) {
			this.bez1(rowNumber);
		}else {
			this.bez2(rowNumber);
		}
		if (e.nativeEvent.button == 2) {

			let x = e.nativeEvent.pageX;
			let y = e.nativeEvent.pageY;
			if (fileState().children[rowNumber].checked == false) {	
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

		var children = fileState().children;
		if (children[rowNumber] && children[rowNumber].type == 'folder') {
			// ipc.send('enterChildren',children[rowNumber]);
      fileNav('HOME_DRIVE', children[rowNumber].uuid)
		}
	}
}

export default AllFilesTable
