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

class InitStep extends StateUp(React.Component) {

  constructor(props) {

    super(props)

    this.hasGoodVolume = !!props.storage.volumes.find(vol => vol.isBtrfs && !vol.isMissing)
		console.log('this.hasGoodVolume',this.hasGoodVolume)

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

    this.handleNext = () => {
      const {stepIndex} = this.state
      this.setState(Object.assign({}, this.state, {
        stepIndex: stepIndex + 1,
        finished: stepIndex >= 2,
      }))
    }

    this.handlePrev = () => {
      const {stepIndex} = this.state;
      if (stepIndex > 0) {
        this.setState(Object.assign({}, this.state, {stepIndex: stepIndex - 1}))
      }
    }

    this.renderStepActions = (step) => {

        const {stepIndex} = this.state;

        return (
          <div style={{margin: '12px 0'}}>
            <RaisedButton
              label={stepIndex === 2 ? '完成' : '下一步'}
              disableTouchRipple={true}
              disableFocusRipple={true}
              primary={true}
              onTouchTap={this.handleNext}
              style={{marginRight: 12}}
            />
            {step > 0 && (
              <FlatButton
                label="上一步"
                disabled={stepIndex === 0}
                disableTouchRipple={true}
                disableFocusRipple={true}
                onTouchTap={this.handlePrev}
              />
            )}
          </div>
        );
      }

    this.radioButtonOnClick = value => {

    }

		this.changeExpanded = () => {

			let newExpanded = !this.props.expanded

			this.setState({
				expanded: newExpanded
			})

			this.props.callbackExpanded(changeExpanded)
		}

		this.changeShowContent = () => {

			let newShowContent = !this.props.showContent

			this.setState({
				showContent: newShowContent
			})

			this.props.callbackShowContent(changeShowContent)
		}
  }

