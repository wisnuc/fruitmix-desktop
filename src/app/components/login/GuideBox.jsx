import React from 'react'

import { RaisedButton, Checkbox, Dialog, Divider, TextField, CircularProgress } from 'material-ui'
import FlatButton from '../common/FlatButton'
import { Step, Stepper, StepLabel, StepContent } from 'material-ui/Stepper'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import { cyan500 } from 'material-ui/styles/colors'

import { ipcRenderer } from 'electron'
import prettysize from 'prettysize'
import request from 'superagent'

class GuideBox extends React.Component {

  constructor(props) {

    super(props)

    this.hasGoodVolume = !!props.storage.volumes.find(vol => vol.isBtrfs && !vol.isMissing)

    this.state = {

      // multi-steps expansion / shrink animation
      expanded: false,
      showContent: false,

      decision: null,

      // stepper
      finished: false,
      stepIndex: 0,

      volSelection: null,

      //
      selection: [],
      mode: null, 
     
      //
      username: null,
      password: null,
      passwordAgain: null 

      ///////////////

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
        target: this.state.selection, 
        mode: this.state.mode
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
        username: this.state.username,
        password: this.state.password
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
          setTimeout(() => ipcRenderer.send('login', this.state.username, this.state.password), 1000)
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
  }

  renderVolumeRow (vol) {

    let id = vol.uuid
    let label = vol.label
    let number = vol.total
    let missing = vol.isMissing

    let comment = missing ? '该卷有磁盘缺失，无法使用' : '该卷可以使用'
    
    return (
      <div key={name} style={{width: '100%', height: 40, display: 'flex', alignItems: 'center'}}>
        <div style={{flex: '0 0 64px'}}>
          <Checkbox style={{marginLeft: 16}} 
            disabled={this.state.decision !== 'useExisting'}
            checked={this.state.volSelection === id}
            onCheck={() => {
              this.setState(Object.assign({}, this.state, { volSelection: id }))
            }} 
          />
        </div>
        <div style={{flex: '0 0 320px'}}>{id}</div>
        <div style={{flex: '0 0 80px'}}>{label}</div>
        <div style={{flex: '0 0 80px'}}>{number}</div>
        <div style={{flex: '0 0 160px'}}>{comment}</div>
      </div> 
    )
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
      <div key={name} style={{width: '100%', height: 40, display: 'flex', alignItems: 'center'}}>
        <div style={{flex: '0 0 64px'}}>
          { valid && <Checkbox style={{marginLeft: 16}} 
            disabled={this.state.decision !== 'createNew'}
            checked={this.state.selection.indexOf(name) !== -1} onCheck={() => {

            let nextState

            let index = this.state.selection.indexOf(name)
            if (index === -1) {
              nextState = Object.assign({}, this.state, {
                selection: [...this.state.selection, name]
              })
            }
            else {
              nextState = Object.assign({}, this.state, {
                selection: [...this.state.selection.slice(0, index),
                  ...this.state.selection.slice(index + 1)]
              })
            }

            if (nextState.selection.length === 1) {
              nextState.mode = 'single'
            }
            else if (nextState.selection.length === 0) {
              nextState.mode = null
            }

            this.setState(nextState)

          }}/>}
        </div>
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

    return (
      <div style={{width: '100%'}}>
        <div style={{width: '100%', height: '100%'}}>
          <div style={{width: '100%', height: this.state.expanded ? 640 : 0, transition: 'height 300ms', overflow: 'hidden', backgroundColor: '#FAFAFA', boxSizing: 'border-box', paddingLeft: 64, paddingRight: 64,
            overflowY: 'auto'
          }}>
            <div style={{marginTop: 34, marginBottom: 12, fontSize: 34, color: '#000', opacity: 0.54}}>初始化向导</div>
            <div style={{opacity: this.state.showContent ? 1 : 0, transition:'opacity 150ms'}}>
              <Stepper activeStep={stepIndex} orientation="vertical">
                <Step>
                  <StepLabel>创建或选择已有的磁盘卷</StepLabel>

                  <StepContent>

                    <div style={{height: 40, display: 'flex', alignItems: 'center'}}>
                      <Checkbox 
                        labelStyle={{ color: this.state.decision === 'useExisting' ? cyan500 : 'rgba(0,0,0,0.87)' }}
                        label='选择现有磁盘卷，磁盘卷上的数据都会保留' 
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        checked={this.state.decision === 'useExisting'} 
                        onCheck={() => this.setState(Object.assign({}, this.state, { 
                          decision: 'useExisting',
                          selection: [],
                          mode: null,
                        }))}
                      />
                    </div>

                    <div style={{color: this.state.decision === 'useExisting' ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.54)'}}>
                      <div style={{marginLeft: 40, width: 760, fontSize: 13}}>
                        <Divider /> 
                        <div style={{width: '100%', height: 32, display: 'flex', alignItems: 'center'}}>
                          <div style={{flex: '0 0 64px'}} />
                          <div style={{flex: '0 0 320px'}}>ID</div>
                          <div style={{flex: '0 0 80px'}}>Label</div>
                          <div style={{flex: '0 0 80px'}}>磁盘数量</div>
                          <div style={{flex: '0 0 160px'}}>说明</div>
                        </div>
                        <Divider />
                        { this.props.storage && this.props.storage.volumes.map(vol => this.renderVolumeRow(vol)) } 
                        <Divider />
                      </div>
                    </div>

                    <div style={{height: 24}} />
                    <div style={{height: 40, display: 'flex', alignItems: 'center'}}>
                      <Checkbox 
                        labelStyle={{ color: this.state.decision === 'createNew' ? cyan500 : 'rgba(0,0,0,0.87)' }}
                        label='选择磁盘创建新磁盘卷，所选磁盘上的数据都会被清除' 
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        checked={this.state.decision === 'createNew'}
                        onCheck={() => this.setState(Object.assign({}, this.state, { 
                          decision: 'createNew',
                          volSelection: null
                        }))}
                      />
                    </div>
                    <div style={{color: this.state.decision === 'createNew' ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.54)'}}>
                      <div style={{marginLeft: 40, width: 760, fontSize: 13}}>
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

                      <div style={{position: 'relative', marginLeft: 40, marginTop: 12, marginBottom:12, display: 'flex', alignItems: 'center'}}>
                        <div style={{fontSize:13}}>选择磁盘卷模式：</div>
                        <div style={{width: 160}}>
                        <RadioButtonGroup style={{position: 'relative', display: 'flex'}} 
                          valueSelected={this.state.mode} 
                          onChange={(e, value) => {
                            this.setState(Object.assign({}, this.state, { mode: value })) 
                          }}>
                          <RadioButton style={{fontSize:13, width:128}} iconStyle={{width:16, height:16, padding: 2}} 
                            disableTouchRipple={true}
                            disableFocusRipple={true}
                            value='single' label='single模式' 
                            disabled={this.state.decision !== 'createNew' || this.state.selection.length === 0} />
                          <RadioButton style={{fontSize:13, width:128}} iconStyle={{width:16, height:16, padding: 2}} 
                            disableTouchRipple={true}
                            disableFocusRipple={true}
                            value='raid0' label='raid0模式' 
                            disabled={this.state.decision !== 'createNew' || this.state.selection.length < 2} />
                          <RadioButton style={{fontSize:13, width:128}} iconStyle={{width:16, height:16, padding: 2}} 
                            disableTouchRipple={true}
                            disableFocusRipple={true}
                            value='raid1' label='raid1模式' 
                            disabled={this.state.decision !== 'createNew' || this.state.selection.length < 2} />
                        </RadioButtonGroup>
                        </div>
                      </div>
                    </div>

                    <div style={{margin: '24px 0'}}>
                      <RaisedButton
                        label='下一步'
                        disabled={ this.state.decision === 'createNew' ? (this.state.selection.length === 0 || !this.state.mode) : (this.state.volSelection === null)}
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
                    <div>
                      <TextField key='guide-box-username' hintText='用户名' 
                        value={this.state.username}
                        maxLength={20}
                        onChange={e => {
                        let nextState = Object.assign({}, this.state, { username: e.target.value })
                        console.log(nextState)
                        this.setState(nextState)
                      }}/>
                    </div>
                    <div>
                      <TextField key='guide-box-password' hintText='密码' 
                        value={this.state.password}
                        type= 'password'
                        maxLength={40}
                        onChange={e => {
                        let nextState = Object.assign({}, this.state, { password: e.target.value })
                        console.log(nextState)
                        this.setState(nextState)
                      }}/>
                    </div>
                    <div>
                      <TextField key='guide-box-password-again' hintText='再次输入密码' 
                        value={this.state.passwordAgain}
                        type='password'
                        maxLength={40}
                        onChange={e => {
                        this.setState(Object.assign({}, this.state, { passwordAgain: e.target.value }))
                      }}/>
                    </div>
                    <div style={{margin: '12px 0'}}>
                      <RaisedButton
                        label='下一步'

                        disabled={!(this.state.username && 
                          this.state.username.length > 0 && 
                          this.state.password &&
                          this.state.password === this.state.passwordAgain && 
                          this.state.password.length > 0)}

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
                    <p>请确认您输入的信息无误，点击完成键应用设置。</p>
                    <div style={{margin: '12px 0'}}>
                      <RaisedButton
                        label='完成'
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        primary={true}
                        onTouchTap={() => {

                          this.handleNext()
                          if (this.state.decision === 'createNew')
                            this.creatingNewVolume()
                          else
                            this.useExisting(this.state.volSelection)
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
                        onTouchTap={this.props.onReset} 
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

          <div style={{width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFA'}}>
            <div style={{marginLeft: 24}}>该设备已安装WISNUC OS，但尚未初始化。</div>
            <FlatButton style={{marginRight: 16}} label={this.state.expanded ? '放弃' : '初始化'} 
              onTouchTap={() => {
                if (this.state.expanded) {
                  this.setState(Object.assign({}, this.state, { 
                    showContent: false,
                    decision: null,
                    finished: false,
                    stepIndex: 0,
                    volSelection: null,
                    selection: [],
                    mode: null,
                    username: null,
                    password: null,
                    passwordAgain: null
                  }))
                  setTimeout(() => {
                    this.props.onResize('HSHRINK')
                    setTimeout(() => {
                      this.setState(Object.assign({}, this.state, { expanded: false }))
                      this.props.onResize('VSHRINK')
                    }, 350)
                  }, 150)
                }
                else {
                  this.setState(Object.assign({}, this.state, { expanded: true }))
                  this.props.onResize('VEXPAND')
                  setTimeout(() => {
                    this.props.onResize('HEXPAND')
                    setTimeout(() => {
                      this.setState(Object.assign({}, this.state, { showContent: true }))
                    }, 350)
                  }, 350)
                }
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default GuideBox
