import React from 'react'
import { TextField } from 'material-ui'
import FlatButton from '../common/FlatButton'

class NewFolderDialog extends React.PureComponent {

  constructor(props) {

    super(props)
    this.state = {
      value: '',
      errorText: undefined
    }

    this.handleChange = e => {
      this.setState({ value: e.target.value, errorText: undefined }) 
    }

    this.fire = () => {

      let { apis, path, entries } = this.props
      let curr = path[path.length - 1]
      let args = {
        dirUUID: curr.uuid,
        dirname: this.state.value
      }

      apis.request('mkdir', args, (err, data) => {
        if (err) this.setState({ errorText: err.message })
        else this.props.onRequestClose(true)
      })
    }
  }

  render() {

    return (
      <div style={{width: 280, padding: '24px 24px 0px 24px'}}>
        <div style={{fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)'}}>创建新文件夹</div>
        <div style={{height: 20}} />
        <div style={{height: 60 /** 48 + 12 **/}}>
          <TextField 
            fullWidth={true} 
            hintText="输入文件夹名称" 
            errorText={this.state.errorText}
            onChange={this.handleChange} 
            ref={input => input && input.focus()}
          />
        </div>
        <div style={{height: 24}} />
        <div style={{height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
          <FlatButton label="取消" primary={true} onTouchTap={this.props.onRequestClose} />
          <FlatButton label="确认" primary={true} onTouchTap={this.fire} />
        </div>
      </div>
    )
  }
}

export default NewFolderDialog
