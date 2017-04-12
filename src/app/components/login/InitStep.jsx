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

  finishedInfo() {

    let { mkfs, storage, install, boot, users, firstUser, token } = this.props.device

    if (!mkfs || mkfs.isPending())
      return ['busy', '创建文件系统']
    else if (mkfs.isRejected())
      return ['error', '创建文件系统失败']
    else if (!storage || storage.isPending())
      return ['busy', '更新文件系统信息']
    else if (storage.isRejected())
      return ['error', '更新文件系统信息失败']
    else if (!install || install.isPending())
      return ['busy', '安装应用']
    else if (install.isRejected())
      return ['error', '安装应用失败']
    else if (!boot || boot.isPending() 
      || (boot.isFulfilled() && boot.value().fruitmix === null)
      || (boot.isFulfilled() && boot.value().fruitmix 
        && boot.value().fruitmix.state === 'starting'))
      return ['busy', '启动应用']
    else if (boot.isRejected() 
      || (boot.isFulfilled() && boot.value().fruitmix 
        && boot.value().fruitmix.state === 'exited'))
      return ['error', '启动应用失败']
    else if (!firstUser || firstUser.isPending())
      return ['busy', '创建用户']
    else if (firstUser.isRejected()) 
      return ['error', '创建用户失败']
    else if (!users || users.isPending())
      return ['busy', '获取最新用户列表']
    else if (users.isRejected())
      return ['error', '获取最新用户列表失败']
    else if (!token || token.isPending())
      return ['busy', '登录']
    else if (token.isRejected())
      return ['error', '登录失败']
    else 
      return ['success', '成功']
  }

  renderFinished() {

    if (!this.state.finished) return null

    let info = this.finishedInfo() 

    return (
      <div style={{width: '100%', 
        display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{flex: '0 0 48px'}}>
          { info[0] === 'busy' && <CircularProgress /> }
        </div>
        <div style={{flex: '0 0 64px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, color: 'rgba(0,0,0,0.54)'}}>
          { info[1] }
        </div>
        <div style={{flex: '0 0 48px'}}>
          { info[0] === 'success' 
              ? <FlatButton label='进入系统' onTouchTap={this.props.onOK} />          
              : <FlatButton label='退出' /> }
        </div>
      </div>
    )
  }

  renderBottomButton() {
    
    let label, action

    if (this.state.finished && this.finishedInfo()[0] === 'error') {
      label = '退出'
      action = this.props.onFail
    }
    else if (!this.state.finished) {
      label = '放弃'
      action = this.props.onCancel
    }

    return (
      <div style={{width: '100%', height: 64, position: 'absolute', bottom: 0, 
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
        { label && <FlatButton label={label} primary={true} onTouchTap={action}/> }
      </div>
    )
  }

  render() {

    const {finished, stepIndex} = this.state

    const titleStyle = {
      margin: '34px 64px 12px 64px',
      fontSize: 34, 
      color: 'rgba(0,0,0,0.54)', 
    }

    const storage = 
      this.props.device.storage.isFulfilled() 
        ? this.props.device.storage.value()
        : null

    return (
      <div style={{ width: '100%', height: 640, backgroundColor: '#FAFAFA', position: 'relative', overflowY: 'auto' }}>

        <div style={titleStyle}>初始化向导</div>
        <div style={{marginLeft: 64, marginRight: 64}}>
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
        { this.renderBottomButton() }
      </div>
    )
  }
}

export default InitWizard
