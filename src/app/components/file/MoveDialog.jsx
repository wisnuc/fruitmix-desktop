import React from 'react'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import CloseIcon from 'material-ui/svg-icons/navigation/close'

class MoveDialog extends React.PureComponent {

  constructor(props) {

    super(props)
    this.state = {
      list:[],
      currentDir: {},
      loading: false
    }

    this.fire = () => {
      console.log(this.props)
      let { apis, path, entries, select } = this.props
    }
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
        <div className='move-dialog-list'></div>
        <div className></div>
      </div>
    )
  }
}

export default MoveDialog
