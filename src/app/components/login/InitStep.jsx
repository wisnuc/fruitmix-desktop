import React from 'react'

import { RaisedButton, Checkbox, Dialog, Divider, TextField, CircularProgress } from 'material-ui'
import FlatButton from '../common/FlatButton'
import { Step, Stepper, StepLabel, StepContent } from 'material-ui/Stepper'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import { cyan500, red400, redA200 } from 'material-ui/styles/colors'

import { ipcRenderer } from 'electron'
import prettysize from 'prettysize'
import request from 'superagent'

import UsernamePassword from './UsernamePassword'
import CreatingVolumeDiskSelection1 from './CreatingVolumeDiskSelection1'

const StateUp = base => class extends base {

  setSubState(name, nextSubState) {
    let state = this.props.state || this.state
    let subState = state[name]
    let nextSubStateMerged = Object.assign(new subState.constructor(), subState, nextSubState)
    let nextState = { [name]: nextSubStateMerged }
    this.props.setState
      ? this.props.setState(nextState)
      : this.setState(nextState)
  }

  setSubStateBound(name) {
    let obj = this.setSubStateBoundObj || (this.setSubStateBoundObj = {})
    return obj[name] ? obj[name] : (obj[name] = this.setSubState.bind(this, name))
  }

  bindVState(name) {
    return {
      state: this.props.state ? this.props.state[name] : this.state[name],
      setState: this.setSubStateBound(name)
    }
  }
}

class InitWizard extends StateUp(React.Component) {

  constructor(props) {

    super(props)

    this.state = {

      // stepper
      finished: false,
      stepIndex: 0,

      volumeselect: new CreatingVolumeDiskSelection1.State(),
      userpass: new UsernamePassword.State(),
    }

    this.mir = (type, data, callback) => {
      request
        .post(`http://${this.props.address}:3000/system/mir/${type}`)
        .timeout(30000)
        .send(data)
        .set('Accept', 'application/json')
        .end((err, res) => callback(err, res && res.body))
    }

    this.creatingNewVolume = () => {

      this.mir('mkfs', {
        type: 'btrfs',
        target: this.state.volumeselect.selection,
        mode: this.state.volumeselect.mode
      }, (err, body) => {

        if (err) {
          console.log('mkfs failed', err.message, body && body.message)
          return this.setState({ dialogText: ['创建磁盘阵列失败', err.message, body && body.message] })
        }

        console.log(body)
        this.useExisting(body)
      })
    }

    this.useExisting = uuid => {
      this.mir('init', {
        target: uuid,
        username: this.state.userpass.username,
        password: this.state.userpass.password
      }, (err, body) => {

        if (err) {
          console.log('init failed', err.message, body && body.message)
          return this.setState({ dialogText: ['初始化用户失败', err.message, body && body.message] })
        }

        this.mir('run', { target: uuid }, (err, body) => {

          if (err) {
            console.log('run failed', err.message, body && body.message)
            return this.setState({ dialogText: ['运行新系统失败', err.message, body && body.message] })
          }
          setTimeout(() => ipcRenderer.send('login', this.state.userpass.username, this.state.userpass.password), 1000)
        })
      })
    }
  }

  handleNext() {
    const {stepIndex} = this.state
    this.setState(Object.assign({}, this.state, {
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2,
    }))

    if (stepIndex === 2) {
      let device = this.props.device
      let { selection, mode } = this.state.volumeselect
      let { username, password } = this.state.userpass

      device.initWizard({ type: 'btrfs', target: selection, mode, username, password })
    }
  }

  handlePrev() {
    const {stepIndex} = this.state
    if (stepIndex > 0) this.setState({stepIndex: stepIndex - 1})
  }

  renderStepActions(step) {

    const {stepIndex} = this.state
    return (
      <div style={{margin: '12px 0'}}>
        <RaisedButton
          label={stepIndex === 2 ? '完成' : '下一步'}
          disableTouchRipple={true}
          disableFocusRipple={true}
          disabled={
            stepIndex === 0 
              ? this.state.volumeselect.selection.length === 0 || !this.state.volumeselect.mode
              : stepIndex === 1
                ? !this.state.userpass.isInputOK()
                : false
          }
          primary={true}
          onTouchTap={this.handleNext.bind(this)}
          style={{marginRight: 12}}
        />
        {step > 0 && (
          <FlatButton
            label="上一步"
            disabled={stepIndex === 0}
            disableTouchRipple={true}
            disableFocusRipple={true}
            onTouchTap={this.handlePrev.bind(this)}
          />
        )}
      </div>
    )
  }

