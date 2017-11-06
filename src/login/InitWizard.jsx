import React from 'react'
import prettysize from 'prettysize'
import { RaisedButton, CircularProgress } from 'material-ui'
import { Step, Stepper, StepLabel, StepContent } from 'material-ui/Stepper'
import { teal500, pinkA200 } from 'material-ui/styles/colors'
import ErrorIcon from 'material-ui/svg-icons/alert/error-outline'
import CheckIcon from 'material-ui/svg-icons/navigation/check'
import ArrowDownwardIcon from 'material-ui/svg-icons/navigation/arrow-downward'
import CloseIcon from 'material-ui/svg-icons/navigation/close'

import UsernamePassword from './UsernamePassword'
import CreatingVolumeDiskSelection from './CreatingVolumeDiskSelection'
import ErrorBox from './ErrorBox'
import FlatButton from '../common/FlatButton'

const primaryColor = teal500
const accentColor = pinkA200

const StateUp = base => class extends base {
  setSubState(name, nextSubState) {
    const state = this.props.state || this.state
    const subState = state[name]
    const nextSubStateMerged = Object.assign(new subState.constructor(), subState, nextSubState)
    const nextState = { [name]: nextSubStateMerged }
    this.props.setState
      ? this.props.setState(nextState)
      : this.setState(nextState)
  }

  setSubStateBound(name) {
    const obj = this.setSubStateBoundObj || (this.setSubStateBoundObj = {})
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
      finished: false,
      stepIndex: 0,
      volumeselect: new CreatingVolumeDiskSelection.State(),
      userpass: new UsernamePassword.State()
    }

    this.handleNext = () => {
      const { stepIndex } = this.state
      this.setState(Object.assign({}, this.state, {
        stepIndex: stepIndex === 2 ? stepIndex : stepIndex + 1,
        finished: stepIndex >= 2
      }))

      if (stepIndex === 2) {
        const device = this.props.device
        const { selection, mode } = this.state.volumeselect
        const { username, password } = this.state.userpass

        device.initWizard({ target: selection, mode, username, password })
      }
    }

    this.handlePrev = () => {
      const { stepIndex } = this.state
      if (stepIndex > 0) this.setState({ stepIndex: stepIndex - 1 })
    }

    this.retry = () => {
      const device = this.props.device
      const { selection, mode } = this.state.volumeselect
      const { username, password } = this.state.userpass

      device.initWizard({ target: selection, mode, username, password })
    }
  }

  renderStepActions(step) {
    const { stepIndex } = this.state
    return (
      <div style={{ margin: '12px 0' }}>
        <RaisedButton
          label={stepIndex === 2 ? '创建' : stepIndex === 3 ? '绑定微信' : stepIndex === 4 ? '进入系统' : '下一步'}
          disableTouchRipple
          disableFocusRipple
          disabled={
            stepIndex === 0
              ? this.state.volumeselect.selection.length === 0 || !this.state.volumeselect.mode
              : stepIndex === 1
                ? !this.state.userpass.isInputOK()
              : stepIndex === 3 ? this.props.weChatStatus === 'success'
              : false
          }
          primary
          onTouchTap={() => (step < 3 ? this.handleNext() : step === 4 ? this.props.onOK() : this.props.bindWechat())}
          style={{ marginRight: 12 }}
        />
        {
          step > 0 &&
          <FlatButton
            label={step === 3 ? '忽略' : '上一步'}
            disabled={stepIndex === 0}
            disableTouchRipple
            disableFocusRipple
            onTouchTap={() => (step !== 3 ? this.handlePrev() : this.handleNext())}
          />
        }
      </div>
    )
  }

  blockToString(blk) {
    const model = blk.model ? blk.model : '(未知型号)'
    const name = blk.name
    const size = prettysize(blk.size * 512)
    const iface = blk.isATA ? 'ATA' :
      blk.isSCSI ? 'SCSI' :
        blk.isUSB ? 'USB' : '(未知接口)'

    return `${model}, ${name}, ${size}, ${iface}`
  }

  renderConfirmation() {
    const storage = this.props.device.storage.isFulfilled()
      ? this.props.device.storage.value() : null

    if (!storage) return null

    const lineStyle = { margin: '20px 0', color: 'rgba(0,0,0,0.87)', fontSize: 14 }
    return (
      <div>
        <div style={lineStyle}>选择磁盘：</div>
        <ul style={lineStyle}>
          { storage.blocks
              .filter(blk => this.state.volumeselect.selection.indexOf(blk.name) !== -1)
              .map(blk => (<li key={blk.name}>{this.blockToString(blk)}</li>)) }
        </ul>
        <div style={lineStyle}>模式：{this.state.volumeselect.mode} </div>
        <div style={lineStyle}>用户名：{this.state.userpass.username}</div>
      </div>
    )
  }

  finishedInfo() {
    const { mkfs, storage, install, boot, users, firstUser, token } = this.props.device
    console.log('this.props.device', this.props.device)
    const getError = h => h && h.err && h.err.response && h.err.response.body && h.err.response.body.message

    if (!mkfs || mkfs.isPending()) {
      return ['busy', '创建文件系统']
    } else if (mkfs.isRejected()) {
      return ['error', '创建文件系统失败', getError(mkfs)]
    } else if (!storage || storage.isPending()) {
      return ['busy', '更新文件系统信息']
    } else if (storage.isRejected()) {
      return ['error', '更新文件系统信息失败', getError(storage)]
    } else if (!install || install.isPending()) {
      return ['busy', '安装应用']
    } else if (install.isRejected()) {
      return ['error', '安装应用失败', getError(install)]
    } else if (!boot || boot.isPending() || (boot.isFulfilled() && boot.value().fruitmix === null)
      || (boot.isFulfilled() && boot.value().fruitmix && boot.value().fruitmix.state === 'starting')) {
      return ['busy', '启动应用']
    } else if (boot.isRejected() || (boot.isFulfilled() && boot.value().fruitmix
      && boot.value().fruitmix.state === 'exited')) {
      return ['error', '启动应用失败', getError(boot)]
    } else if (!firstUser || firstUser.isPending()) {
      return ['busy', '创建用户']
    } else if (firstUser.isRejected()) {
      return ['error', '创建用户失败', getError(firstUser)]
    } else if (!users || users.isPending()) {
      return ['busy', '获取最新用户列表']
    } else if (users.isRejected()) {
      return ['error', '获取最新用户列表失败', getError(users)]
    } else if (!token || token.isPending()) {
      return ['busy', '登录']
    } else if (token.isRejected()) {
      return ['error', '登录失败', getError(token)]
    }
    return ['success', '安装成功']
  }

  renderFinished() {
    if (!this.state.finished) return null

    const info = this.finishedInfo()

    const boxStyle = {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      marginTop: -6
    }

    return (
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
          <div style={{ width: 48, marginLeft: 12, display: 'flex', alignItems: 'center' }}>
            { info[0] === 'busy' && <CircularProgress size={32} thickness={2.5} /> }
            { info[0] === 'success' && <CheckIcon color={primaryColor} style={{ width: 40, height: 40 }} /> }
            { info[0] === 'error' && <CloseIcon color={accentColor} style={{ width: 40, height: 40 }} /> }
          </div>
          <div style={{ fontSize: 24, color: 'rgba(0,0,0,0.54)', marginLeft: 24 }} >
            { info[0] === 'error' ? <ErrorBox style={boxStyle} text={info[1]} error={info[2]} /> : info[1] }
          </div>
        </div>
        <div style={{ height: 36, margin: '24px 0px 12px 0px' }}>
          {
            info[0] !== 'busy' &&
            <RaisedButton
              label={info[0] === 'success' ? '下一步' : '重试'}
              disableTouchRipple
              disableFocusRipple
              primary
              onTouchTap={() => (info[0] === 'success' ? this.setState({ stepIndex: 3 }) : this.retry())}
              style={{ marginRight: 12 }}
            />
          }
        </div>
          {/*
        <div style={{ flex: '0 0 24px' }}>
          { info[0] === 'success' &&
            ? <FlatButton label="进入系统" onTouchTap={this.props.onOK} />
            : <FlatButton label="退出" onTouchTap={this.props.onCancel} />
        </div>
        */}
      </div>
    )
  }

  renderBottomButton() {
    let label
    let action

    if (this.state.finished && this.finishedInfo()[0] !== 'busy') {
      label = '退出'
      action = this.props.onFail
    } else if (!this.state.finished) {
      label = '放弃'
      action = this.props.onCancel
    }

    return (
      <div
        style={{
          width: '100%',
          height: 64,
          position: 'absolute',
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}
      >
        { label && <FlatButton label={label} primary onTouchTap={action} style={{ marginBottom: -8 }} /> }
      </div>
    )
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.weChatStatus === 'success') this.handleNext()
  }

  render() {
    const title = this.props.title || '初始化向导'
    const { finished, stepIndex } = this.state
    const storage = this.props.device.storage.isFulfilled() ? this.props.device.storage.value() : null

    return (
      <div style={{ width: '100%', minHeight: 640, backgroundColor: '#FAFAFA', position: 'relative', overflowY: 'auto' }}>
        <div style={{ margin: '28px 64px 3px 64px', fontSize: 28, color: 'rgba(0,0,0,0.54)' }}>{ title }</div>
        <div style={{ marginLeft: 64, marginRight: 64 }}>
          <Stepper
            activeStep={stepIndex}
            orientation="vertical"
            connector={<ArrowDownwardIcon color="rgba(0,0,0,0.27)" style={{ height: 16, width: 16, margin: '-2px 10px 10px 18px' }} />}
          >
            <Step>
              <StepLabel>创建磁盘卷</StepLabel>
              <StepContent>
                <CreatingVolumeDiskSelection storage={storage} {...this.bindVState('volumeselect')} />
                { this.renderStepActions(0) }
              </StepContent>
            </Step>
            <Step style={{ marginTop: -28 }}>
              <StepLabel>创建第一个用户</StepLabel>
              <StepContent>
                <p>请输入第一个用户的用户名和密码，该用户会成为系统权限最高的管理员。</p>
                <UsernamePassword {...this.bindVState('userpass')} />
                { this.renderStepActions(1) }
              </StepContent>
            </Step>
            <Step style={{ marginTop: -28 }}>
              <StepLabel>确认安装</StepLabel>
              <StepContent>
                { !this.state.finished && this.renderConfirmation() }
                { !this.state.finished && this.renderStepActions(2) }
                { this.state.finished && this.renderFinished() }
              </StepContent>
            </Step>
            <Step style={{ marginTop: -28 }}>
              <StepLabel>绑定微信</StepLabel>
              <StepContent>
                <p>您可以选择现在绑定微信，成功绑定后就可通过微信扫码，远程登录设备。</p>
                { this.renderStepActions(3) }
              </StepContent>
            </Step>
            <Step style={{ marginTop: -28 }}>
              <StepLabel>进入系统</StepLabel>
              <StepContent>
                <p>您已成功创建了WINUC系统。</p>
                { this.renderStepActions(4) }
              </StepContent>
            </Step>
          </Stepper>
        </div>
        { this.renderBottomButton() }
      </div>
    )
  }
}

export default InitWizard
