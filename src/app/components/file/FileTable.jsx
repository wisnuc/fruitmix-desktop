import React, { Component, createClass } from 'react'
import { Divider  } from 'material-ui'
import Row from './FileTableRow'

class FileTable extends Component {

	constructor(props) {
		super()
		this.list = []
		this.selectedIndexArr = []
		this.shiftMoveIndexArr = []
		this.lastSelected = -1
		this.lastHover = -1
		this.shift = false
		this.ctrl = false
		this.refresh = () => {
			this.list = []
			this.selectedIndexArr = []
			this.shiftMoveIndexArr = []
			this.lastSelected = -1
			this.lastHover = -1
			this.shift = false
			this.ctrl = false
			this.forceUpdate()
		}
		this.setList = (list) => {
			this.refresh()
			this.list = list
			this.forceUpdate()
		}

		this.updateFileNode = (node) => {
			let index = this.list.findIndex(item => item.uuid == node.uuid)
			if (index !== -1) {
				this.list[index] = node
				this.updateDetail()
				// this.refs.index.forceUpdate()
				this.refs[index.toString()].forceUpdate()
			}
		}
		this.kd = this.keydown.bind(this)
		this.ku = this.keyup.bind(this)
	}

	componentDidMount() {
		//bind keydown event
		document.addEventListener('keydown', this.kd)
		document.addEventListener('keyup', this.ku)
	}

	componentWillUnmount() {
		//remove keydown event
		document.removeEventListener('keydown', this.kd)
		document.removeEventListener('keyup', this.ku)
	}

	shouldComponentUpdate() {
		return false
	}

	render() {
		let _this = this
		return (
			<div id='list-container'>
				<div className='row-title'>
					<div>文件名称</div>
					<div>时间</div>
					<div>大小</div>
				</div>
				<Divider style={{marginLeft: '120px',marginTop:'0px'}}/>
				<div id='rowlist-content'>
				{this.list.map((item,index) => {
					return React.createElement(Row, {
						infor:item,
						key:item.uuid,
						ref:index,
						index:index,
						rowSelect:this.rowSelect.bind(_this),
						rowDClick:this.rowDClick.bind(_this),
						mouseEnter:this.mouseEnter.bind(_this),
						rightClick:this.rightClick.bind(this),
						parent:_this
					})
				})}
				</div>
			</div>
			)
	}

	selectOne(index) {
		this.selectedIndexArr.push(index)
		this.lastSelected = index
		this.refs[index].select(true)
	}

	rowSelect(isSelected,index) {
		if (isSelected) {
			//selected
			if (this.ctrl) {
				//ctrl is down
				let oldLastSelectedIndex = this.lastSelected
				this.selectOne(index)
				if (oldLastSelectedIndex != -1) {
					this.refs[oldLastSelectedIndex].forceUpdate()
				}
			}
			else if (this.shift) {
				//shift is down
				if (this.lastSelected == -1) {
					this.selectOne(index)
				}else {
					this.shift = false
					let min = this.lastSelected<index?this.lastSelected:index
					let max = this.lastSelected<index?index:this.lastSelected
					console.log(min + ' '  + max)
					for(let i = min; i <= max; i++) {
						this.refs[i].shiftHover = false
						this.selectOne(i)
					}
					this.lastSelected = index
				}
			}
			else {
				//no keyDown event
				this.selectedIndexArr.forEach(item => {
					this.refs[item].select(false)
				})
				this.selectedIndexArr = []
				this.selectOne(index)
			}
		}else {
			// cancel selected
			if (this.ctrl) {
				let itemIndex = this.selectedIndexArr.findIndex(item => item == index)
				if (itemIndex != -1) {
					let oldLastSelectedIndex = this.lastSelected
					this.selectedIndexArr.splice(itemIndex,1)
					this.refs[index].select(false)
					this.lastSelected = -1
					if (oldLastSelectedIndex !== -1) this.refs[oldLastSelectedIndex].forceUpdate()
				}else {
					console.log('something wrong')
				}
			}else if (this.shift) {
				if (this.selectedIndexArr.length == 1) {
					this.lastSelected = -1
					this.refs[this.selectedIndexArr[0]].shiftHover = false
					this.refs[this.selectedIndexArr[0]].select(false)
					this.shiftMoveIndexArr = []
					this.selectedIndexArr = []
				}else {
						this.shift = false
					let min = this.lastSelected<index?this.lastSelected:index
					let max = this.lastSelected<index?index:this.lastSelected
					console.log(min + ' '  + max)
					for(let i = min; i <= max; i++) {
						this.refs[i].shiftHover = false
						this.selectOne(i)
					}
					this.lastSelected = index
				}
			}else {
				this.selectedIndexArr.forEach(item => {
					this.refs[item].isSelected = false
					this.refs[item].forceUpdate()
				})
				this.selectedIndexArr = []
				this.selectOne(index)
			}
		}
		// console.log(this.selectedIndexArr)
		// console.log(this.lastSelected)
		console.log(this.list[this.lastSelected])
		this.updateDetail()
	}

