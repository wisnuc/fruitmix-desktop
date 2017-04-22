class ListSelect {

  constructor(props) {

    if (typeof props === 'object')
      Object.assign(this, props)
    else {
      this.size = props
      this.ctrl = false
      this.shift = false
      this.hover = -1
      this.specified = -1
      this.set = new Set()
    }
  }

  keyEvent(ctrl, shift) {

    if (ctrl === this.ctrl && shift === this.shift) return 
    this.ctrl = ctrl
    this.shift = shift
    return new ListSelect(this)
  }

  mouseEnter(index) {
    if (index !== this.hover) {
      this.hover = index
      return new ListSelect(this)
    }
  } 

  mouseLeave(index) {
    if (index === this.hover) {
      this.hover = -1
      return new ListSelect(this)
    }
  }  

  // select and specify one
  leftClick(index) {

    this.set = index === -1 
      ? new Set() // click outside
      : this.set = new Set([index])
    
    this.specified = index
    return new ListSelect(this)
  }

  // toggle select and (sort of) specified
  ctrlLeftClick(index) {

    if (index === -1) { // click outside
      this.set = new Set()
      this.specified = -1
      this.hover = -1
    }
    else {
      if (this.set.has(index)) {
        this.set.delete(index)
        this.set = new Set(this.set)
        this.specified = -1
      }
      else {
        this.set.add(index)
        this.set = new Set(this.set)
        this.specified = index
      }
    }

    return new ListSelect(this)
  } 

  // 1. if not specified, specify and select
  // 2. range select if specified, and unspecify
  shiftLeftClick(index) {

    if (index === -1) { // click outside
      this.set = new Set()
      this.specified = -1
      this.hover = -1
    }
    else {
      if (this.specified === -1) {
        if (!this.set.has(index)) {
          this.set.add(index)
          this.set = new Set(this.set)
        }
        this.specified = index
      }
      else {

        let mutated = false
        for (let i = Math.min(this.specified, index); i <= Math.max(this.specified, index); i++) {
          if (!this.set.has(i)) {
            mutated = true
            this.set.add(i)
          }
        }

        if (mutated) this.set = new Set(this.set)

        this.specified = -1
      }
    }
    return new ListSelect(this)
  }

  // if there is no selection and index === -1, contextmenu
  // if there is no selection and index !== -1, select and contextmenu
  // if there is single selection and index === -1, clear selection and context menu
  // if there is single selection and index !== -1, update select and context menu
  // if there is multiple selection, context menu
  rightClick(index) {
    if (this.set.size > 2) return
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
      return this.shift
        ? this.shiftLeftClick(index)
        : this.ctrl
          ? this.ctrlLeftClick(index)
          : this.leftClick(index)
     
    case 2:
      return this.shift
        ? this.shiftRightClick(index)
        : this.ctrl
          ? this.ctrlRightClick(index)
          : this.rightClick(index)

    default:
      return
    }
  }

  shiftInRange(index) {

    if (!this.shift) return false
    if (this.specified === -1 || this.hover === -1) return false
    let min = Math.min(this.specified, this.hover)
    let max = Math.max(this.specified, this.hover)
    return index >= min && index <= max
  }

  rowColor(index) {

    if (this.shiftInRange(index) || index === this.hover)
      return '#EEEEEE'
    else if (this.set.has(index))
      return '#F5F5F5'
    else
      return '#FFFFFF'
  }

  rowLeading(index) {

    if (this.shift)
      if (this.shiftInRange(index))
        return 'fullOn'
      else if (index === this.hover)
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

    if (this.shift) {

      if (this.set.has(index))
        return 'checked'
        // return 'none'
      else if (this.shiftInRange(index) || index === this.hover)
        return 'checking'
        // return 'none'
      else
        return 'none'
    }
    else if (this.ctrl) {
      if (this.set.has(index))
        return 'checked'
        // return 'none'
      else if (index === this.hover)
        return 'checking'
        // return 'none'
      else
        return 'none'
    }
    else {
      if (this.set.size > 1 && this.set.has(index))
        return 'checked'
        // return 'none'
      else
        return 'none'
    }
  }
}

export default ListSelect

