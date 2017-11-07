import React from 'react'
import { IconButton, CircularProgress, RaisedButton, TextField } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error-outline'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'

const convert = (code) => {
  switch (code) {
    case 'EEXIST':
      return '文件命名冲突'
    case 'ECONNRESET':
      return '连接已断开'
    case 'ECONNREFUSED':
      return '连接已断开'
    case 'ECONNEND':
      return '连接已断开'
    case 'ENOENT':
      return '文件不可读'
    case 'EPERM':
      return '访问权限不足'
    case 'ESERVER':
      return '服务器内部错误'
    case 'EOHTER':
      return '请求失败'
    case 'ENOSPC':
      return '磁盘空间已满'
    case 'EHTTPSTATUS':
      return '请求失败'
    case 'ESHA256MISMATCH':
      return '文件已修改'
    case 'EOVERSIZE':
      return '文件已修改'
    case 'EUNDERSIZE':
      return '文件已修改'
    default:
      return code || '未知错误'
  }
}

class Row extends React.PureComponent {
  render() {
    console.log('Row', this.props)
    const { node } = this.props
    const code = node.error.code ||
      (node.error.response && node.error.response[0] && node.error.response[0].error && node.error.response[0].error.code) ||
      (node.error.response && node.error.response.error && node.error.response.error.code)
    const error = code ? convert(code) : node.error.status ? `请求失败： ${node.error.status}` : '未知错误'
    let name = ''
    if (node.entry && typeof node.entry === 'object') name = node.entry.name
    if (node.entry && typeof node.entry === 'string') name = node.entry.replace(/^.*\//, '').replace(/^.*\\/, '')
    if (node.entries && typeof node.entries[0] === 'object') name = node.entries[0].newName
    if (node.entries && typeof node.entries[0] === 'string') name = node.entries[0].replace(/^.*\//, '').replace(/^.*\\/, '')

    const svgStyle = { color: 'rgba(0,0,0,0.54)', width: 16, height: 16 }
    return (
      <div style={{ height: 32, width: '100%', display: 'flex', alignItems: 'center' }} >
        <div style={{ margin: '-2px 4px 0 4px', display: 'flex' }}>
          {
            node.type === 'directory' ? <FileFolder style={svgStyle} />
            : node.type === 'file' ? <EditorInsertDriveFile style={svgStyle} />
            : <ErrorIcon style={svgStyle} />
          }
        </div>
        <div style={{ width: 196, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 5, fontSize: 13 }} >
          { name }
        </div>
        <div style={{ fontSize: 13 }} >
          { error }
        </div>
      </div>
    )
  }
}

class ErrorTree extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
    }

    this.retry = () => {
      const uuid = this.props.errors[0].task
      this.props.resume(uuid)
      this.props.onRequestClose()
    }
  }

  render() {
    console.log('ErrorDialog', this.props)
    return (
      <div style={{ width: 336, height: 520, padding: '0px 24px 0px 24px' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center' }} >
          <div style={{ fontSize: 20 }}> { ' 传输问题' } </div>
          <div style={{ flexGrow: 1 }} />
          <IconButton
            onTouchTap={() => this.props.onRequestClose()}
            style={{ width: 40, height: 40, padding: 10, marginRight: -10 }}
            iconStyle={{ width: 20, height: 20, color: 'rgba(0,0,0,0.54)' }}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <div style={{ fontSize: 14, marginBottom: 16 }}> { '传输以下文件时出现问题：' } </div>

        {/* list of errors */}
        <div style={{ width: 336, height: 374, overflowY: 'auto', border: 'solid #ccc 1px' }} >
          { this.props.errors.map((node, index) => (<Row key={index.toString()} node={node} />)) }
        </div>

        {/* confirm button */}
        <div style={{ height: 52, display: 'flex', alignItems: 'center', marginRight: -24 }}>
          <div style={{ flexGrow: 1 }} />
          <FlatButton
            primary
            label="取消"
            onTouchTap={() => this.props.onRequestClose()}
          />
          <FlatButton
            primary
            label="全部重试"
            onTouchTap={this.retry}
          />
        </div>
      </div>
    )
  }
}

export default ErrorTree
