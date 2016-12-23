import request from 'superagent'

import React from 'react'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { AppBar, Checkbox, Divider, Paper, FlatButton, RaisedButton, IconButton, TextField, 
  Toggle } from 'material-ui'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'

import TreeTable from './TreeTable'

class Maintenance extends React.Component {

  constructor(props) {

    super(props)
    this.state = {

      toggle: false,
      context: 'none',

      diskSelection: [],
      mode: 'single',
      username: null,
      password: null,
      passwordAgain: null      
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

  renderDevices() {
    
  }

  renderVolume(volume) {
    return <div />
  }

  renderVolumes() {

    let storage = window.store.getState().maintenance.storage 
    let volumes = storage.volumes

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
        <div>
          <div style={{width:'100%', height: 64, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{
                marginLeft: this.state.toggle ? 24 : 0,
                fontSize: this.state.toggle ? 16 : 20,
                transition: 'all 300ms'
              }}>
                { this.state.toggle ? 
                    '选择已有磁盘卷，或者创建新磁盘卷' :
                    'Btrfs磁盘卷' }
              </div>
            </div>
            <div style={{flex: '0 0 108px', marginRight: 24, display: 'flex', alignItems: 'center' }}>
              <Toggle 
                labelStyle={{
                  fontSize:14, 
                  color: this.state.toggle ? this.props.muiTheme.palette.textColor : 'rgba(0,0,0,0.54)'
                }}
                label='安装系统' 
                toggled={this.state.toggle} 
                onTouchTap={() => this.setState(state => Object.assign({}, state, { toggle: !state.toggle })) }
              />
            </div>
          </div>
          <div style={{width:'100%', height: 56, display: 'flex', alignItems: 'center',
            fontSize:12, color: 'rgba(0,0,0,0.54)'
          }}>
            <div style={{flex: '0 0 106px'}} />
            <div style={{flex: '0 0 160px'}}>
              LABEL
            </div>
            <div style={{flex: '0 0 320px'}}>
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
                    <div style={{flex: '0 0 160px'}}>
                      <FlatButton label='详细' primary={true} />
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
            { this.state.toggle &&
              <FlatButton 
                style={{ marginRight: 8 }}
                labelStyle={{ fontSize: 14 }}
                label='创建新磁盘卷'
                primary={true}
                onTouchTap={() => {
                  this.setState(state => Object.assign({}, state, {
                    context: 'CREATING_NEW_VOLUME'
                  }))
                }}
              />
            }
          </div>
        </div>
      )
    }
  }

  render() {

    const diskTableActive = this.state.context === 'CREATING_NEW_VOLUME' ? true : false
    const readySubmit = (
      !!this.state.diskSelection.length &&
      this.state.mode &&
      typeof this.state.username === 'string' &&
      !!this.state.username.length &&
      typeof this.state.password === 'string' &&
      !!this.state.password.length &&
      typeof this.state.passwordAgain === 'string' &&
      !!this.state.passwordAgain.length &&
      this.state.password === this.state.passwordAgain
    )

    return (
      <div style={{width: '100%', height: '100%', backgroundColor:'#EEEEEE', overflowY: 'scroll'}}>

        <Paper style={{position: 'absolute', top: 0, left: 0,
          width: '100%', height: 64, backgroundColor: this.props.muiTheme.palette.primary1Color,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} rounded={false}>
          <div style={{flex: '0 0 120px'}} />
          <div style={{width: 1154, fontSize: 16, color: '#FFF'}}>维护模式</div>
          <div style={{flex: '0 0 136px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
            <IconButton style={{marginRight: 16}}
              onTouchTap={() => window.store.dispatch({
                type: 'EXIT_MAINTENANCE'
              })}
            ><ActionExitToApp color='#FFF' /></IconButton>
          </div>
        </Paper>

        <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginTop: 64 }}>

          <Paper style={{marginTop: 48, width: 1154, 
            backgroundColor: this.state.toggle ? '#FAFAFA' : '#EEEEEE'
          }} zDepth={this.state.toggle ? 1 : 0}>
            { this.renderVolumes() }
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
              context={this.state.context} 
              selection={this.state.diskSelection} 
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

