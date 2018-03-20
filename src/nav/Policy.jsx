import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { Checkbox, RadioButtonGroup, RadioButton } from 'material-ui'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:file:Policy: ')

class PolicyDialog extends React.PureComponent {
  constructor (props) {
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
      debug('this.fire', session, response, this.props.data)

      if (this.props.data.actionType) this.props.handleTask(session, response, this.props.data.conflicts)
      else this.props.ipcRenderer.send('resolveConflicts', { session, response, conflicts: this.props.data.conflicts })

      this.props.onRequestClose()
    }

    this.cancel = () => {
      const session = this.props.data.session
      if (!this.props.data.actionType) this.props.ipcRenderer.send('resolveConflicts', { session, response: null })
      this.props.onRequestClose()
    }

    this.next = () => {
      let current = this.state.current + 1
      const c = this.props.data.conflicts
      this.response[this.state.current] = this.state.value
      debug('this.next', current, c.length, this.state.checked, this.response, this.state.value)
      if (this.state.checked) {
        while (c[current] && c[current].type === c[current - 1].type) {
          this.response[current] = this.state.value
          current += 1
        }
      }
      if (current === c.length) this.fire()
      else this.setState({ current, value: '' })
    }

    this.handleChange = (value) => {
      this.response[this.state.current] = value
      this.setState({ value })
    }
  }

  renderChoice () {
    const { name, entryType, remote } = this.props.data.conflicts[this.state.current]
    debug('renderChoice', entryType, remote.type, this.props.data)
    const type = entryType === 'directory' ? i18n.__('Directory') : i18n.__('File')
    const remoteType = remote.type === 'directory' ? i18n.__('Directory') : i18n.__('File')
    let action = i18n.__('Uploading')
    if (this.props.data.actionType === 'copy') action = i18n.__('Copying')
    if (this.props.data.actionType === 'move') action = i18n.__('Moving')
    /* file => file */
    const choices = [
      { value: 'rename', label: i18n.__('Rename Text {{type}} {{action}}', { type, action }) },
      { value: 'replace', label: i18n.__('Replace Text {{type}} {{remoteType}} {{action}}', { type, remoteType, action }) },
      { value: 'skip', label: i18n.__('Skip Text {{type}} {{action}}', { type, action }) }
    ]

    /* directory => directory */
    if (entryType === 'directory' && entryType === remote.type) {
      choices.splice(
        0, 2,
        { value: 'merge', label: i18n.__('Merge Text {{action}}', { action }) },
        { value: 'overwrite', label: i18n.__('Overwrite Text {{action}}', { action }) }
      )
    }

    let text = i18n.__('Default Conflict Title {{type}} {{name}} {{action}}', { type, name, action })

    /* directory => file || file => directory */
    if (entryType !== remote.type) {
      text = i18n.__('Alt Conflict Title {{type}} {{name}} {{remoteType}} {{action}}', { type, name, remoteType, action })
    }

    /* default: choose the first option */
    if (!this.state.value) Object.assign(this.state, { value: choices[0].value })
    return (
      <div>
        {/* title */}
        <div style={{ wordBreak: 'break-all' }}> { text } </div>
        <div style={{ height: 20 }} />

        {/* choice */}
        <RadioButtonGroup
          key={this.state.current}
          onChange={(e, value) => this.handleChange(value)}
          defaultSelected={choices[0].value}
          name="policy"
        >
          {
            choices.map(c => (
              <RadioButton
                key={c.value}
                style={{ marginBottom: 16 }}
                labelStyle={{ color: '#757575', fontSize: 14 }}
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

  render () {
    debug('PolicyDialog', this.props, this.state)
    const c = this.props.data.conflicts
    const leftCount = c.filter((conflict, index) => index > this.state.current && conflict.type === c[this.state.current].type).length
    return (
      <div style={{ width: 576, padding: '24px 24px 0px 24px' }}>

        {/* title and choice */}
        { this.renderChoice() }
        <div style={{ height: 24 }} />

        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
          { leftCount > 0 &&
            <Checkbox
              label={i18n.__('Apply All Text %d', leftCount)}
              labelStyle={{ color: '#757575', fontSize: 14 }}
              iconStyle={{ fill: this.state.checked ? this.props.primaryColor : '#757575' }}
              checked={this.state.checked}
              onCheck={this.toggleCheck}
              style={{ width: 410 }}
            />
          }
          <div style={{ flexGrow: 1 }} />
          <FlatButton label={i18n.__('Cancel')} onTouchTap={this.cancel} primary />
          <FlatButton label={i18n.__('Confirm')} onTouchTap={this.next} primary />
        </div>
      </div>
    )
  }
}

export default PolicyDialog