  blockToString (blk) {

    let model = blk.model ? blk.model : '(未知型号)'
    let name = blk.name
    let size = prettysize(blk.size * 512)
    let iface = blk.isATA ? 'ATA' :
                blk.isSCSI ? 'SCSI' :
                blk.isUSB ? 'USB' : '(未知接口)'

    return `${model}, ${name}, ${size}, ${iface}`
  }

  renderConfirmation() {

    const storage = this.props.device.storage.isFulfilled()
      ? this.props.device.storage.value() : null

    if (!storage) return null

    const lineStyle = { margin: '20px 0', color: 'rgba(0,0,0,0.87)', fontSize: 14}
    return (
      <div>
        <div style={lineStyle}>选择磁盘：</div>
        <ul style={lineStyle}>
          { storage.blocks
              .filter(blk => this.state.volumeselect.selection.indexOf(blk.name) !== -1)
              .map(blk => (<li>{this.blockToString(blk)}</li>)) }
        </ul>
        <div style={lineStyle}>模式：{this.state.volumeselect.mode} </div>
        <div style={lineStyle}>用户名：{this.state.userpass.username}</div>
      </div>
    )
  }

  renderFinishedString() {
    if (this.props.device.mkfs.isPending())
      return '正在创建文件系统'
    else if (this.props.device.mkfs.isRejected())
      return this.props.device.mkfs.reason().message
    else if (this.props.device.mkfs.isFinished())
      return this.props.device.mkfs.value()
    else
      return 'unexpected'
  }

  renderFinished() {

    if (!this.state.finished) return null
    if (this.state.dialogText) return null
    return (
      <div style={{width: '100%', height: 100, 
        display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 64}}>
        <CircularProgress />
        <div style={{marginTop: 16, fontSize: 24, opacity: 0.54}}>
          { this.renderFinishedString() }
        </div>
      </div>
    )
  }

  render() {

    const {finished, stepIndex} = this.state;

    const titleStyle = {
      marginTop: 34, 
      marginBottom: 12, 
      fontSize: 34, 
      color: '#000', 
      opacity: this.props.showContent ? 0.54 : 0, 
      transition:'opacity 150ms'
    }

    const storage = 
      this.props.device.storage.isFulfilled() 
        ? this.props.device.storage.value()
        : null

    return (
      <div style={{
        width: '100%', 
        height: '100%',
        backgroundColor: '#FAFAFA', 
        boxSizing: 'border-box', 
        paddingLeft: 64, 
        paddingRight: 64, 
        overflowY: 'auto', 
      }}>
        <div style={titleStyle}>初始化向导</div>
        <div style={{opacity: this.props.showContent ? 1 : 0, transition:'opacity 150ms'}}>
          <Stepper activeStep={stepIndex} orientation="vertical">
            <Step>
              <StepLabel>创建磁盘卷</StepLabel>
              <StepContent>
                <CreatingVolumeDiskSelection1 storage={storage} {...this.bindVState('volumeselect')} />
                { this.renderStepActions(0) }
              </StepContent>
            </Step>
            <Step>
              <StepLabel>创建第一个用户</StepLabel>
              <StepContent>
                <p>请输入第一个用户的用户名和密码，该用户会成为系统权限最高的管理员。</p>
                <UsernamePassword {...this.bindVState('userpass')} />
                { this.renderStepActions(1) }
              </StepContent>
            </Step>
            <Step>
              <StepLabel>确认</StepLabel>
              <StepContent>
                { this.renderConfirmation() }
                { this.renderStepActions(2) }
              </StepContent>
            </Step>
          </Stepper>
          { this.renderFinished() }
        </div>
        <Dialog
          contentStyle={{width: 560, height: 480}}
          title='遇到错误'
          actions={[
            <FlatButton label='进入维护模式' onTouchTap={this.props.onMaintain} />,
            <FlatButton
              label='重置向导'
              onTouchTap={() => {
                this.setState({
                  finished: false,
                  stepIndex: 0,
                  volumeselect: new CreatingVolumeDiskSelection1.State(),
                  userpass: new UsernamePassword.State(),
                  dialogText: undefined
                })
              }}
            />
          ]}
          modal={true}
          open={!!this.state.dialogText}
        >
          { this.state.dialogText && this.state.dialogText.map(line => <div>{line}</div>) }
        </Dialog>
      </div>
    )
  }
}

export default InitWizard
