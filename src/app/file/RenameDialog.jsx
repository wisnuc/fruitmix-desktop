import React from 'react'
import { TextField } from 'material-ui'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'

class RenameDialog extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      value: '',
      errorText: undefined
    }

    this.handleChange = (e) => {
      const value = e.target.value
      const newValue = sanitize(value)
      const entries = this.props.entries
      if (entries.findIndex(entry => entry.name === value) > -1) {
        this.setState({ value, errorText: '名称已存在' })
      } else if (value !== newValue) {
        this.setState({ value, errorText: '名称不合法' })
      } else {
        this.setState({ value, errorText: '' })
      }
    }

    this.fire = () => {
      console.log(this.props)
      const { apis, path, entries, select } = this.props
      const curr = path[path.length - 1]
      const args = {
        driveUUID: path[0].uuid,
        dirUUID: curr.uuid,
        entryUUID: entries[select.selected[0]].uuid,
        newName: this.state.value,
        oldName: entries[select.selected[0]].name
      }
      console.log('renameDirOrFile', this.props, args)
      apis.request('renameDirOrFile', args, (err, data) => {
        if (err) this.setState({ errorText: err.message })
        else {
          this.props.onRequestClose(true)
          this.props.refresh()
        }
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
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton label="取消" primary onTouchTap={this.props.onRequestClose} />
          <FlatButton label="确认" primary onTouchTap={this.fire} />
        </div>
      </div>
    )
  }
}

export default RenameDialog