  renderDiskRow (blk) {

    let model = blk.model ? blk.model : '未知型号'
    let name = blk.name
    let size = prettysize(blk.size * 512)
    let iface = blk.isATA ? 'ATA' :
                blk.isSCSI ? 'SCSI' :
                blk.isUSB ? 'USB' : '未知'

    let usage = blk.isFileSystem ? '文件系统' :
                blk.isPartitioned ? '有文件分区' : '未知'

    let valid = !blk.isRootFS && !blk.isActiveSwap && !blk.removable


    let comment
    if (blk.isRootFS)
      comment = '该磁盘含有rootfs，不可用'
    else if (blk.isActiveSwap)
      comment = '该磁盘含有在使用的交换分区，不可用'
    else if (blk.removable)
      comment = '该磁盘为可移动磁盘，WISNUC OS不支持使用可移动磁盘建立磁盘卷'
    else
      comment = '该磁盘可以加入磁盘卷'

    return (
      <div key={name} style={{width: '100%', height: this.state.volumeselect.selection.indexOf(name) !== -1 ? 40 : 0, display: 'flex', alignItems: 'center', color: !blk.isPartitioned ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.38)', overflow: 'hidden'}}>

        <div style={{flex: '0 0 160px'}}>{model}</div>
        <div style={{flex: '0 0 80px'}}>{name}</div>
        <div style={{flex: '0 0 80px'}}>{size}</div>
        <div style={{flex: '0 0 80px'}}>{iface}</div>
        <div style={{flex: '0 0 80px'}}>{usage}</div>
        <div style={{flex: '0 0 240px'}}>{comment}</div>
      </div>
    )
  }




  render() {

    const {finished, stepIndex} = this.state;
		console.log('this.props.expanded',this.props.expanded)

    return (
      <div style={{width: '100%'}}>
        <div style={{width: '100%', height: '100%'}}>
          <div style={{width: '100%', height: this.props.expanded ? 640 : 0, transition: 'height 300ms', overflow: 'hidden', backgroundColor: '#FAFAFA', boxSizing: 'border-box', paddingLeft: 64, paddingRight: 64,
            overflowY: 'auto'
          }}>
            <div style={{marginTop: 34, marginBottom: 12, fontSize: 34, color: '#000', opacity: this.props.showContent ? 0.54 : 0, transition:'opacity 150ms'}}>初始化向导</div>
            <div style={{opacity: this.props.showContent ? 1 : 0, transition:'opacity 150ms'}}>
              <Stepper activeStep={stepIndex} orientation="vertical">
                <Step>
                  <StepLabel>创建磁盘卷</StepLabel>

                  <StepContent>
                    <CreatingVolumeDiskSelection1 storage = {this.props.storage} {...this.bindVState( 'volumeselect')} />
                    <div style={{margin: '24px 0'}}>
                      <RaisedButton
                        label='下一步'
                        disabled={ this.state.volumeselect.selection.length === 0 || !this.state.volumeselect.mode }
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        primary={true}
                        onTouchTap={this.handleNext}
                        style={{marginRight: 12}}
                      />
                    </div>

                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>创建第一个用户</StepLabel>
                  <StepContent>
                    <p>请输入第一个用户的用户名和密码，该用户会成为系统权限最高的管理员。</p>

                    <UsernamePassword {...this.bindVState('userpass')} />

                    <div style={{margin: '12px 0'}}>
                      <RaisedButton
                        label='下一步'
                        disabled={ !this.state.userpass.isInputOK() }
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        primary={true}
                        onTouchTap={this.handleNext}
                        style={{marginRight: 12}}
                      />
                      <FlatButton
                        label="上一步"
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        onTouchTap={this.handlePrev}
                      />
                    </div>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>确认</StepLabel>
                  <StepContent>
                    <p style={{color: red400}}>请确认您输入的信息无误，点击完成键应用设置。</p>
                    <div style={{marginBottom: 12}}>磁盘信息</div>
                    <div style={{color: 'rgba(0,0,0,0.87)', marginBottom: 12}}>
                      <div style={{marginLeft: 10, width: 760, fontSize: 13}}>
                        <Divider />
                        <div style={{width: '100%', height: 32, display: 'flex', alignItems: 'center'}}>
                          <div style={{flex: '0 0 64px'}} />
                          <div style={{flex: '0 0 160px'}}>型号</div>
                          <div style={{flex: '0 0 80px'}}>设备名</div>
                          <div style={{flex: '0 0 80px'}}>容量</div>
                          <div style={{flex: '0 0 80px'}}>接口</div>
                          <div style={{flex: '0 0 80px'}}>使用</div>
                          <div style={{flex: '0 0 240px'}}>说明</div>
                        </div>
                        <Divider />
                          { this.props.storage && this.props.storage.blocks.filter(blk => blk.isDisk).map(blk => this.renderDiskRow(blk)) }

                        <Divider />
                      </div>
                    </div>
                    <div style={{marginBottom: 12}}>模式：{this.state.volumeselect.mode}</div>
                    <div style={{marginBottom: 12}}>用户名：{this.state.userpass.username}</div>
                    <div style={{margin: '12px 0'}}>
                      <RaisedButton
                        label='完成'
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        primary={true}
                        onTouchTap={() => {

                          this.handleNext()
                          this.creatingNewVolume()
                        }}
                        style={{marginRight: 12}}
                      />
                      <FlatButton
                        label="上一步"
                        disabled={stepIndex === 0}
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        onTouchTap={this.handlePrev}
                      />
                    </div>
										<FlatButton
											label="返回"
											onTouchTap={() => {
												this.setState(Object.assign({}, this.state, {
													finished: false,
													stepIndex: 0,

													volumeselect: new CreatingVolumeDiskSelection1.State(),
													userpass: new UsernamePassword.State(),

												}))
												this.changeShowContent()
												setTimeout(() => {
													this.props.onResize('HSHRINK')
													setTimeout(() => {
														this.changeExpanded()
														this.props.onResize('VSHRINK')
													}, 350)
												}, 150)
											}}
										/>
                  </StepContent>
                </Step>
              </Stepper>
              { finished && (
                <div style={{width: '100%', height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 64}}>
                  { !this.state.dialogText && <CircularProgress /> }
                  { !this.state.dialogText && <div style={{marginTop: 16, fontSize: 24, opacity: 0.54}}>正在应用设置，请管理员同志耐心等待。</div> }
                  <Dialog
                    contentStyle={{width: 560, height: 480}}
                    title='遇到错误'
                    actions={[
                      <FlatButton
                        label='进入维护模式'
                        onTouchTap={this.props.onMaintain}
                      />,
                      <FlatButton
                        label='重置向导'
                        onTouchTap={() => {
                          this.props.onReset
                          this.setState(Object.assign({}, this.state, {
                            finished: false,
                            stepIndex: 0,
                            volumeselect: new CreatingVolumeDiskSelection1.State(),
                            userpass: new UsernamePassword.State()
                          }))
													this.changeShowContent()
                          setTimeout(() => {
														this.changeExpanded()
                            this.props.onResize('VEXPAND')
                          },350)
                        }}
                      />
                    ]}
                    modal={true}
                    open={!!this.state.dialogText}
                    onRequestClose={() => this.setState({ dialogText: undefined })}
                  >
                    { this.state.dialogText && this.state.dialogText.map(line => <div>{line}</div>) }
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default InitStep