	rightClick(event) {
		let containerDom = document.getElementById('fileListContainer')
    	let maxLeft = containerDom.offsetLeft + containerDom.clientWidth - 112
    	let x = event.clientX>maxLeft?maxLeft:event.clientX
    	let maxTop = containerDom.offsetTop + containerDom.offsetHeight -352
    	let y = event.clientY>maxTop?maxTop:event.clientY
		this.props.parent.setState({
			contextMenu:true,
			clientY:y,
			clientX:x
		})
	}

	keydown(event) {
		if (event.ctrlKey == this.ctrl && event.shiftKey == this.shift) return
		this.ctrl = event.ctrlKey
		this.shift = event.shiftKey
		if (this.ctrl) {
			if (this.lastSelected == -1) return
			this.refs[this.lastSelected].forceUpdate()
		}

		if (this.shift) {
			if (this.lastHover == -1) return
			this.mouseEnter(this.lastHover)
		}
	}

	keyup(event) {
		if (event.ctrlKey == this.ctrl && event.shiftKey == this.shift) return
		this.ctrl = event.ctrlKey
		this.shift = event.shiftKey
		if (!this.ctrl) {
			if (this.lastSelected == -1) return
			this.refs[this.lastSelected].forceUpdate()
		}
		if (!this.shift) {
			this.shiftMoveIndexArr.forEach(item => {
				this.refs[item].hover(false)
			})
			this.shiftMoveIndexArr = []
		}
	}

	mouseEnter(index) {
		this.lastHover = index
		if (!this.shift || this.lastSelected == -1) return
		let min = this.lastSelected<index?this.lastSelected:index
		let max = this.lastSelected<index?index:this.lastSelected
		//remove style
		let newShiftArr = []
		this.shiftMoveIndexArr.forEach(item => {
			if (item > max || item < min) {
				this.refs[item].hover(false)
			}else {
				newShiftArr.push(item)
			}
		})
		this.shiftMoveIndexArr = newShiftArr
		//add style
		for(let i = min; i<=max; i++) {
			if (this.refs[i].shiftHover) {
				
			}else {
				this.shiftMoveIndexArr.push(i)
				this.refs[i].hover(true)
			}
		}
	}

	rowDClick(index) {
		console.log(this.list[index])
		this.props.parent.rowDoubleClick(this.list[index].uuid)
	}

	getSelectedItem() {
		return this.selectedIndexArr.map(item => {
			return this.list[item]
		})
	}

	updateDetail() {
		if (this.selectedIndexArr.length == 1) {
			this.props.parent.refs.detail.setList([this.list[this.selectedIndexArr[0]]])
		}else {
			this.props.parent.refs.detail.setList([this.list[this.selectedIndexArr[0]],this.list[this.selectedIndexArr[1]]])
		}
	}
}

export default FileTable