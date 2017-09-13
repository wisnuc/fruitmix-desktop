import React from 'react'
import Debug from 'debug'
import { IconButton, Checkbox, RaisedButton, TextField, RadioButtonGroup, RadioButton } from 'material-ui'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import Promise from 'bluebird'
import request from 'superagent'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'
import { ShareDisk } from '../common/Svg'

const debug = Debug('component:file:Policy: ')

class PolicyDialog extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      value: '',
      checked: true,
      current: 0
    }

    this.response = []

    this.toggleCheck = () => this.setState({ checked: !this.state.checked })

    this.fire = () => {
      const session = this.props.data.session
      const response = this.response
      debug('this.fire', session, response)
      this.props.ipcRenderer.send('resolveConflicts', { session, response, conflicts: this.props.data.conflicts })
      this.props.onRequestClose()
    }

    this.cancel = () => {
      const session = this.props.data.session
      this.props.ipcRenderer.send('resolveConflicts', { session, response: null })
      this.props.onRequestClose()
    }

    this.next = () => {
      let current = this.state.current + 1
      const length = this.props.data.conflicts.length
      this.response[this.state.current] = this.state.value
      debug('this.next', current, length, this.state.checked, this.response, this.state.value)
      if (this.state.checked) {
        this.response.length = length
        this.response.fill(this.state.value, current, length)
        current = length
      }
      if (current === length) this.fire()
      else this.setState({ current })
    }

    this.handleChange = (value) => {
      this.response[this.state.current] = value
      this.setState({ value })
    }
  }

  renderChoice() {
    const { name, entryType, remote } = this.props.data.conflicts[this.state.current]
    debug('renderChoice', entryType, remote.type)
    const type = entryType === 'directory' ? '文件夹' : '文件'
    const remoteType = remote.type === 'directory' ? '文件夹' : '文件'
    const choices = [
      { value: 'rename', label: `保留，两个项目均保留，自动重命名新上传的${type}` },
      { value: 'replace', label: `替换，使用新上传的${type}替换已有${remoteType}` },
      { value: 'skip', label: `跳过，该${type}将不会被上传` }
    ]
    if (entryType === 'directory' && entryType === remote.type) {
      choices.splice(0, 1, { value: 'merge', label: '合并，两个文件夹的内容都保留' })
    }
    let text = `${type} “${name}” 在上传目标路径下已经存在，请选择您要执行的操作：`
    if (entryType !== remote.type) {
      text = `上传${type} “${name}” 时，发现上传目标路径下已经存在同名的${remoteType}，请选择您要执行的操作：`
    }

    /* default: choose the first option */
    if (!this.state.value) Object.assign(this.state, { value: choices[0].value })
    debug('this.state.value', this.state.value, 'choices[0].value', choices[0].value)
    return (
      <div>
        {/* title */}
        <div style={{ fontSize: 16 }}>
          { text }
        </div>
        <div style={{ height: 20 }} />

        {/* choice */}
        <RadioButtonGroup
          onChange={(e, value) => this.handleChange(value)}
          defaultSelected={choices[0].value}
          name={'policy'}
        >
          {
            choices.map(c => (
              <RadioButton
                key={c.value}
                style={{ marginBottom: 16 }}
                labelStyle={{ color: '#757575' }}
                iconStyle={{ fill: this.state.value === c.value ? this.props.primaryColor : '#757575' }}
                value={c.value}
                label={c.label}
              />
            ))
          }
        </RadioButtonGroup>
      </div>
    )
  }

  render() {
    debug('PolicyDialog', this.props, this.state)
    return (
      <div style={{ width: 576, padding: '24px 24px 0px 24px' }}>

        {/* title and choice */}
        { this.renderChoice() }
        <div style={{ height: 24 }} />

        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          { this.props.data.conflicts.length - this.state.current - 1 > 0 &&
            <Checkbox
              label={`其他冲突也执行此操作（还有${this.props.data.conflicts.length - this.state.current - 1}项）`}
              labelStyle={{ color: '#757575' }}
              iconStyle={{ fill: this.state.checked ? this.props.primaryColor : '#757575' }}
              checked={this.state.checked}
              onCheck={this.toggleCheck}
              style={{ width: 456 }}
            />
          }
          <FlatButton label="取消" onTouchTap={this.cancel} primary />
          <FlatButton label="确认" onTouchTap={this.next} primary />
        </div>
      </div>
    )
  }
}

export default PolicyDialog
