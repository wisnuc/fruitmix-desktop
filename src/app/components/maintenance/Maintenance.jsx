import Debug from 'debug'
const debug = Debug('component:maintenance')

import React from 'react'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { AppBar, Avatar, Checkbox, Divider, Paper, SvgIcon, 
  FlatButton, Dialog, RaisedButton, IconButton, TextField, Toggle, CircularProgress } from 'material-ui'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'
import TreeTable from './TreeTable'

import request from 'superagent'
import validator from 'validator'

const DialogTextBox = (props) => (
  <div style={props.style}>
    { props.busy ? 
      <div style={{width: '100%', height: '100%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress />
      </div> :
      <div style={{width: '100%'}}>
        { props.text.map((line, index, array) => {
          return (
          <div style={{ 
            fontSize: 15, lineHeight: '24px', 
            marginBottom: index === array.length - 1 ? 0 : 20
          }}>{ line }</div>)
        })}
      </div> } 
  </div>
)

class RebootToMaintenance extends React.Component {

  constructor(props) {
    super(props)

    if (typeof props.address !== 'string' || !validator.isIP(props.address, 4))
      throw new Error('RebootToMaintenance requires a valid address')

    this.state = { dialog: null }

    this.successText = [
      '系统重启后不会自动启动WISNUC服务，会停留在维护模式，您可以进行系统维护工作；',
      '重启需要大约30秒到1分钟左右；程序现在返回搜索设备界面。'
    ]

    this.errorText = []

    this.rebootSuccess = () => this.setState({ dialog: {
      success: true,
      busy: false,
      title: '操作成功',
      text: this.successText
    }})

    this.rebootError = () => this.setState({ dialog: {
      success: false,
      title: '操作失败',
      text: this.errorText
    }})
   
    this.reboot = () => {

      debug('reboot to maintenance')

      if (this.props.address)
        request
          .post(`http://${this.props.address}:3000/system/boot`)
          .set('Accept', 'application/json')
          .send({ op: 'rebootMaintenance' })
          .end((err, res) => {

            let hint = '请退出当前界面重新搜索设备，或者重启服务器后重试。错误信息：'

            if (err)
              this.errorText = [ hint, err.message ]
            else if (!res.ok) {
              this.errorText = [ hint, `request got bad response: ${res.status}` ]
              if (typeof res.body === 'object' && typeof res.body.message === 'string') {
                this.errorText.push(res.body.message)
              }
            }
            else
              return this.rebootSuccess()

            this.rebootError()
          })
    } 
  }

  render() {
    return (
      <div>
        <FlatButton 
          style={{marginLeft: -16}}
          labelStyle={{fontSize: 14}}
          label='重启进入维护模式' 
          primary={true}
          onTouchTap={this.reboot}           
        />

        <Dialog
          contentStyle={{ width: 560 }}
          title={this.state.dialog && this.state.dialog.title}
          open={this.state.dialog !== null}
          modal={this.state.dialog !== null && this.state.dialog.success === true}
          actions={[
            <FlatButton 
              labelStyle={{ fontSize: 16 }}
              label='晓得了' 
              primary={true}
              disabled={this.state.dialog && this.state.dialog.busy}
              onTouchTap={() => {
                if (this.state.dialog.success === true) {
                  this.setState({
                    dialog: Object.assign({}, this.state.dialog, { busy: true })
                  })
                  setTimeout(() => window.store.dispatch({ type: 'EXIT_MAINTENANCE' }), 5000)
                }
                else if (this.state.dialog.success === false) {
                  this.setState({ dialog: null }) 
                }
              }}
            />
          ]}
        >
          <DialogTextBox
            style={{width: '100%', height: 120}}
            busy={this.state.dialog && this.state.dialog.busy}
            text={this.state.dialog && this.state.dialog.text}
          />
        </Dialog>
      </div>
    ) 
  }
}

const WisnucContentViewState = (props) => (
  <div>
    <div style={{
      fontSize: 14, 
      lineHeight: '24px',
      marginBottom: 20, 
      color: 'rgba(0,0,0,0.87)'
    }}>
      WISNUC应用已经启动，磁盘卷和磁盘信息仅供浏览；如需操作，请重启系统进入维护模式。
    </div>
    <RebootToMaintenance address={props.address}/>
  </div>
)

const extractFruitmixInstance = storage => {
  
  let { blocks, volumes } = storage
  let fruits = []
  volumes.forEach(vol => {

    if (!vol.wisnuc) return
    if (vol.wisnuc.users)
      fruits.push(Object.assign({}, vol, { isVolume: true }))
    else {
      if (vol.isRootFS) { 
        if (vol.error !== 'ENOFRUITMIX') 
          fruits.push(Object.assign({}, vol, { isVolume: true }))
      }
      else {
        if (vol.error !== 'ENOWISNUC')
          fruits.push(Object.assign({}, vol, { isVolume: true }))
      }
    } 
  })

  blocks.forEach(blk => {

    if (!blk.wisnuc) return
    if (blk.wisnuc.users)
      fruits.push(Object.assign({}, blk))
    else {
      if (blk.isRootFS) {
        if (blk.wisnuc.error !== 'ENOFRUITMIX')
          fruits.push(Object.assign({}, blk))
      }
      else {
        if (blk.wisnuc.error !== 'ENOWISNUC')
          fruits.push(Object.assign({}, blk))
      }
    }
  })

  return fruits
}

const WisnucContentEditState = (props) => {

  console.log('====')
  console.log(props.state.storage)
  console.log('====')

  let fruits = extractFruitmixInstance(props.state.storage)

  return (
    <div>
      <div>
        {
          fruits.map(fr => (
            <Paper style={{display: 'flex', borderStyle: 'solid', borderColor: 'red'}} zDepth={3}>
              <div style={{flex:'0 0 266px', display: 'flex', padding:16, boxSizing:'border-box'}}>
                <Avatar>1</Avatar>
                <div style={{marginLeft:50}}>
                  <div style={{fontSize:14, lineHeight:'20px', fontWeight: 700, color:'rgba(0,0,0,0.87)'}}>WISNUC</div>
                  <div style={{fontSize:14, lingHeight:'20px', color:'rgba(0,0,0,0.54)'}}>Fruitmix</div>
                </div>
              </div>
              <div style={{flex: '0 0 800px'}}>
                <div style={{width: '100%', height: 16}} />
                <div style={{fontSize:14, lineHeight: '20px', fontWeight: 700, color: 'rgba(0,0,0,0.87)'}}>
                  用户 - <span>{fr.wisnuc.users.map(u => u.username).join(', ')}</span>
                </div>
                <div style={{fontSize:14}}>{fr.isVolume ? 'Btrfs磁盘卷' : fr.isDisk ? '磁盘文件系统' : '文件分区'}</div>
                <div>{fr.uuid}</div>
                <div style={{fontSize: 13}}>{fr.mountpoint}</div>
                <FlatButton style={{marginLeft: -16}} label='启动该实例' primary={true} />
              </div>
            </Paper>
          ))
        }
      </div>
    </div>
  )
}

class WisnucSection extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <div style={this.props.style}>
        <div style={{width:'100%'}}>
          <div style={{
            fontSize: 24, 
            fontWeight: 400,
            lineHeight: '32px',
            paddingTop: 48,
            marginBottom: 30,
            color: 'rgba(0,0,0,0.87)'
          }}>
            WISNUC应用 {this.props.state.value}
          </div>
          { this.props.state.value === 'VIEW_STATE' && 
            <WisnucContentViewState 
              address={this.props.address} 
            /> }

          { (this.props.state.value === 'BOOT_STATE' ||
            this.props.state.value === 'INSTALL_STATE' ||
            this.props.state.value === 'INSTALLNEW_STATE') &&
            <WisnucContentEditState 
              state={this.props.state}
              address={this.props.address}
            /> }

        </div>
      </div>
    )
  }
}

