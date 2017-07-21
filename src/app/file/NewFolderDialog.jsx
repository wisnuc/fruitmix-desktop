import React from 'react'
import { TextField } from 'material-ui'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'

class NewFolderDialog extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      value: '',
      errorText: ''
    }

    this.handleChange = (value) => {
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
      const { apis, path } = this.props
      const curr = path[path.length - 1]
      const args = {
        driveUUID: path[0].uuid,
        dirUUID: curr.uuid,
        dirname: this.state.value
      }
      // console.log('creat new folder', this.props, args)
      apis.request('mkdir', args, (err) => {
        if (err) {
          this.props.openSnackBar(`创建失败: ${err.message}`)
        } else {
          this.props.onRequestClose(true)
          this.props.openSnackBar('创建成功')
          this.props.refresh()
        }
      })
    }
  }

  render() {
    // console.log('render!', this.props)
    return (
      <div style={{ width: 280, padding: '24px 24px 0px 24px' }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>{this.props.title ? this.props.title : '创建新文件夹'}</div>
        <div style={{ height: 20 }} />
        <div style={{ height: 60 /** 48 + 12 **/}}>
          <TextField
            fullWidth
            hintText={this.props.hintText ? this.props.hintText : '输入文件夹名称'}
            errorText={this.state.errorText}
            onChange={e => this.handleChange(e.target.value)}
            ref={input => input && input.focus()}
          />
        </div>
        <div style={{ height: 24 }} />
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          <FlatButton label="取消" primary onTouchTap={this.props.onRequestClose} />
          <FlatButton
            label="确认"
            primary
            onTouchTap={this.fire}
            disabled={this.state.value.length === 0 || !!this.state.errorText}
          />
        </div>
      </div>
    )
  }
}

export default NewFolderDialog
