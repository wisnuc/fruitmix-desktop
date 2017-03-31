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

const PrevStepButton = (props) => {
	return (
		<FlatButton
			label="上一步"
			disableTouchRipple={true}
			disableFocusRipple={true}
			disabled={props.disabled}
			onTouchTap={props.handlePrev}
		/>
	)
}

const NextStepButton = (props) => {
	return (
		<RaisedButton
			label={props.label}
			disableTouchRipple={true}
			disableFocusRipple={true}
			primary={true}
			disabled={props.disabled}
			onTouchTap={props.onTouchTap}
			style={{marginRight: 12}}
		/>
	)
}

class InitWiard extends StateUp(React.Component) {

  constructor(props) {

    super(props)

    this.hasGoodVolume = !!props.storage.volumes.find(vol => vol.isBtrfs && !vol.isMissing)

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

        <div style={{flex: '0 0 200px'}}>{model}</div>
        <div style={{flex: '0 0 100px'}}>{name}</div>
        <div style={{flex: '0 0 80px'}}>{size}</div>
        <div style={{flex: '0 0 80px'}}>{iface}</div>
        <div style={{flex: '0 0 80px'}}>{usage}</div>
        <div style={{flex: '0 0 220px'}}>{comment}</div>
      </div>
    )
  }

  render() {

    const {finished, stepIndex} = this.state;
		console.log('*&*&*&', this.props.onClose)

    return (
			<div style={{
				width: '100%',
				height: 640,
				transition: 'height 300ms',
				overflow: 'hidden',
				backgroundColor: '#FAFAFA',
				boxSizing: 'border-box',
				paddingLeft: 64,
				paddingRight: 64,
				overflowY: 'auto',
				paddingBottom: 64
			}}>
				<div style={{marginTop: 34, marginBottom: 12, fontSize: 34, color: '#000', opacity: 0.54}}>初始化向导</div>
				<div>
					<Stepper activeStep={stepIndex} orientation="vertical">
						<Step>
							<StepLabel>创建磁盘卷</StepLabel>

							<StepContent>
								<CreatingVolumeDiskSelection1 storage = {this.props.storage} {...this.bindVState( 'volumeselect')} />
								<div style={{margin: '24px 0'}}>
									<NextStepButton
										label='下一步'
										disabled={ this.state.volumeselect.selection.length === 0 || !this.state.volumeselect.mode }
										onTouchTap={this.handleNext}
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
									<NextStepButton label='下一步' disabled={!this.state.userpass.isInputOK()} onTouchTap={this.handleNext} />
									<PrevStepButton handlePrev={this.handlePrev}/>
								</div>
							</StepContent>
						</Step>
						<Step>
							<StepLabel>确认</StepLabel>
							<StepContent>
								<div style={{margin: '20px 0', color: 'rgba(0, 0, 0, 0.87)'}}>磁盘信息</div>
								<div style={{color: 'rgba(0,0,0,0.87)', marginBottom: 12}}>
									<div style={{width: 760, fontSize: 16, marginLeft: 36}}>
										<div style={{width: '100%', height: 32, display: 'flex', alignItems: 'left', color: 'rgba(0, 0, 0, 0.54)'}}>
											<div style={{flex: '0 0 200px'}}>型号</div>
											<div style={{flex: '0 0 100px'}}>设备名</div>
											<div style={{flex: '0 0 80px'}}>容量</div>
											<div style={{flex: '0 0 80px'}}>接口</div>
											<div style={{flex: '0 0 80px'}}>使用</div>
											<div style={{flex: '0 0 220px'}}>说明</div>
										</div>
										<Divider style={{width: 740}}/>
											{ this.props.storage && this.props.storage.blocks.filter(blk => blk.isDisk).map(blk => this.renderDiskRow(blk)) }
										<Divider style={{width: 740}}/>
									</div>
								</div>
								<div style={{margin: '20px 0', color: 'rgba(0, 0, 0, 0.87)', fontSize: 16}}>模式：<span style={{fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)'}}>{this.state.volumeselect.mode}</span></div>
								<div style={{margin: '20px 0', color: 'rgba(0, 0, 0, 0.87)', fontSize: 16}}>用户名：<span style={{fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)'}}>{this.state.userpass.username}</span></div>

							  <div style={{margin: '12px 0'}}>
								  <NextStepButton
										label='完成'
										onTouchTap={() => {
											this.handleNext()
											this.creatingNewVolume()
										}}
									/>
								  <PrevStepButton handlePrev={this.handlePrev}/>
						    </div>
							</StepContent>
						</Step>
					</Stepper>
					<FlatButton
						label="返回"
						onTouchTap={(props) => {
							this.setState(Object.assign({}, this.state, {
								finished: false,
								stepIndex: 0,
								volumeselect: new CreatingVolumeDiskSelection1.State(),
								userpass: new UsernamePassword.State(),
							}))
							this.props.onClose()
						}}
					/>
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
											this.setState(Object.assign({}, this.state, {
												finished: false,
												stepIndex: 0,
												volumeselect: new CreatingVolumeDiskSelection1.State(),
												userpass: new UsernamePassword.State()
											}))
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
    )
  }
}

export default InitWiard
