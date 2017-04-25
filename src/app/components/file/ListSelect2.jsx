import EventEmitter from 'eventemitter3'

class ListSelect extends EventEmitter {

  constructor() {
    super()
    this.state = {

      // put functions here is better to put 
      // functions on parent component
      keyEvent: this.keyEvent.bind(this),
      mouseEnter: this.mouseEnter.bind(this),
      mouseLeave: this.mouseLeave.bind(this),
      touchTap: this.touchTap.bind(this),  
      rowColor: this.rowColor.bind(this),
      rowLeading: this.rowLeading.bind(this),
      rowCheck: this.rowCheck.bind(this) 
    }
  }

  setState(props) {
    this.state = Object.assign({}, this.state, props)
    this.emit('updated', this.state)
  }

  // this function does NOT emit !!!
  reset(size) {

    this.state = Object.assign({}, this.state, {
      size,
      ctrl: false,
      shift: false,
      hover: -1,
      specified: -1,
      selected: []
    })

    return this.state 
  }

  keyEvent(ctrl, shift) {
    if (ctrl === this.state.ctrl && shift === this.state.shift) return 
    this.setState({ ctrl, shift })
  }

  mouseEnter(index) {
    if (index !== this.state.hover)
      this.setState({ hover: index })
  } 

  mouseLeave(index) {
    if (index === this.state.hover)
      this.setState({ hover: -1 })
  }  

  // select and specify one
  leftClick(index) {

    this.setState({
      selected: index === -1 ? [] : [index],
      specified: index
    })
  }

  // toggle select and (sort of) specified
  ctrlLeftClick(index) {

    if (index === -1) { // click outside
      this.setState({
        selected: [],
        specified: -1,
        hover: -1
      })
    }
    else {

      let idx = this.state.selected.indexOf(index)
      if (idx !== -1)
        this.setState({
          selected: [...this.state.selected.slice(0, idx), ...this.state.selected.slice(idx + 1)],
          specified: -1 
        })
      else {
        this.setState({
          selected: [...this.state.selected, index],
          specified: index
        }) 
      }
    }
  } 

  // 1. if not specified, specify and select
  // 2. range select if specified, and unspecify
  shiftLeftClick(index) {

    const { specified, selected } = this.state

    if (index === -1)  // click outside
      this.setState({ selected: [], specified: -1, hover: -1, })
    else {
      if (specified === -1) {
        if (!selected.includes(index)) 
          this.setState({ selected: [...selected, index], specified: index })
        else 
          this.setState({ specified: index })
      }
      else {

        let arr = []
        for (let i = Math.min(specified, index); i <= Math.max(specified, index); i++) 
          arr.push(i)

        this.setState({
          selected: Array.from(new Set([...selected, ...arr])),
          specified: -1
        })
      }
    }
  }

  // if there is no selection and index === -1, contextmenu
  // if there is no selection and index !== -1, select and contextmenu
  // if there is single selection and index === -1, clear selection and context menu
  // if there is single selection and index !== -1, update select and context menu
  // if there is multiple selection, context menu
  rightClick(index) {
    if (this.state.selected.length > 2) return
    return this.leftClick(index)
  }

  ctrlRightClick(index) {
    // no action
  }

  shiftRightClick(index) {
    // no action
  }

  touchTap(button, index) {

    switch(button) {
    case 0:
      return this.state.shift
        ? this.shiftLeftClick(index)
        : this.state.ctrl
          ? this.ctrlLeftClick(index)
          : this.leftClick(index)
     
    case 2:
      return this.state.shift
        ? this.shiftRightClick(index)
        : this.state.ctrl
          ? this.ctrlRightClick(index)
          : this.rightClick(index)

    default:
      return
    }
  }

  shiftInRange(index) {

    let { shift, specified, hover } = this.state

    if (!shift) return false
    if (specified === -1 || hover === -1) return false
    let min = Math.min(specified, hover)
    let max = Math.max(specified, hover)
    return index >= min && index <= max
  }

  rowColor(index) {

    if (this.shiftInRange(index) || index === this.state.hover)
      return '#EEEEEE'
    else if (this.state.selected.includes(index))
      return '#F5F5F5'
    else
      return '#FFFFFF'
  }

  rowLeading(index) {

    if (this.state.shift)
      if (this.shiftInRange(index))
        return 'fullOn'
      else if (index === this.state.hover)
        return 'activeHint'
      else
        return 'none'
    else if (this.ctrl)
    //  if (index === this.specified)
    //    return 'activeHint'
    //  else if (index === this.hover)
    //    return 'inactiveHint'
    //  else
        return 'none'
    else
      // return index === this.specified ? 'inactiveHint' : 'none'
      return 'none'
  }

  rowCheck(index) {

    if (this.state.shift) {

      if (this.state.selected.includes(index))
        return 'checked'
        // return 'none'
      else if (this.shiftInRange(index) || index === this.state.hover)
        return 'checking'
        // return 'none'
      else
        return 'none'
    }
    else if (this.state.ctrl) {
      if (this.state.selected.includes(index))
        return 'checked'
        // return 'none'
      else if (index === this.state.hover)
        return 'checking'
        // return 'none'
      else
        return 'none'
    }
    else {
      if (this.state.selected.length > 1 && this.state.selected.includes(index))
        return 'checked'
        // return 'none'
      else
        return 'none'
    }
  }
}

export default ListSelect