class VolumeTable extends React.Component {
    
  constructor(props) {
    super(props)
  }

  render() {

    let volumes = this.props.volumes

    if (volumes.length === 0) {
      return (
        <div>
          <div style={{width:'100%', height: 64, display: 'flex', alignItems: 'center'}}>
            <div style={{fontSize: 20}}>
              磁盘卷
            </div>
          </div>
          <div style={{
            marginBottom: 40,
            fontSize: 14,
            color: 'rgba(0,0,0,0.87)'
          }}>
            未检测到btrfs磁盘卷，需要创建一个磁盘卷才能使用WISNUC系统。
          </div>
          <FlatButton 
            style={{margin: -16}}
            labelStyle={{fontSize: 14}}
            label='创建新磁盘卷安装WISNUC系统' 
            primary={true}
            disabled={this.state.context === 'CREATING_NEW_VOLUME'}
            onTouchTap={() => 
              this.setState(state => Object.assign({}, state, { context: 'CREATING_NEW_VOLUME' }))
            }
          />
        </div>
      )
    }
    else {
      return (
        <Paper zDepth={3}>
          <div style={{width:'100%', height: 64, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{ marginLeft: 24, fontSize: 20 }}>
               Btrfs磁盘卷
              </div>
            </div>
            { false &&
            <div style={{flex: '0 0 160px', marginRight: 24, display: 'flex', alignItems: 'center' }}>
              <Toggle 
                labelStyle={{
                  fontSize:14, 
                  color: this.volumeToggleToggled() ? 
                    this.props.muiTheme.palette.textColor : 
                    'rgba(0,0,0,0.54)' 
                }}
                label='安装WISNUC应用' 
                toggled={this.volumeToggleToggled()} 
                disabled={this.volumeToggleDisabled()}
                onTouchTap={() => {
                  debug('toggle onTouchTap', this.state) 
                  if (this.state.value === 'INSTALL_STATE' || this.state.value === 'INSTALLNEW_STATE')
                    this.next('BOOT_STATE')
                  else if (this.state.value === 'BOOT_STATE')
                    this.next('INSTALL_STATE')
                }}
              />
            </div> }
          </div>
          <div style={{width:'100%', height: 56, display: 'flex', alignItems: 'center',
            fontSize:12, color: 'rgba(0,0,0,0.54)'
          }}>
            <div style={{flex: '0 0 106px'}} />
            <div style={{flex: '0 0 480px'}}>
              ID
            </div>
            <div style={{flex: '0 0 80px'}}>
              磁盘数量
            </div>
            <div style={{flex: '0 0 80px'}}>
              WISNUC系统
            </div>
          </div>
          <Divider />
            { volumes
                .map(vol => (
                  <div style={{width: '100%', height: 48, 
                    display: 'flex', alignItems: 'center', fontSize: 13, color: 'rgba(0,0,0,0.87'
                  }}>
                    <div style={{flex: '0 0 24px'}} />
                    <div style={{flex: '0 0 18px'}}>
                      <Checkbox 
                        secondary={true}
                        onCheck={() => {
                        }}
                        iconStyle={{width:18, marginRight:0}}
                        disableTouchRipple={true} 
                        disableFocusRipple={true} 
                      /> 
                    </div>
                    <div style={{flex: '0 0 24px'}} />
                    <div style={{flex: '0 0 40px'}} />
                    <div style={{flex: '0 0 160px'}}>
                      {vol.label.length === 0 ? '' : vol.label}
                    </div>
                    <div style={{flex: '0 0 320px'}}>
                      {vol.uuid}
                    </div>
                    <div style={{flex: '0 0 80px'}}>
                      {vol.total}
                    </div>
                    <div style={{flex: '0 0 80px'}}>
                      {vol.wisnucInstalled ? '已安装' : '未安装' }
                    </div>
                  </div> 
                ))
                .reduce((prev, curr) => {
                  prev.push(curr)
                  prev.push(<Divider />)
                  return prev 
                }, [])}
          <Divider />
          <div style={{
            width: '100%', height: 56, 
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
            <FlatButton 
              style={{ marginRight: 8 }}
              labelStyle={{ fontSize: 14 }}
              label='在所选磁盘卷上安装'
              primary={true}
              onTouchTap={() => {
                this.setState(state => Object.assign({}, state, {
                  context: 'CREATING_NEW_VOLUME'
                }))
              }}
            />
          </div>
        </Paper>
      )
    }
  }
}

/***
const Checkbox40 = props => (
  <div style={{width: props.size, height: props.size}}>
    <Checkbox {...props, style: { margin: 8}} />
  </div>
)
***/

class VolumeContainer extends React.Component {

  constructor(props) {
    super(props)    
  }

  render() {

    let boot = this.props.boot
    let { volumes, blocks } = this.props.storage

    return (
      <div style={this.props.style}>
        <Avatar style={{margin:4}}>A</Avatar>
        <Checkbox style={{padding:12}} />
      </div>
    )
  }
}

class Maintenance extends React.Component {

  constructor(props) {

    super(props)

    this.state = {}
    this.unmounted = false

    // manual init since setState() cannot be used in constructor
    if (window.store.getState().maintenance.boot.bootMode !== 'maintenance') {
      this.state.value = 'VIEW_STATE'
    }
    else {
      this.state.value = 'BOOT_STATE'
      this.state.selection = []
    }

    this.roots = []
    this.treeify = () => {

      let storage = window.store.getState().maintenance.storage 
      let blocks = storage.blocks

      blocks.forEach(blk => {

        if (!blk.name.startsWith('sd')) return

        let block = Object.assign({}, blk)
        if (block.isDisk) {
          block.parent = null
          block.children = []
          this.roots.push(block)
        }
        else {
          if (block.isPartition && !block.isExtended) {
            let parent = this.roots.find(root => root.name === block.parentName)
            if (parent) {
              block.parent = parent
              parent.children.push(block)
            }
          }
        }
      })      
    } 

    this.treeify()

    this.diskOnCheck = disk => {

      this.setState(state => {

        let selection = state.diskSelection
        let index = selection.indexOf(disk)      
        
        if (index === -1) {
          return Object.assign({}, this.state, { 
            diskSelection: [...selection, disk] 
          })
        }
        else {
          return Object.assign({}, this.state, {
            diskSelection: [...selection.slice(0, index), ...selection.slice(index + 1)]
          })
        }
      })
    }

    this.underline = arr => {
    }
  }

  componentDidMount() {
    
    let device = window.store.getState().maintenance.device

    request.get(`http://${device.address}:3000/system/storage?wisnuc=true`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (this.unmounted) return
        if (err)
          this.setState({ storage: err.message })
        else if (!res.ok)
          this.setState({ storage: 'bad response' })
        else
          this.setState({ storage: res.body })
      })

    request.get(`http://${device.address}:3000/system/boot`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (this.unmounted) return
        if (err)
          this.setState({ boot: err.message })
        else if (!res.ok)
          this.setState({ boot: 'bad response' })
        else
          this.setState({ boot: res.body })
      })
  }

  componentWillUnmount() {
    this.unmounted = true
  }

  enterViewState() {
    debug('enter view state')
    this.setState(state => ({
      value: 'VIEW_STATE'
    }))
  }

  exitViewState() {
  }

  enterBootState() {
    debug('enter boot state')
    this.setState(state => ({ 
      value: 'BOOT_STATE',
      selection: [] 
    }))
  }

  exitBootState() {
  }

  enterInstallState() {
    debug('enter install state')
    this.setState(state => ({
      value: 'INSTALL_STATE',
      selection: []
    }))
  }

  exitInstallState() {
  }

  enterInstallNewState() {
    debug('enter installnew state')
    this.setState(state => ({
      value: 'INSTALLNEW_STATE',
      selection: []
    }))
  }

  exitInstallNewState() {
  }

  next(nextState) {
  
    if (this.state.value === 'VIEW_STATE')
      this.exitViewState()
    else if (this.state.value === 'BOOT_STATE')
      this.exitBootState()
    else if (this.state.value === 'INSTALL_STATE')
      this.exitInstallState()
    else if (this.state.value === 'INSTALLNEW_STATE')
      this.exitInstallNewState()

    if (nextState === 'VIEW_STATE')
      this.enterViewState()
    else if (nextState === 'BOOT_STATE')
      this.enterBootState()
    else if (nextState === 'INSTALL_STATE')
      this.enterInstallState()
    else if (nextState === 'INSTALLNEW_STATE')
      this.enterInstallNewState()
    else
      throw new Error(`unrecognized next state ${nextState}`)
  }

  //////////////////////////////////////////////////////////////////////////////
  // 
  // widget
  //
  showVolumeToggle() {
    return this.state.value !== 'VIEW_STATE'
  }

  volumeToggleDisabled() {
    return false
  }

  volumeToggleToggled() {
    return this.state.value === 'INSTALL_STATE' || this.state.value === 'INSTALLNEW_STATE'
  }

  renderDevices() {
    
  }

  renderVolume(volume) {
    return <div />
  }

  render() {

    if (typeof this.state.boot !== 'object' || typeof this.state.storage !== 'object')
      return <div />

    const diskTableActive = this.state.context === 'CREATING_NEW_VOLUME' ? true : false
    const readySubmit = false 

    const isInstalling = this.state.value === 'INSTALL_STATE' || this.state.value === 'INSTALLNEW_STATE'

    debug('state', this.state)

    return (
      <div style={{width: '100%', height: '100%', backgroundColor:'#90A4AE', overflowY: 'scroll'}}>

        <div style={{position: 'absolute', top: 16, right: 16}}>
          <IconButton style={{marginRight: 16}}
            onTouchTap={() => window.store.dispatch({
              type: 'EXIT_MAINTENANCE'
            })}
          ><ActionExitToApp color='#FFF' /></IconButton>
        </div>
        
        <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <div style={{fontSize:34, fontWeight:100, color:'#FFF', margin:64, letterSpacing:'4px'}}>维护模式</div>

        { typeof this.state.boot === 'object' && typeof this.state.storage === 'object' &&
          this.state.storage.volumes.map(vol => 
            <VolumeContainer style={{width: 1154}} 
              boot={this.state.boot}
              storage={this.state.storage}
              volume={vol}
            />) }

          <Paper style={{marginTop: 48, width: 1154, 
            backgroundColor: this.state.value === 'INSTALL_STATE' ||  
              this.state.value === 'INSTALLNEW_STATE' ? '#FAFAFA' : '#EEEEEE'
          }} zDepth={this.state.toggle ? 1 : 0}>
            <VolumeTable volumes={this.state.storage ? this.state.storage.volumes : null} />
          </Paper>

          <Paper 
            style={{
              marginTop: diskTableActive ? 24 : 48, 
              width: diskTableActive ? 1170 : 1154, 
              backgroundColor: diskTableActive ? '#FFF' : '#EEEEEE',
              transition: 'all 300ms' 
            }} 
            zDepth={diskTableActive ? 3 : 0}
          >
            <div style={{width:'100%', height: 64, display: 'flex', alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <div style={{
                marginLeft: diskTableActive ? 24 : 0, 
                fontSize: diskTableActive ? 16 : 20,
                color: 'rgba(0,0,0,0.87)',
                transition: 'all 300ms'
              }}>
                { diskTableActive ? '第一步：选择磁盘和RAID模式' : '磁盘信息' }
              </div>
              { diskTableActive && 
                <FlatButton 
                  style={{marginRight: 8}}
                  labelStyle={{fontSize: 14}}
                  label='放弃操作' 
                  primary={true}
                  onTouchTap={() => this.setState(state => Object.assign({}, state, { context: 'none' }))}
                /> 
              }
            </div>
            <TreeTable 
              data={this.roots} 
              selection={false} 
              onCheck={this.diskOnCheck}
            />
            <div style={{width:'100%', height: 56, display: 'flex', alignItems: 'center'}}>
              { diskTableActive && <div style={{flex: '0 0 106px'}} /> }
              { diskTableActive && <div style={{flex: '0 0 160px', fontSize:13}}>磁盘卷模式</div> }
              { diskTableActive &&
                <div>
                  <RadioButtonGroup style={{position: 'relative', display: 'flex'}} 
                    valueSelected={this.state.mode} 
                    onChange={(e, value) => {
                      this.setState(Object.assign({}, this.state, { mode: value })) 
                    }}>
                    <RadioButton 
                      style={{fontSize:13, width:160, marginLeft: -4}} 
                      iconStyle={{width:16, height:16, padding: 2}} 
                      disableTouchRipple={true}
                      disableFocusRipple={true}
                      value='single' label='SINGLE' 
                      disabled={this.state.diskSelection.length === 0} />
                    <RadioButton 
                      style={{fontSize:13, width:160, marginLeft: -2}} 
                      iconStyle={{width:16, height:16, padding: 2}} 
                      disableTouchRipple={true}
                      disableFocusRipple={true}
                      value='raid0' label='RAID0' 
                      disabled={this.state.diskSelection.length < 2} />
                    <RadioButton 
                      style={{fontSize:13, width:160, marginLeft: 0}} 
                      iconStyle={{width:16, height:16, padding: 2}} 
                      disableTouchRipple={true}
                      disableFocusRipple={true}
                      value='raid1' label='RAID1' 
                      disabled={this.state.diskSelection.length < 2} />
                  </RadioButtonGroup>
                </div>
              }
            </div>
            { diskTableActive && <div>
              <Divider />
              <div style={{width:'100%', height: 64, display: 'flex', alignItems: 'center'}}>
                <div style={{
                  marginLeft: diskTableActive ? 24 : 0, 
                  fontSize: 16,
                  color: 'rgba(0,0,0,0.87)',
                  transition: 'all 300ms'
                }}>
                  第二步：创建第一个用户
                </div>
              </div>
              <div style={{height: 48, display: 'flex', alignItems: 'center', 
                fontSize: 13, color: 'rgba(0,0,0,0.87)'}}>
                <div style={{flex: '0 0 106px'}} />
                <div style={{flex: '0 0 160px'}}>用户名</div>
                <div style={{flex: '0 0 320px'}}>
                  <TextField 
                    name='new-volume-username'
                    onChange={e => {
                      let username = e.target.value
                      this.setState(state => Object.assign({}, state, { username }))
                    }}
                  />
                </div>
              </div>
              <div style={{height: 48, display: 'flex', alignItems: 'center',
                fontSize: 13, color: 'rgba(0,0,0,0.87)'}}>
                <div style={{flex: '0 0 106px'}} />
                <div style={{flex: '0 0 160px'}}>密码</div>
                <div style={{flex: '0 0 320px'}}>
                  <TextField 
                    name='new-volume-password'
                    onChange={e => {
                      let password = e.target.value
                      this.setState(state => Object.assign({}, state, { password }))
                    }}
                  />
                </div>
              </div>
              <div style={{height: 48, display: 'flex', alignItems: 'center',
                fontSize: 13, color: 'rgba(0,0,0,0.87)'}}>
                <div style={{flex: '0 0 106px'}} />
                <div style={{flex: '0 0 160px'}}>再次输入密码</div>
                <div style={{flex: '0 0 320px'}}>
                  <TextField 
                    name='new-volume-password-again'
                    onChange={e => {
                      let passwordAgain = e.target.value
                      this.setState(state => Object.assign({}, state, { passwordAgain }))
                    }}
                  />
                </div>
              </div>
              <div style={{height: 56, display: 'flex', alignItems: 'center',
                fontSize: 13, color: 'rgba(0,0,0,0.87)'}}>
                <div style={{flex: '0 0 106px'}} />
                <div style={{color: 'rgba(0,0,0,0.54'}}>提示：用户名可以包含中文字符和各种符号</div>
              </div>
              <Divider /> 
              <div style={{
                width:'100%', height: 64, 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{
                  marginLeft: diskTableActive ? 24 : 0, 
                  fontSize: 16,
                  color: 'rgba(0,0,0,0.87)',
                  transition: 'all 300ms'
                }}>
                  第三步：请确认信息无误，点击创建按钮。
                </div>
                {
                  readySubmit && 
                  <RaisedButton 
                    style={{marginRight: 16}}
                    label='创建' 
                    primary={true}
                    onTouchTap={() => {
                      
                      let postdata = {
                        target: this.state.diskSelection.map(disk => disk.name),
                        mkfs: {
                          type: 'btrfs',
                          mode: this.state.mode 
                        },
                        init: {
                          username: this.state.username,
                          password: this.state.password
                        }
                      }

                      console.log(postdata)

                      let address = window.store.getState().maintenance.device.address
                    
                      request.post(`http://${address}:3000/system/mir`)
                        .set('Accept', 'application/json')
                        .send(postdata)
                        .end((err, res) => {
                          console.log('======')
                          console.log(err || !res.ok || res.body) 
                          console.log('======')
                        })
                    }}
                  />
                }
              </div>
            </div> }
          </Paper>
        </div>
      </div>
    )
  }
}

export default muiThemeable()(Maintenance)

