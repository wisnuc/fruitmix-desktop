import React from 'react'
import i18n from 'i18n'
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
          label={stepIndex === 2 ? i18n.__('Create') : stepIndex === 3
              ? i18n.__('Bind WeChat Title') : stepIndex === 4 ? i18n.__('Enter App') : i18n.__('Next Step')}
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
            label={step === 3 ? i18n.__('Ignore') : i18n.__('Previous Step')}
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
    const model = blk.model ? blk.model : i18n.__('Unknown Disk Model')
    const name = blk.name
    const size = prettysize(blk.size * 512)
    const iface = blk.isATA ? 'ATA' :
      blk.isSCSI ? 'SCSI' :
        blk.isUSB ? 'USB' : i18n.__('Unknown Disk Iterface')

    return `${model}, ${name}, ${size}, ${iface}`
  }

  renderConfirmation() {
    const storage = this.props.device.storage.isFulfilled()
      ? this.props.device.storage.value() : null

    if (!storage) return null

    const lineStyle = { margin: '20px 0', color: 'rgba(0,0,0,0.87)', fontSize: 14 }
    return (
      <div>
        <div style={lineStyle}> { i18n.__('Select Disk') }</div>
        <ul style={lineStyle}>
          { storage.blocks
              .filter(blk => this.state.volumeselect.selection.indexOf(blk.name) !== -1)
              .map(blk => (<li key={blk.name}>{this.blockToString(blk)}</li>)) }
        </ul>
        <div style={lineStyle}>{ i18n.__('Mode Selected')} {this.state.volumeselect.mode} </div>
        <div style={lineStyle}>{ i18n.__('User Name Used')} {this.state.userpass.username}</div>
      </div>
    )
  }

  finishedInfo() {
    const { mkfs, storage, install, boot, users, firstUser, token } = this.props.device
    console.log('this.props.device', this.props.device)
    const getError = h => h && h.err

    if (!mkfs || mkfs.isPending()) {
      return ['busy', i18n.__('Creating Filesystem')]
    } else if (mkfs.isRejected()) {
      return ['error', i18n.__('Create Filesystem Failed'), getError(mkfs)]
    } else if (!storage || storage.isPending()) {
      return ['busy', i18n.__('Updating Filesystem')]
    } else if (storage.isRejected()) {
      return ['error', i18n.__('Update Filesystem Failed'), getError(storage)]
    } else if (!install || install.isPending()) {
      return ['busy', i18n.__('Installing App')]
    } else if (install.isRejected()) {
      return ['error', i18n.__('Intasll App Failed'), getError(install)]
    } else if (!boot || boot.isPending() || (boot.isFulfilled() && boot.value().fruitmix === null)
      || (boot.isFulfilled() && boot.value().fruitmix && boot.value().fruitmix.state === 'starting')) {
      return ['busy', i18n.__('Starting App')]
    } else if (boot.isRejected() || (boot.isFulfilled() && boot.value().fruitmix
      && boot.value().fruitmix.state === 'exited')) {
      return ['error', i18n.__('Starting App Failed'), getError(boot)]
    } else if (!firstUser || firstUser.isPending()) {
      return ['busy', i18n.__('Creating User')]
    } else if (firstUser.isRejected()) {
      return ['error', i18n.__('Create User Failed'), getError(firstUser)]
    } else if (!users || users.isPending()) {
      return ['busy', i18n.__('Getting User List')]
    } else if (users.isRejected()) {
      return ['error', i18n.__('Get User List Failed'), getError(users)]
    } else if (!token || token.isPending()) {
      return ['busy', i18n.__('Logining')]
    } else if (token.isRejected()) {
      return ['error', i18n.__('Login Failed'), getError(token)]
    }
    return ['success', i18n.__('Install App Success')]
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
              label={info[0] === 'success' ? i18n.__('Next Step') : i18n.__('Retry')}
              disableTouchRipple
              disableFocusRipple
              primary
              onTouchTap={() => (info[0] === 'success' ? this.setState({ stepIndex: 3 }) : this.retry())}
              style={{ marginRight: 12 }}
            />
          }
        </div>
      </div>
    )
  }

  renderBottomButton() {
    let label
    let action

    if (this.state.finished && this.finishedInfo()[0] !== 'busy') {
      label = i18n.__('Exit')
      action = this.props.onFail
    } else if (!this.state.finished) {
      label = i18n.__('Abort')
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
    const title = this.props.title || i18n.__('Initialization Wizard')
    const { finished, stepIndex } = this.state
    const storage = this.props.device.storage.isFulfilled() ? this.props.device.storage.value() : null

    return (
      <div style={{ width: '100%', minHeight: 640, backgroundColor: '#FAFAFA', position: 'relative', overflowY: 'auto' }}>
        <div style={{ margin: '28px 64px 3px 64px', fontSize: 28, color: 'rgba(0,0,0,0.54)' }}>{ title }</div>
        <div style={{ marginLeft: 64, marginRight: 64 }}>
          <Stepper
            activeStep={stepIndex}
            orientation="vertical"
            connector={<div style={{ height: 8, width: 1, backgroundColor: '#bdbdbd', margin: '0px 0px 12px 25px' }} />}
          >
            <Step>
              <StepLabel>{ i18n.__('Create Volume Title') }</StepLabel>
              <StepContent>
                <CreatingVolumeDiskSelection storage={storage} {...this.bindVState('volumeselect')} />
                { this.renderStepActions(0) }
              </StepContent>
            </Step>
            <Step style={{ marginTop: -28 }}>
              <StepLabel>{ i18n.__('Create First User Title') }</StepLabel>
              <StepContent>
                <p>{ i18n.__('Create First User Text') }</p>
                <UsernamePassword {...this.bindVState('userpass')} />
                { this.renderStepActions(1) }
              </StepContent>
            </Step>
            <Step style={{ marginTop: -28 }}>
              <StepLabel>{ i18n.__('Confirm') }</StepLabel>
              <StepContent>
                { !this.state.finished && this.renderConfirmation() }
                { !this.state.finished && this.renderStepActions(2) }
                { this.state.finished && this.renderFinished() }
              </StepContent>
            </Step>
            <Step style={{ marginTop: -28 }}>
              <StepLabel>{ i18n.__('Bind WeChat Title') } </StepLabel>
              <StepContent>
                <p>{ i18n.__('Bind WeChat Text') }</p>
                { this.renderStepActions(3) }
              </StepContent>
            </Step>
            <Step style={{ marginTop: -28 }}>
              <StepLabel>{ i18n.__('Enter App') }</StepLabel>
              <StepContent>
                <p>{i18n.__('Install Wisnuc Success')}</p>
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
