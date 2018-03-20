import FileSelect from '../file/ListSelect'

class ListSelect extends FileSelect {
  constructor (ctx) {
    super(ctx)
    this.ctx = ctx
    this.uuid = index => this.ctx.state.entries[index].uuid

    this.delSelected = (uuid) => {
      const idx = this.state.selected.indexOf(uuid)
      if (idx !== -1) {
        this.setState({
          selected: [...this.state.selected.slice(0, idx), ...this.state.selected.slice(idx + 1)]
        })
      }
    }
  }

  leftClick (index) {
    this.ctrlLeftClick(index)
  }

  rowCheck (index) {
    const uuid = this.uuid(index)
    if (this.state.shift) {
      if (this.state.selected.includes(uuid)) return 'checked'
      else if (this.shiftInRange(index) || index === this.state.hover) return 'checking'
      return 'none'
    } else if (this.state.ctrl) {
      if (this.state.selected.includes(uuid)) return 'checked'
      else if (index === this.state.hover) return 'checking'
      return 'none'
    }

    if (this.state.selected.includes(uuid)) return 'checked'
    return 'none'
  }

  addByArray (indexs, session) {
    const array = indexs.map(i => this.uuid(i))
    const isSameBox = this.session === session
    this.session = session
    if (!isSameBox) this.preArray = this.state.selected
    const set = new Set([...array, ...this.preArray])
    array.forEach(i => this.preArray.includes(i) && set.delete(i))
    this.setState({ selected: [...set] })
  }

  // toggle select and (sort of) specified
  ctrlLeftClick (index) {
    if (index === -1) { // click outside
      // this.setState({ selected: [], specified: -1, hover: -1 })
    } else {
      const uuid = this.uuid(index)
      const idx = this.state.selected.indexOf(uuid)
      if (idx !== -1) {
        this.setState({
          selected: [...this.state.selected.slice(0, idx), ...this.state.selected.slice(idx + 1)],
          specified: -1
        })
      } else {
        this.setState({
          selected: [...this.state.selected, uuid],
          specified: index
        })
      }
    }
  }

  // 1. if not specified, specify and select
  // 2. range select if specified, and unspecify
  shiftLeftClick (index) {
    const { specified, selected } = this.state
    const uuid = this.uuid(index)

    if (index === -1) { // click outside
      // this.setState({ selected: [], specified: -1, hover: -1 })
    } else if (specified === -1) {
      if (!selected.includes(uuid)) {
        this.setState({ selected: [...selected, uuid], specified: index })
      } else {
        this.setState({ specified: index })
      }
    } else {
      const arr = []
      for (let i = Math.min(specified, index); i <= Math.max(specified, index); i++) { arr.push(this.uuid(i)) }

      this.setState({
        selected: Array.from(new Set([...selected, ...arr])),
        specified: -1
      })
    }
  }

  rowColor (index) {
    const uuid = this.uuid(index)
    if (this.shiftInRange(index) || (index === this.state.hover && !this.dragging.length)) return '#EEEEEE'
    else if (this.state.selected.includes(uuid)) return '#F5F5F5'
    return '#FFFFFF'
  }
}

export default ListSelect
