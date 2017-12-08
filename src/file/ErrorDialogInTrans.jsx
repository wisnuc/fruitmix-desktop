import React from 'react'
import i18n from 'i18n'
import { shell, clipboard } from 'electron'
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
import JSONTree from 'react-json-tree'
import FlatButton from '../common/FlatButton'

const convert = (code) => {
  switch (code) {
    case 'EEXIST':
      return i18n.__('EEXIST')
    case 'ECONNRESET':
      return i18n.__('ECONNRESET')
    case 'ECONNREFUSED':
      return i18n.__('ECONNREFUSED')
    case 'ECONNEND':
      return i18n.__('ECONNEND')
    case 'ENOENT':
      return i18n.__('ENOENT')
    case 'EPERM':
      return i18n.__('EPERM')
    case 'EACCES':
      return i18n.__('EACCES')
    case 'ENOSPC':
      return i18n.__('ENOSPC')
    case 'ENXIO':
      return i18n.__('ENXIO')
    case 'ESHA256MISMATCH':
      return i18n.__('ESHA256MISMATCH')
    case 'EOVERSIZE':
      return i18n.__('EOVERSIZE')
    case 'EUNDERSIZE':
      return i18n.__('EUNDERSIZE')
    case 'ENAME':
      return i18n.__('ENAME')
    case 'ETYPE':
      return i18n.__('ETYPE')
    case 'EIGNORE':
      return i18n.__('EIGNORE')
    default:
      return code || i18n.__('Unknown Error')
  }
}

const translateStatus = (statusCode) => {
  if (statusCode >= 500) return i18n.__('Internal Server Error')
  switch (statusCode) {
    case 404:
      return i18n.__('ENOTFOUND')
    default:
      return statusCode ? i18n.__('Request Failed %s', statusCode) : i18n.__('Unknown Error')
  }
}

class ErrorTree extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      expand: false
    }

    this.retry = () => {
      const uuid = this.props.errors[0].task
      this.props.resume(uuid)
      this.props.onRequestClose()
    }

    this.ignore = () => {
      const uuid = this.props.errors[0].task
      this.props.ignore(uuid)
      this.props.onRequestClose()
    }

    this.copyText = () => {
      clipboard.writeText(JSON.stringify(this.props.errors))
    }
  }

  renderRow(node, key) {
    const code = node.error.code ||
      (node.error.response && node.error.response[0] && node.error.response[0].error && node.error.response[0].error.code) ||
      (node.error.response && node.error.response.error && node.error.response.error.code)
    const error = code ? convert(code) : translateStatus(node.error.status)
    let name = ''
    if (node.entry && typeof node.entry === 'object') name = node.entry.name
    if (node.entry && typeof node.entry === 'string') name = node.entry.replace(/^.*\//, '').replace(/^.*\\/, '')
    if (node.entries && typeof node.entries[0] === 'object') name = node.entries[0].newName
    if (node.entries && typeof node.entries[0] === 'string') name = node.entries[0].replace(/^.*\//, '').replace(/^.*\\/, '')

    const svgStyle = { color: 'rgba(0,0,0,0.54)', width: 16, height: 16 }
    return (
      <div style={{ height: 32, width: '100%', display: 'flex', alignItems: 'center' }} key={key} >
        <div style={{ margin: '-2px 4px 0 4px', display: 'flex' }}>
          {
            node.type === 'directory' ? <FileFolder style={svgStyle} />
            : node.type === 'file' ? <EditorInsertDriveFile style={svgStyle} />
            : <ErrorIcon style={svgStyle} />
          }
        </div>
        <div style={{ width: 540, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 5, fontSize: 13 }} >
          { name }
        </div>
        <div style={{ fontSize: 13 }} >
          { error }
        </div>
      </div>
    )
  }

  renderSource(errors) {
    const theme = {
      scheme: 'wisnuc',
      author: 'lxw',
      base00: '#1d1f21',
      base01: '#282a2e',
      base02: '#373b41',
      base03: '#969896',
      base04: '#b4b7b4',
      base05: '#c5c8c6',
      base06: '#e0e0e0',
      base07: '#ffffff',
      base08: '#CC342B',
      base09: '#F96A38',
      base0A: '#FBA922',
      base0B: '#00897b',
      base0C: '#3971ED',
      base0D: '#3971ED',
      base0E: '#A36AC7',
      base0F: '#3971ED'
    }

    return (
      <div>
        <JSONTree
          hideRoot
          data={errors}
          theme={theme}
          valueRenderer={raw => <span style={{ userSelect: 'text' }}>{raw}</span>}
          getItemString={type => (<span>{ type }</span>)}
          shouldExpandNode={(k, d, l) => k[0] === 'error' || l < 2}
        />
      </div>
    )
  }

  render() {
    const { expand } = this.state
    return (
      <div
        style={{
          width: expand ? 1080 : 780,
          height: expand ? 720 : 520,
          padding: '0px 24px 0px 24px',
          transition: 'all 225ms',
          overflow: 'hidden'
        }}
      >
        <div style={{ height: 56, display: 'flex', alignItems: 'center' }} >
          <div style={{ fontSize: 20 }}> { i18n.__('Error Dialog Title') } </div>
          <div style={{ flexGrow: 1 }} />
          <IconButton
            onTouchTap={() => this.props.onRequestClose()}
            style={{ width: 40, height: 40, padding: 10, marginRight: -10 }}
            iconStyle={{ width: 20, height: 20, color: 'rgba(0,0,0,0.54)' }}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <div style={{ fontSize: 14, marginBottom: 16, height: 20 }}> { i18n.__('Error Dialog Text') } </div>

        {/* list of errors */}
        <div style={{ width: '100%', height: expand ? 574 : 374, overflowY: 'auto', border: 'solid #ccc 1px' }} >
          {
            this.state.expand ? this.renderSource(this.props.errors)
              : this.props.errors.map((node, index) => this.renderRow(node, index.toString()))
          }
        </div>

        {/* confirm button */}
        <div style={{ height: 52, display: 'flex', alignItems: 'center', marginRight: -24 }}>
          <FlatButton
            primary
            label={this.state.expand ? i18n.__('Return') : i18n.__('Open Detail')}
            onTouchTap={() => this.setState({ expand: !this.state.expand })}
          />
          <div style={{ flexGrow: 1 }} />
          {
            !this.state.expand &&
              <FlatButton
                primary
                label={i18n.__('Ignore All')}
                onTouchTap={this.ignore}
              />
          }
          <FlatButton
            primary
            label={this.state.expand ? i18n.__('Copy to Clipboard') : i18n.__('Retry All')}
            onTouchTap={this.state.expand ? this.copyText : this.retry}
          />
        </div>
      </div>
    )
  }
}

export default ErrorTree
