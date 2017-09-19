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
      return '命名冲突错误'
    case 'ECONNRESET':
      return '与WISNUC的连接被断开'
    case 'ECONNREFUSED':
      return '无法连接到WISNUC'
    case 'ENOENT':
      return '文件或目录未找到'
    default:
      return '未知错误'
  }
}

class Row extends React.PureComponent {
  render() {
    console.log('Row', this.props)
    const { node, isRoot, enter } = this.props
    let name = isRoot ? convert(node[0]) : ''
    if (node.Files && node.Files[0]) name = node.Files[0].entry.replace(/^.*\//, '')
    if (node.entries && node.entries[0]) name = node.entries[0].replace(/^.*\//, '')
    if (node.error && node.error.where) name = node.error.where.name
    if (node.pipe === 'download') name = node.entry.name
    return (
      <div
        style={{ height: 56, width: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onDoubleClick={() => isRoot && enter(node[1])}
      >
        <div style={{ margin: '2px 12px 0 12px', display: 'flex' }}>
          { node.type === 'directory' && <FileFolder style={{ color: 'rgba(0,0,0,0.54)' }} /> }
          { node.type === 'file' && <EditorInsertDriveFile style={{ color: 'rgba(0,0,0,0.54)' }} /> }
          { isRoot && <ErrorIcon style={{ color: 'rgba(0,0,0,0.54)' }} /> }
        </div>
        <div style={{ width: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 5, fontSize: 14 }} >
          { name }
        </div>
      </div>
    )
  }
}

class ErrorTree extends React.PureComponent {
  constructor(props) {
    super(props)

    this.map = new Map()
    this.props.errors.forEach((e) => {
      const code = e.error.code
      if (this.map.has(code)) {
        this.map.get(code).push(e)
      } else {
        this.map.set(code, [e])
      }
    })

    this.state = {
      root: true,
      list: [...this.map]
    }

    /* enter dir */
    this.enter = (node) => {
      this.setState({ root: false, list: node })
    }

    /* back to parent */
    this.back = () => {
      this.setState({ root: true, list: [...this.map] })
    }

    /* close dialog */
    this.closeDialog = () => this.props.onRequestClose()
  }

  renderHeader() {
    return (
      <div
        style={{
          height: 56,
          backgroundColor: '#EEEEEE',
          position: 'relative',
          display: 'flex',
          flexFlow: 'row nowrap',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}
      >
        {/* back button */}
        <div
          style={{ flex: '0 0 48px', display: 'flex', justifyContent: 'center' }}
          onTouchTap={this.back}
        >
          <IconButton style={{ display: this.state.root ? 'none' : '' }}>
            <BackIcon color="rgba(0,0,0,0.54)" style={{ height: 16, width: 16 }} />
          </IconButton>
        </div>

        {/* name */}
        <div
          style={{
            flex: '0 0 240px',
            color: 'rgba(0,0,0,0.54)',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontWeight: 500
          }}
        >
          { this.state.root ? '传输错误列表' : convert(this.state.list[0].error.code) }
        </div>
      </div>
    )
  }

  render() {
    return (
      <div style={{ width: 336, height: 448 }}>
        {/* header */}
        { this.renderHeader() }

        {/* list of directory */}
        <div
          style={{
            width: 336,
            height: 324,
            overflowY: 'auto',
            color: 'rgba(0,0,0,0.87)'
          }}
        >
          {
            !!this.state.list.length && this.state.list.map((node, index) => (
              <Row
                key={index.toString()}
                node={node}
                enter={this.enter}
                isRoot={this.state.root}
              />
            ))
          }
        </div>

        {/* confirm button */}
        <div style={{ height: 68, display: 'flex', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
          <div style={{ flexGrow: 1 }} />
          <RaisedButton
            primary
            style={{ marginRight: 16 }}
            label="确定"
            onTouchTap={() => this.props.onRequestClose()}
          />
        </div>
      </div>
    )
  }
}

export default ErrorTree
