import React from 'react'
import { TextField } from 'material-ui'
import FlatButton from '../common/FlatButton'

class RenameDialog extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      value: '',
      errorText: undefined
    }

    this.handleChange = (e) => {
      this.setState({ value: e.target.value, errorText: undefined })
    }

    this.fire = () => {
      console.log(this.props)
      const { apis, path, entries, select } = this.props
      const curr = path[path.length - 1]
      const args = {
        driveUUID: path[0].uuid,
        dirUUID: curr.uuid,
        entryUUID: entries[select.selected[0]].uuid,
        newName: this.state.value
      }
      console.log('renameDirOrFile', this.props, args)
      apis.request('renameDirOrFile', args, (err, data) => {
        if (err) this.setState({ errorText: err.message })
        else this.props.onRequestClose(true)
      })
    }
  }

  render() {
    return (
      <div style={{ width: 280, padding: '24px 24px 0px 24px' }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>{this.props.title ? this.props.title : '重命名'}</div>
        <div style={{ height: 20 }} />
        <div style={{ height: 60 /** 48 + 12 **/}}>
          <TextField
            fullWidth
            hintText={this.props.hintText ? this.props.hintText : '输入名称'}
            errorText={this.state.errorText}
            onChange={this.handleChange}
            ref={input => input && input.focus()}
          />
        </div>
        <div style={{ height: 24 }} />
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <FlatButton label="取消" primary onTouchTap={this.props.onRequestClose} />
          <FlatButton label="确认" primary onTouchTap={this.fire} />
        </div>
      </div>
    )
  }
}

export default RenameDialog
