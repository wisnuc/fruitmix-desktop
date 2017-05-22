import React from 'react'
import CircularProgress from 'material-ui/CircularProgress'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import CloseIcon from 'material-ui/svg-icons/navigation/close'

class Row extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className='move-dialog-row'>
        {this.props.node.name}
      </div>
    )
  }
}

class MoveDialog extends React.PureComponent {

  constructor(props) {

    super(props)

    let entries = this.props.entries
    let selected = this.props.select.selected
    let path = this.props.path
    this.selectedArr = selected.map(item => entries[item])
    this.directory = path[path.length - 1]


    
    this.state = {
      list:this.props.entries,
      currentDir: path[path.length - 1],
      path:this.props.path,
      loading: false,
      currentSelectIndex: -1 
    }

    this.fire = () => {

    }
  }

  getList() {
    return (
      this.state.list.map((item, index) => <Row
        key={item.uuid}
        node={item} 
        selectNode={this.selecte}
        isSelected={index === this.state.currentSelectIndex} />)
    )
  }

  render() {

    return (
      <div className='move-dialog-container'>
        <div style={{height:'0px'}}></div>
        <div className='move-dialog-header'>
          <span className='move-title-icon'><BackIcon/></span>
          <span className='move-dialog-title'>title</span>
          <span className='move-title-icon'><CloseIcon/></span>
        </div>
        <div className='move-dialog-list'>
          {this.state.loading && <CircularProgress/>}
          {!this.state.loading && this.getList()}
        </div>
        <div className='move-operation'></div>
      </div>
    )
  }
}

export default MoveDialog
