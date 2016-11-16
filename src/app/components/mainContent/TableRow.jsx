import React, { findDOMNode, Component, PropTypes } from 'react'
import TextField from 'material-ui/TextField'
import Checkbox from 'material-ui/Checkbox'
import svg from '../../utils/SVGIcon'

const isLeftClick = e => e.nativeEvent.button === 0
const isRightClick = e => e.nativeEvent.button === 2

const stm = () => window.store.getState().file.stm

class Row extends Component {

	render() {
/**
    return (
      <tr 
        style={{backgroundColor: this.props.checked ? '#EEE' : '#FFF' }}
        onMouseEnter = {() => window.store.dispatch({type: 'FILE_ROW_MOUSE_ENTER', data: this.props.item.uuid})}
        onMouseLeave = {() => window.store.dispatch({type: 'FILE_ROW_MOUSE_LEAVE', data: this.props.item.uuid})}
      >
**/
    return (
      <tr>
        <td>
          {/* (this.props.checked || stm().mouseOver === this.props.item.uuid) &&
            <Checkbox checked={this.props.checked} onCheck={() => window.store.dispatch({
              type: 'FILE_ROW_CHECKBOX_ONCHECK',
              data: this.props.item.uuid
            })}/>
          */}
        </td>

        {/* name colume */}
				<td title={this.props.item.name} 
          onClick={
            e => isLeftClick(e) &&
              window.store.dispatch({
                type: 'FILE_ROW_RAWCLICK',
                childUUID: this.props.item.uuid,
                colume: 'name'
              })
          }
        >
					<div data-uuid={this.props.item.uuid}>
						<span className={'file-type-icon '+this.getTypeOfFile(this.props.item)}></span>
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
				</td>

        {/* time colume */}
				<td
          onClick={
            e => isLeftClick(e) &&
              window.store.dispatch({
                type: 'FILE_ROW_RAWCLICK',
                childUUID: this.props.item.uuid,
                colume: 'nonname'
              })
          }
        >
          {this.getTime(this.props.item.mtime)}
        </td>

        {/* size colume */}
				<td 
          onClick={
            e => {
              console.log('===============')
              console.log(e.nativeEvent)

              return isLeftClick(e) ?
              window.store.dispatch({
                type: 'FILE_ROW_RAWCLICK',
                childUUID: this.props.item.uuid,
                colume: 'nonname'
              }) : isRightClick(e) ?
              window.store.dispatch({
                type: 'FILE_ROW_RIGHTCLICK',
                data: this.props.item.uuid
              }) : null
            }
          }
        >
          {this.getSize(this.props.item.size)}
        </td>
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

export default Row

