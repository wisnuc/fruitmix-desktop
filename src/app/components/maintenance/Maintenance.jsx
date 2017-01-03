import Debug from 'debug'
const debug = Debug('component:maintenance')

import React from 'react'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { AppBar, Avatar, Checkbox, Chip, Divider, Paper, SvgIcon, Menu, MenuItem,
  FloatingActionButton,
  FlatButton, Dialog, RaisedButton, IconButton, TextField, Toggle, CircularProgress } from 'material-ui'

import Popover, {PopoverAnimationVertical} from 'material-ui/Popover'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'
import ActionDns from 'material-ui/svg-icons/action/dns'
import ActionDonutSmall from 'material-ui/svg-icons/action/donut-small'
import ImageCropPortrait from 'material-ui/svg-icons/image/crop-portrait'
import ContentContentCopy from 'material-ui/svg-icons/content/content-copy'
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import ContentAddCircle from 'material-ui/svg-icons/content/add-circle'

import UUID from 'node-uuid'

const CatSilhouette = props => (
  <SvgIcon {...props} viewBox='0 0 400 380'>
    <path d="M 151.34904,307.20455 L 264.34904,307.20455 C 264.34904,291.14096 263.2021,287.95455 236.59904,287.95455 C 240.84904,275.20455 258.12424,244.35808 267.72404,244.35808 C 276.21707,244.35808 286.34904,244.82592 286.34904,264.20455 C 286.34904,286.20455 323.37171,321.67547 332.34904,307.20455 C 345.72769,285.63897 309.34904,292.21514 309.34904,240.20455 C 309.34904,169.05135 350.87417,179.18071 350.87417,139.20455 C 350.87417,119.20455 345.34904,116.50374 345.34904,102.20455 C 345.34904,83.30695 361.99717,84.403577 358.75805,68.734879 C 356.52061,57.911656 354.76962,49.23199 353.46516,36.143889 C 352.53959,26.857305 352.24452,16.959398 342.59855,17.357382 C 331.26505,17.824992 326.96549,37.77419 309.34904,39.204549 C 291.76851,40.631991 276.77834,24.238028 269.97404,26.579549 C 263.22709,28.901334 265.34904,47.204549 269.34904,60.204549 C 275.63588,80.636771 289.34904,107.20455 264.34904,111.20455 C 239.34904,115.20455 196.34904,119.20455 165.34904,160.20455 C 134.34904,201.20455 135.49342,249.3212 123.34904,264.20455 C 82.590696,314.15529 40.823919,293.64625 40.823919,335.20455 C 40.823919,353.81019 72.349045,367.20455 77.349045,361.20455 C 82.349045,355.20455 34.863764,337.32587 87.995492,316.20455 C 133.38711,298.16014 137.43914,294.47663 151.34904,307.20455 z "/>
  </SvgIcon>
)

const BallOfYarn = props => (
  <SvgIcon {...props} viewBox='0 0 92.4 92.4'>
    <path d="m 27.407,27.720002 c -2.396667,-0.960667 -4.793333,-1.921333 -7.19,-2.882001 -4.928333,14.365667 -9.856667,28.731333 -14.785,43.097 1.469773,2.162525 3.994465,7.79419 5.685434,7.269322 C 16.547289,59.376215 21.977145,43.548108 27.407,27.720002 Z" />
    <path d="m 21.581,7.1080015 c 12.538,5.0260005 25.076,10.0519995 37.614,15.0779995 0.840667,-1.795666 1.681333,-3.591333 2.522,-5.387 -11.059667,-4.434 -22.119333,-8.8679995 -33.179,-13.3019995 -2.416771,1.001479 -4.745113,2.21454 -6.957,3.611 z" />
    <path d="m 39.474,51.683002 c 1.661333,0.659999 3.322667,1.32 4.984,1.979999 2.510667,-5.362667 5.021333,-10.725333 7.532,-16.088 -2.249333,-0.901667 -4.498667,-1.803333 -6.748,-2.705 -1.922667,5.604333 -3.845333,11.208667 -5.768,16.813001 z" />
    <path d="m 37.63,57.059001 c -0.595333,1.735334 -1.190667,3.470667 -1.786,5.206 14.222333,5.650001 28.444667,11.3 42.667,16.95 1.870616,-1.954048 5.78607,-4.827607 1.249054,-5.419455 C 65.716702,68.216699 51.673351,62.63785 37.63,57.059001 Z" />
    <path d="m 8.15,19.999001 c -8.0441709,11.490909 -10.2996588,26.733817 -6.024,40.082 4.271667,-12.452667 8.543333,-24.905333 12.815,-37.358 -2.263667,-0.908 -4.527333,-1.816 -6.791,-2.724 z" />
    <path d="m 54.401,32.426001 c 0.794667,-1.697 1.589333,-3.394 2.384,-5.091 C 43.259333,21.912668 29.733667,16.490334 16.208,11.068002 14.251971,12.911785 9.755677,15.745271 14.478637,16.422749 27.786091,21.757166 41.093546,27.091585 54.401,32.426001 Z" />
    <path d="M 72.129,7.9480015 C 64.666667,23.886334 57.204333,39.824669 49.742,55.763002 c 2.264667,0.899667 4.529333,1.799332 6.794,2.698999 C 63.683,43.197334 70.83,27.932668 77.977,12.668002 76.157,10.942987 74.203779,9.3570245 72.129,7.9480015 Z" />
    <path d="m 39.966,32.755001 c -2.428333,-0.973332 -4.856667,-1.946667 -7.285,-2.92 -5.797,16.897667 -11.594,33.795334 -17.391,50.693 2.348333,1.459622 6.992361,7.689814 7.523863,2.229487 C 28.531242,66.089992 34.248621,49.422497 39.966,32.755001 Z" />
    <path d="m 73.98,65.393001 c 3.928,1.561001 7.856,3.122 11.784,4.683 7.025399,-11.46917 8.57713,-26.067866 4.177,-38.772 -5.320333,11.363 -10.640667,22.726 -15.961,34.089 z" />
    <path d="m 64.129,11.650001 c 1.029667,-2.1996665 2.059333,-4.3993325 3.089,-6.5989995 -9.146438,-4.7196541 -19.895967,-6.1967691 -29.984,-4.181 8.965,3.5933333 17.93,7.186667 26.895,10.7799995 z" />
    <path d="m 30.283,78.473001 c -1.111667,3.240334 -2.223333,6.480667 -3.335,9.721 10.266269,4.758338 22.300289,5.506869 33.087,2.099001 -9.917333,-3.94 -19.834667,-7.88 -29.752,-11.82 z" />
    <path d="m 73.624,83.381001 c -13.208333,-5.247 -26.416667,-10.494 -39.625,-15.741 -0.624333,1.819 -1.248667,3.638001 -1.873,5.457 11.807667,4.691333 23.615333,9.382667 35.423,14.074 2.11805,-1.105235 4.153099,-2.370538 6.075,-3.79 z" />
    <path d="m 82.139,17.163001 c -6.773333,14.466 -13.546667,28.932 -20.32,43.398001 2.292667,0.911 4.585333,1.822 6.878,2.733 6.076333,-12.979001 12.152667,-25.958 18.229,-38.937001 -1.365073,-2.541276 -2.973262,-4.951124 -4.787,-7.194 z" />  
  </SvgIcon>
)

import TreeTable from './TreeTable'

import request from 'superagent'
import validator from 'validator'
import prettysize from 'prettysize'

const SUBTITLE_HEIGHT = 32
const TABLEHEADER_HEIGHT = 32
const TABLEDATA_HEIGHT = 48
const HEADER_HEIGHT = 64
const FOOTER_HEIGHT = 48
const SUBTITLE_MARGINTOP = 24

const alphabet = 'abcdefghijklmnopqrstuvwxyz'

const diskName = name => {
  let chr = name.charAt(2)
  let number = alphabet.indexOf(chr) + 1
  return `硬盘 #${number}`
}

const partName = name => {
  let numstr = name.slice(3)
  return `分区 #${numstr}`
}

const visibleLaterKey = () => UUID.v4()

class VisibleLater extends React.Component {

  constructor(props) {
    super(props)
    this.state = { visibility: 'hidden' }
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.unmounted) return 
      this.setState({ visibility: 'visible' })}
    , this.props.delay)
  }

  componentWillUnmount() {
    this.unmounted = true
  }

  render() {

    let style = this.props.style ? 
      Object.assign({}, this.props.style, this.state) :
      this.state

    return (
      <div key={visibleLaterKey()} style={style}>{ this.props.children }</div>
    )
  }
}

class MountLater extends React.Component {

  constructor(props) {
    super(props)
    this.state = { mount: false }
  }
}

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
            text={(this.state.dialog && this.state.dialog.text) || []}
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
              <div style={{flex: '0 0 640px'}}>
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
          <div style={{width:'100%', height: SUBTITLE_HEIGHT, display: 'flex', alignItems: 'center',
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
          <Divider inset={true} />
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

const If = props => {
  if (props.condition === true) 
    return <div>{props.children}</div>
  else
    return null
}

const IfElse = props => {
  if (props.condition === true)
    return <div>{props.yes}</div>
  else
    return <div>{props.no}</div>
}

const HDDIcon = props => (
  <SvgIcon {...props}>
    <path d="M18.035,2.014h-12c-1.1,0-2,0.9-2,2v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-16C20.035,2.914,19.135,2.014,18.035,2.014z M12.126,5.579c2.686,0,4.862,2.179,4.862,4.862c0,2.688-2.177,4.864-4.862,4.864c-2.687,0-4.862-2.176-4.862-4.864 C7.264,7.757,9.439,5.579,12.126,5.579z M12.126,18.422c-1.841,0-3.576-0.602-5.016-1.738l0.669-0.849 c1.248,0.985,2.751,1.507,4.347,1.507c1.582,0,3.075-0.516,4.319-1.486l0.665,0.851C15.675,17.829,13.952,18.422,12.126,18.422z"/>
  </SvgIcon>
)

const RAIDIcon = props => (
  <SvgIcon {...props}>
    <path d="M19,5H8C6.9,5,6,5.9,6,7v14c0,1.1,0.9,2,2,2h11c1.1,0,2-0.9,2-2V7C21,5.9,20.1,5,19,5z M13.5,8.308 c2.485,0,4.5,2.016,4.5,4.5c0,2.486-2.015,4.5-4.5,4.5c-2.486,0-4.5-2.014-4.5-4.5C9,10.324,11.014,8.308,13.5,8.308z M13.5,20.192c-1.704,0-3.309-0.557-4.642-1.608l0.619-0.785c1.155,0.912,2.546,1.394,4.023,1.394 c1.464,0,2.846-0.476,3.997-1.374l0.615,0.787C16.784,19.644,15.189,20.192,13.5,20.192z M13.5,13.808c0.553,0,1-0.447,1-1 c0-0.552-0.447-1-1-1s-1,0.448-1,1C12.5,13.36,12.947,13.808,13.5,13.808z"/>
  </SvgIcon>
)

const Checkbox40 = props => (
  <div style={{width: 40, height: 40}}>
    <Checkbox {...props} style={{margin: 8}} 
      iconStyle={{fill: props.fill}}
    />
  </div>
)

const HeaderIcon = props => (
  <div style={{width: 72, height: HEADER_HEIGHT, 
    display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    { props.children }
  </div>
)

const HeaderTitle1 = (props) => (
  <div style={props.style} onTouchTap={props.onTouchTap}>
    <div style={{width:184, height:'100%', display:'flex', alignItems:'center'}}>
      {props.title}
    </div>
  </div>
)

const WisnucLabel = props => {

/**
      ENOWISNUC         // wisnuc folder does not exist         // no fruitmix
      EWISNUCNOTDIR     // wisnuc folder is not a dir           // no fruitmix
      ENOFRUITMIX       // fruitmix folder does not exist       // no fruitmix
      EFRUITMIXNOTDIR   // fruitmix folder is not a dir         // no fruitmix
      ENOMODELS         // models folder does not exist         // ambiguous
      EMODELSNOTDIR     // models folder is not a dir           // ambiguous
      ENOUSERS          // users.json file does not exist       // ambiguous
      EUSERSNOTFILE     // users.json is not a file             // ambiguous
      EUSERSPARSE       // users.json parse fail                // damaged        RED
      EUSERSFORMAT      // users.json is not well formatted     // damaged        RED
**/

  let { wisnuc, style } = props

  if (wisnuc.users) {
    if (wisnuc.users.length === 0)
      return <div style={style}>已安装WISNUC应用，但尚未创建用户。</div>
    else
      return <div style={style}>
               已安装WISNUC应用；用户：{ wisnuc.users.map(u => u.username) }
             </div>             
  } 
  else
    return <div/>
}

class KeyValueList extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {

    let style = { flexGrow: 1 }
    if (this.props.right === true) 
      style.textAlign = 'right'

    return (
      <div style={this.props.style}>
        { this.props.items.map(item => (
            <div style={{
              height: 24, display: 'flex', alignItems: 'center', fontSize: 13,
              color: this.props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87'
            }}>
              <div style={{width: 184}}>{item[0]}</div>
              <div style={style}>{item[1]}</div>
            </div>
          ))}
      </div>
    )
  }
}

const SubTitleRow = props => (
  <div style={{width: '100%', height: SUBTITLE_HEIGHT, display: 'flex', alignItems: 'center'}}>
    <div style={{flex: '0 0 256px'}} />
    <div style={{flex: '0 0 184px', 
      fontSize: 13, 
      color: props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)',
      fontWeight: 'bold'
    }}>
      {props.text}
    </div>
  </div>
)

// disabled
const TableHeaderRow = props => {

  let style = {
    height: TABLEHEADER_HEIGHT, 
    display: 'flex', alignItems: 'center', 
    fontSize: 11, 
    color: props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.54)',
    fontWeight: props.disabled ? 'normal' : 'bold'
  }

  return (
    <div style={props.style}>
      <div style={style}>
        { props.items.map(item => {
            let style = {flex: `0 0 ${item[1]}px`}
            if (item[2] === true) 
              style.textAlign = 'right'
            return (<div style={style}>{item[0]}</div>)
          }) }
      </div>
    </div>
  )
}

// disabled, selected
const TableDataRow = props => {

  let containerStyle = {
    height: TABLEDATA_HEIGHT, 
    display: 'flex', alignItems: 'center', fontSize: 13,
    color: props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)'
  }

  if (!props.disabled && props.selected)
    containerStyle.backgroundColor = '#F5F5F5'

  return (
    <div style={props.style}>
      <div style={containerStyle}>
        { props.items.map(item => {

            if (typeof item[0] === 'string') {
              let style = {flex: `0 0 ${item[1]}px`} 
              if (item[2] === true) style.textAlign = 'right'
              return <div style={style}>{item[0]}</div>
            }
            else {

              let style = {
                flex: `0 0 ${item[1]}px`, 
                display: 'flex',
                alignItems: 'center'
              }

              if (item[2] === true) style.justifyContent = 'center'
              return <div style={style}>{item[0]}</div>
            }
          }) }
      </div>
    </div> 
  )
}

const TableDataRowDark = props => {

  if (props.disabled) return <TableDataRow {...props} />

  let newProps = Object.assign({}, props, { 
    style: Object.assign({}, props.style, { 
      color: 'rgba(0,0,0,0.87)'
    })
  })

  return <TableDataRow {...newProps} />
}


// grayLeft and colorLeft

@muiThemeable()
class DoubleDivider extends React.Component {

  render() {

    const primary1Color = this.props.muiTheme.palette.primary1Color
    const accent1Color = this.props.muiTheme.palette.accent1Color

    return (
      <div>
        { this.props.grayLeft && 
          <Divider style={{
            marginLeft: this.props.grayLeft,
            transition: 'margin 300ms'
          }} /> }

        { this.props.colorLeft &&
          <Divider style={{
            marginLeft: this.props.colorLeft,
            backgroundColor: accent1Color,
            transition: 'margin 300ms'
          }}/> }
      </div>
    ) 
  }
}

const VerticalExpandable = props => (
  <div style={{ width: '100%', height: props.height, transition: 'height 300ms', overflow: 'hidden'}}>
    { props.children }
  </div>
)

class RaidModePopover extends React.Component {

  constructor(props) {

    super(props)
    this.state = { open: false, hover: false } 
    this.label = () => this.props.list.find(item => item[0] === this.props.select)[1]
    this.handleRequestClose = () => this.setState({ open: false })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.disabled) this.setState({ open: false, hover: false })
  }

  render() {

    return (
      <div style={this.props.style}>
        <div 

          style={{
            width: '100%', height: '100%',
            boxSizing: 'border-box',
            padding: 8, 
            display: 'flex', alignItems: 'center', fontSize: 13,
            color: this.props.disabled ? 'rgba(0,0,0,0.38)' : this.props.color,
            borderRadius: '2px',
            backgroundColor: this.state.hover || this.state.open ? '#EEEEEE' : undefined
          }}

          onMouseEnter={() => !this.props.disabled && this.setState({ hover: true })}
          onMouseLeave={() => !this.props.disabled && this.setState({ hover: false })}
          onTouchTap={() => !this.props.disabled && this.setState({ open: true })}

        >
          {this.label()} 
          <NavigationExpandMore 
            style={{width: 18, height: 18, marginLeft: 8}} 
            color={this.props.disabled ? 'rgba(0,0,0,0.38)' : this.props.color}
          />
        </div>

        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
          animation={PopoverAnimationVertical}
        >
          <Menu>
            { this.props.list.map(item => (
              <MenuItem
                style={{fontSize: 13}}
                primaryText={item[1]}
                disabled={item[2]}
                onTouchTap={() => {
                  this.handleRequestClose()
                  this.props.onSelect(item[0])
                }}
              />
            )) }
           </Menu>
        </Popover>
      </div>
    )
  }
}

class CreatingNewVolumeCombo extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      content: null,
    }

    this.simulateSuccess = () => {
      this.setState({
        content: {
          stage: 'WIP',
          title: '操作进行中',
          text: 'busy' 
        }
      })
      setTimeout(() => {
        this.setState({
          content: {
            stage: 'SUCCESS',
            title: '操作成功',
            text: [] 
          }
        })

        setTimeout(() => {
          this.setState({content: null})
        }, 2000)

      }, 2000)
    }

    this.simulateFailure = () => {
      this.setState({
        content: {
          stage: 'WIP',
          title: '操作进行中',
          text: 'busy' 
        }
      })
      setTimeout(() => {
        this.setState({
          content: {
            stage: 'FAILED',
            title: '操作失败',
            text: ['reason1', 'reason2'] 
          }
        })
      }, 2000)
    }

    this.confirmActions = [
      <FlatButton
        labelStyle={{fontSize: 16}}
        label='取消'
        onTouchTap={() => this.setState({ content: null })}
        disabled={!!(this.state.content && this.state.content.stage === 'WIP')}
      />,
      <FlatButton 
        labelStyle={{fontSize: 16}}
        label='确认'
        secondary={true}
        onTouchTap={() => { this.simulateSuccess() }}
        disabled={!!(this.state.content && this.state.content.stage === 'WIP')}
      />
     ]

    this.disabledActions = [
      <FlatButton
        labelStyle={{fontSize: 16}}
        label='取消'
        disabled={true}
      />,
      <FlatButton 
        labelStyle={{fontSize: 16}}
        label='确认'
        secondary={true}
        disabled={true}
      />
     ]

    this.blankActions = [
      <FlatButton disabled={true} />
    ]

    this.failedActions = [
      <FlatButton
        labelStyle={{fontSize: 16}}
        label='知道了'
        secondary={true}
        onTouchTap={() => this.setState({ content: null })}
      />
    ]

    this.getActions = () => {

      if (this.state.content === null) return []

      switch(this.state.content.stage) {
      case 'CONFIRM':
        return this.confirmActions
      case 'WIP':
        return this.disabledActions
      case 'SUCCESS':
        return this.blankActions
      case 'FAILED':
        return this.failedActions
      default:
        return []
      }
    }
  }

  render() {

    return (
      <div style={this.props.style}>

        <FlatButton 
          style={{marginLeft: 8, marginRight:8}}
          labelStyle={{ fontSize: 16 }} 
          label='创建' 
          secondary={true} 
          disabled={this.props.disabled}
          onTouchTap={() => this.setState({
            content: {
              stage: 'CONFIRM',
              title: '确认操作',
              text: ['first line', 'second line']
            }
          })}
        />

        <Dialog
          contentStyle={{ width: 560 }}
          title={this.state.content && this.state.content.title}
          open={this.state.content !== null}
          modal={true}
          actions={this.getActions()}
        >
          { this.state.content &&
          <DialogTextBox
            style={{width: '100%', height: 120}}
            busy={this.state.content.text === 'busy'}
            text={this.state.content.text}
          /> }
        </Dialog>
      </div>
    )
  }
}

@muiThemeable()
class Maintenance extends React.Component {

  constructor(props) {

    super(props)

    this.state = { 
      creatingNewVolume: null,
      expanded: []
    }

    this.color = {
      primary: this.props.muiTheme.palette.primary1Color,
      accent: this.props.muiTheme.palette.accent1Color,
    }

    this.unmounted = false

    this.onToggleCreatingNewVolume = () => {
      this.setState(state => {
        if (state.creatingNewVolume === null) {
          return {
            creatingNewVolume: { disks: [], mode: 'single' },      
            expanded: []
          }
        }
        else {
          return { creatingNewVolume: null }
        }
      })
    }

    this.toggleExpanded = disvol => {

      let index = this.state.expanded.indexOf(disvol)
      if (index === -1) 
        this.setState({ expanded: [...this.state.expanded, disvol] })
      else
        this.setState({ 
          expanded: [...this.state.expanded.slice(0, index), ...this.state.expanded.slice(index + 1)]
        })
    }

    this.toggleCandidate = disk => {

      if (this.state.creatingNewVolume === null) return
      let arr = this.state.creatingNewVolume.disks
      let nextArr, index = arr.indexOf(disk)
      // TODO not necessary as immutable
      if (index === -1)
        nextArr = [...arr, disk]
      else
        nextArr = [...arr.slice(0, index), ...arr.slice(index + 1)]
      
      this.setState({ 
        creatingNewVolume: {
          disks: nextArr,
          mode: nextArr.length > 1 ? this.state.creatingNewVolume.mode : 'single'
        }
      }) 
    }

    this.setVolumeMode = mode => {

      if (this.state.creatingNewVolume === null) return
      this.setState({
        creatingNewVolume: Object.assign({}, this.state.creatingNewVolume, { mode })
      })     
    }

    this.extractAllCardItems = storage => ([
        ...storage.volumes, 
        ...storage.blocks.filter(blk => blk.isDisk && !blk.isVolumeDevice)
      ])

    this.cardStyle = item => {
      let expanded = this.state.expanded.indexOf(item) !== -1      
      if (this.state.creatingNewVolume === null) {
        return {
          width: 1200, 
          margin: expanded ? 24 : 8, 
          transition: 'all 300ms',
        }
      }
      else {
        return {
          width: 1200,
          margin: 2,
          transition: 'all 300ms'
        }
      }
    }

    this.cardDepth = item => {
      let expanded = this.state.expanded.indexOf(item) !== -1
      if (this.state.creatingNewVolume === null)
        return expanded ? 2 : 1
      else
        return 0
    }

    ////////////////////////////////////////////////////////////////////////////
    //
    // widget
    //

    this.ExpandToggle = props => (
      <IconButton 
        onTouchTap={() => this.toggleExpanded(props.item)}
        color='red'
      >
        { this.state.expanded.indexOf(props.item) === -1 ?
          <NavigationExpandMore color='rgba(0,0,0,0.54)' /> : 
          <NavigationExpandLess color='rgba(0,0,0,0.54)' /> } 
      </IconButton>
    )

    // frame height should be 36 + marginBottom (12, supposed)
    this.TextButtonTop = () => (
      <div style={{width: '100%', height: 36, 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div>{ props.text || '' }</div>
        <FlatButton
          label='创建磁盘阵列'
          labelPosition='before'
          icon={<ContentAddCircle color={this.props.muiTheme.palette.primary1Color} />}
          disableTouchRipple={true} 
          disableFocusRipple={true}
          onTouchTap={this.onToggleCreatingNewVolume}
        /> 
      </div>
    )

    // frame height should be 48 + 16 + 64 + 8 = 136
    this.NewVolumeTop = () => {

      let cnv = this.state.creatingNewVolume

      let actionEnabled = cnv.disks.length > 0 
      let raidEnabled = cnv.disks.length > 1

      let hint = cnv.disks.length > 0 ?
        `已选中${cnv.disks.length}个磁盘` : '请选择磁盘'

      return (
        <div style={{width: '100%', height: 136 - 48 - 16}}>

          {/*          
          <div style={{width: '100%', height: 48, marginBottom: 16, 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{fontSize: 20, color: 'rgba(0,0,0,0.54)'}}>创建磁盘阵列</div> 
            <IconButton 
              iconStyle={{fill: 'rgba(0,0,0,0.54)'}}
              onTouchTap={this.onToggleCreatingNewVolume}>
              <NavigationClose />
            </IconButton> 
          </div>
          */}

          <Paper style={{ width: '100%', height: 64, 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: this.props.muiTheme.palette.accent1Color,
            // backgroundColor: '#FCE4EC' // pink50, not working
          }}>

            <div style={{marginLeft: 16, fontSize: 16}}>{ hint }</div> 

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RaidModePopover
                list={[
                  ['single', '使用SINGLE模式', false],
                  ['raid0', 
                    raidEnabled ? '使用RAID0模式' : '使用RAID0模式 (需选择至少两块磁盘)', 
                    !raidEnabled 
                  ],
                  ['raid1', 
                    raidEnabled ? '使用RAID1模式' : '使用RAID1模式 (需选择至少两块磁盘)', 
                    !raidEnabled
                  ],
                ]}
                color={this.props.muiTheme.palette.accent1Color}
                select={cnv.mode}
                disabled={!actionEnabled}
                onSelect={this.setVolumeMode}
              />
              <CreatingNewVolumeCombo 
                disabled={this.state.creatingNewVolume.disks.length === 0}
              />
              <FlatButton label='取消' secondary={true} 
                onTouchTap={this.onToggleCreatingNewVolume}
              />
            </div> 

          </Paper>
        </div>
      )
    }

    this.volumeUnformattable = volume => {
      return []
    }

    this.diskUnformattable = disk => {

      const K = x => y => x
      const blocks = this.state.storage.blocks

      if (disk.isVolumeDevice)
        throw new Error('diskUnformattable requires non-volume disk as arguments')

      if (disk.isPartitioned) {
        return blocks
          .filter(blk => blk.parentName === disk.name && !blk.isExtended)
          .reduce((p, c) => (c.isActiveSwap || c.isRootFS) ?  K(p)(p.push(c)) : p, []) 
      }
      else if (disk.isFileSystem) {
        return (disk.isActiveSwap || disk.isRootFS) ? [disk] : []
      }
      else
        return []
    }

    this.volumeIconColor = volume => 
      this.state.creatingNewVolume ? '#E0E0E0' :
        volume.wisnuc.hasOwnProperty('users') ? this.props.muiTheme.palette.primary1Color :
          '#BDBDBD'

    this.VolumeTitle = props => {

      const volume = props.volume
      return (
        <div style={{width: '100%', height: '100%', display:'flex'}}>
          <HeaderIcon>
            <Avatar style={{ margin:4 }} 
              color='white' 
              backgroundColor={this.volumeIconColor(volume)}
              icon={<ContentContentCopy viewBox='0 0 24 24' />} 
            />
          </HeaderIcon>
          <HeaderTitle1 
            style={{
              fontSize: 16, 
              height: HEADER_HEIGHT,
              color: !!this.state.creatingNewVolume ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)'
            }}
            title='磁盘阵列' 
          />
        </div>
      )
    }

    this.VolumeHeadline = props => {

      let vol = props.volume
      let text = `Btrfs文件系统，${vol.total}个磁盘，${vol.usage.data.mode.toUpperCase()}模式`
      
      return (
        <div style={{
          fontSize: 14, 
          fontWeight: 'bold',
          color: this.state.creatingNewVolume ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)'
        }}>{text}</div>
      )
    }

    this.DiskHeadline = props => {

      let disk = props.disk
      let text 

      if (disk.isPartitioned) {
        text = '分区使用的磁盘'
      }
      else if (disk.idFsUsage === 'filesystem') {
        text = '包含文件系统（无分区表）'
      }
      else if (disk.idFsUsage === 'other') {
        text = '包含特殊文件系统（无分区表）'
      }
      else if (disk.idFsUsage === 'raid') {
        text = 'Linux RAID设备'
      }
      else if (disk.idFsUsage === 'crypto') {
        text = '加密文件系统'
      }
      else if (disk.idFsUsage) {
        text = `未知的使用方式 (ID_FS_USAGE=${disk.idFsUsage})`
      }
      else {
        text = '未发现文件系统或分区表'
      }

      return (
        <div style={{
          fontSize: 14, 
          fontWeight: 'bold',
          color: this.state.creatingNewVolume ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)'
        }}>{text}</div>
      )
    }

    this.DiskTitle = props => {

      const disk = props.disk
      const { primary1Color, accent1Color } = this.props.muiTheme.palette
      const cnv = !!this.state.creatingNewVolume
      const uf = this.diskUnformattable(disk).length > 0

      return (
        <div style={{position: 'absolute', width: 256, left: 0, 
          top: props.top, 
          height: cnv ? TABLEDATA_HEIGHT : HEADER_HEIGHT, 
          transition: 'all 300ms',
          display: 'flex', alignItems: 'center'}}>
          <HeaderIcon>
            { cnv &&  
              <Checkbox40 
                fill={accent1Color} 
                disabled={uf}
                onTouchTap={e=> e.stopPropagation()} 
                checked={!!this.state.creatingNewVolume.disks.find(d => d === disk)}
                onCheck={() => this.toggleCandidate(disk)}
              /> }
            { !cnv &&
              <Avatar 
                style={{ margin:4 }} 
                color='white' 
                backgroundColor={primary1Color}
                icon={<HDDIcon />} 
              /> }
          </HeaderIcon>
          <HeaderTitle1 
            style={{ 
              fontSize: cnv ? 13 : 16, 
              color: (!cnv || !uf) ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.38)',
              height: cnv ? TABLEDATA_HEIGHT : HEADER_HEIGHT,
              transition: 'height 300ms'
            }}
            title={diskName(disk.name)} 
            onTouchTap={e => cnv && e.stopPropagation()}
          />
        </div>
      )
    }

    this.BtrfsVolume = props => {

      const primary1Color = this.props.muiTheme.palette.primary1Color
      const accent1Color = this.props.muiTheme.palette.accent1Color
   
      let volume = props.volume
      let boot = this.state.boot
      let { volumes, blocks } = this.state.storage
      let cnv = !!this.state.creatingNewVolume

      //let expandableHeight = this.state.expanded ? 17 * 24 + 3 * SUBTITLE_HEIGHT + SUBTITLE_MARGINTOP : 0
      let expandableHeight = this.state.expanded.indexOf(volume) !== -1 ?
        17 * 24 + 3 * SUBTITLE_HEIGHT + SUBTITLE_MARGINTOP : 0

      const comment = () => volume.missing ? '有磁盘缺失' : '全部在线'

      return (
        <Paper {...props}>

          <div style={{width: '100%', display: 'flex', alignItems: 'center'}}
            onTouchTap={() => this.toggleExpanded(volume)}
          >
            <div style={{flex: '0 0 256px'}}>
              <this.VolumeTitle volume={volume} />
            </div>

            {/*
            <WisnucLabel style={{height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', 
              fontSize: 14, fontWeight: 'bold'}} wisnuc={volume.wisnuc} />
            <div style={{flexGrow: 1}} />
            */}

            <div style={{flex: '0 0 336px'}}>
              <this.VolumeHeadline volume={volume} />
            </div>

          </div>

          <VerticalExpandable height={expandableHeight}>

            <SubTitleRow text='磁盘阵列信息' disabled={cnv} />

            <div style={{width: '100%', display: 'flex'}}>
              <div style={{flex: '0 0 256px'}} />
              <KeyValueList 
                disabled={cnv}
                items={[
                  ['磁盘数量', `${volume.total} (${comment()})`],
                  ['UUID', volume.uuid.toUpperCase()],
                  ['访问路径', volume.mountpoint],
                ]}
              />
            </div>

            <SubTitleRow text='数据使用' disabled={cnv} />
            
            <div style={{width: '100%', display: 'flex'}}>
              <div style={{flex: '0 0 256px'}} />
              <KeyValueList 
                style={{width: 336}}
                disabled={cnv}
                right={true}
                items={[
                  ['总容量', prettysize(volume.usage.overall.deviceSize)],
                  ['已分配容量', prettysize(volume.usage.overall.deviceAllocated)],
                  ['未分配容量', prettysize(volume.usage.overall.deviceUnallocated)],
                  ['已用空间', prettysize(volume.usage.overall.used)],
                  ['可用空间（估计）', prettysize(volume.usage.overall.free)],
                  ['可用空间（最少）', prettysize(volume.usage.overall.freeMin)],
                  ['全局保留空间', prettysize(volume.usage.overall.globalReserve)],
                  ['全局保留空间（已使用）', prettysize(volume.usage.overall.globalReserveUsed)],
                  ['用户数据空间', prettysize(volume.usage.data.size)],
                  ['用户数据空间（已使用）', prettysize(volume.usage.data.used)],
                  ['元数据空间', prettysize(volume.usage.metadata.size)],
                  ['元数据空间（已使用）', prettysize(volume.usage.metadata.used)],
                  ['系统数据空间', prettysize(volume.usage.system.size)],
                  ['系统数据空间（已使用）', prettysize(volume.usage.system.used)],
                ]}
              />
              <div style={{flex: '0 0 56px'}} />
              <KeyValueList 
                style={{width: 336}}
                disabled={cnv}
                right={true}
                items={[
                  ['用户数据', volume.usage.data.mode],
                  ['元数据', volume.usage.metadata.mode],
                  ['系统数据', volume.usage.system.mode],
                ]}
              />
            </div>
            <div style={{width: '100%', height: SUBTITLE_MARGINTOP}} />
            <SubTitleRow text='磁盘信息' disabled={cnv && this.volumeUnformattable(volume).length > 0} />
          </VerticalExpandable>

          <TableHeaderRow 
            style={{ color: 'rgba(0,0,0,0.54)' }}
            items={[ 
              ['', 256], 
              ['接口', 64], 
              ['容量', 64, true], 
              ['', 56],
              ['设备名', 96],
              ['型号', 208],
              ['序列号', 208],
              ['DEV ID', 96],
              ['已使用', 64, true],
            ]} 
          />

          <DoubleDivider grayLeft={256} colorLeft={cnv ? 256 : '100%'} />

          { blocks.filter(blk => blk.isVolumeDevice && blk.fileSystemUUID === volume.uuid)
              .map(blk => ( 
                <TableDataRow
                  disabled={this.volumeUnformattable(volume).length > 0}
                  selected={cnv && !!this.state.creatingNewVolume.disks.find(d => d === blk)}
                  items={[
                    [(cnv ? 
                      <Checkbox40 
                        fill={accent1Color} 
                        checked={!!this.state.creatingNewVolume.disks.find(d => d === blk)}
                        onCheck={() => this.toggleCandidate(blk)}
                      /> :
                      <HDDIcon 
                        color='rgba(0,0,0,0.38)' 
                        viewBox='0 0 24 24' 
                      />), 72, true
                    ],
                    [diskName(blk.name), 184],
                    [blk.idBus, 64],
                    [prettysize(blk.size * 512), 64, true],
                    ['', 56],
                    [blk.name, 96],
                    [blk.model || '', 208],
                    [blk.serial || '', 208],
                    [volume.devices.find(d => d.name === blk.name).id.toString(), 96],
                    [volume.devices.find(d => d.name === blk.name).used, 64, true]
                  ]} />
              ))
              .reduce((p, c, index, array) => {
                p.push(c)
                p.push(
                  <DoubleDivider 
                    grayLeft={index === array.length - 1 ? null : 72} 
                    colorLeft={cnv ? 72 : '100%'} 
                  />
                )
                return p
              }, []) }

          <div style={{width: '100%', height: cnv ? FOOTER_HEIGHT : 0, transition: 'height 300ms',
            display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{flex: '0 0 72px'}}/>
            <div style={{fontSize: 14, color: accent1Color}}>
              { cnv && '选择该磁盘阵列中的磁盘建立新的磁盘阵列，会摧毁当前磁盘阵列存储的所有数据。' }
            </div>
          </div>
        </Paper>
      )
    }

    this.partitionedDiskNewVolumeWarning = parts => {
      if (parts.length === 0) 
        return '选择该磁盘建立新的磁盘阵列，会摧毁磁盘上的所有数据。'

      return parts
              .reduce((p, c, i, a) => {
                let s
                if (c.isActiveSwap)
                  s = p + `在使用的交换分区(${c.name})`
                else if (c.isRootFS)
                  s = p + `在使用的系统分区(${c.name})`

                if (i === a.length - 2) {
                  s += '和'
                }
                else if (i === a.length - 1) {
                  s += '。'
                }
                else {
                  s += '，'
                }
                return s
              }, '该磁盘不能加入磁盘阵列；它包含')
    }

    this.PartitionedDisk = props => {

      // K combinator
      const K = x => y => x

      const disk = props.disk
      const boot = this.state.boot
      const { blocks} = this.state.storage
      const cnv = !!this.state.creatingNewVolume

      const parts= blocks.filter(blk => blk.parentName === disk.name && !blk.isExtended) 

      const floatingTitleTop = () => {
        if (!cnv) return 0
        let inner = TABLEHEADER_HEIGHT + parts.length * TABLEDATA_HEIGHT + SUBTITLE_MARGINTOP
          + 2 * SUBTITLE_HEIGHT
        let outer = HEADER_HEIGHT + TABLEHEADER_HEIGHT
      
        debug('partitioned disk floatingTitleTop', cnv, inner, outer)

        return this.state.expanded.indexOf(disk) !== -1 ? inner + outer : outer      
      }

      // return array of unformattable partitions
      const unformattable = () => 
        parts.reduce((p, c) => 
          (c.isActiveSwap || c.isRootFS) ? 
            K(p)(p.push(c)) : 
              p, []) 

      return (

        <Paper {...props}>
          <div 
            style={{position: 'relative', width:'100%', height: HEADER_HEIGHT, 
              display:'flex', alignItems: 'center'}}
            onTouchTap={() => this.toggleExpanded(disk)}
          >
            <div style={{flex: '0 0 256px'}}>
              <this.DiskTitle disk={disk} top={floatingTitleTop()} />
            </div>
            <div style={{flex: '0 0 336px'}}>
              <this.DiskHeadline disk={disk} />
            </div>
          </div>

          <VerticalExpandable height={this.state.expanded.indexOf(disk) !== -1 ? 
            SUBTITLE_HEIGHT * 2 + 
            TABLEHEADER_HEIGHT + 
            TABLEDATA_HEIGHT * parts.length + 
            SUBTITLE_MARGINTOP : 0
          }>

            <SubTitleRow text='分区信息' disabled={cnv} />
            <TableHeaderRow 
              disabled={cnv}
              items={[
                ['', 256],
                ['文件系统', 64],
                ['容量', 64, true],
                ['', 56],
                ['设备名', 96],
                ['路径（挂载点）', 416],
              ]}/> 
         
            <Divider style={{marginLeft: 256}} /> 
            { parts.map(blk => (
                <TableDataRow 
                  disabled={cnv}
                  selected={false} 
                  items={[
                    ['', 72],
                    [blk.name, 184],
                    [(blk.idFsUsage && blk.fileSystemType) ? blk.fileSystemType : '(未知)', 64],
                    [prettysize(blk.size * 512), 64, true],
                    ['', 56],
                    [blk.name, 96],
                    [blk.isMounted ? blk.mountpoint : '', 416],
                  ]} />
                ))
                .reduce((p, c, index) => {
                  p.push(c)
                  p.push(<Divider inset={true} />)
                  return p
                }, []) }
            <div style={{width: '100%', height: SUBTITLE_MARGINTOP}} />

            <SubTitleRow text='磁盘信息' disabled={cnv && this.diskUnformattable(disk).length > 0}/>
          </VerticalExpandable>
          <TableHeaderRow 
            disabled={cnv && this.diskUnformattable(disk).length > 0}
            items={[ 
              ['', 256], 
              ['接口', 64], 
              ['容量', 64, true], 
              ['', 56],
              ['设备名', 96],
              ['型号', 208],
              ['序列号', 208],
              ['分区表类型', 112],
            ]} 
          />

          <DoubleDivider 
            grayLeft={256} 
            colorLeft={unformattable().length > 0 ? null : cnv ? 256 : '100%'} 
          />

          <TableDataRow
            disabled={cnv && this.diskUnformattable(disk).length > 0}
            selected={cnv && !!this.state.creatingNewVolume.disks.find(d => d === disk)}
            items = {[
              ['', 72],
              ['', 184],
              [disk.idBus, 64],
              [prettysize(disk.size * 512), 64, true],
              ['', 56],
              [disk.name, 96],
              [disk.model || '', 208],
              [disk.serial || '', 208],
              [disk.partitionTableType, 112], 
            ]}
          />       

          {/* exclusive OR */}
          <DoubleDivider 
            grayLeft={unformattable().length > 0 ? (cnv ? 72 : '100%') : null} 
            colorLeft={unformattable().length === 0 ? (cnv ? 72 : '100%') : null} 
          />

          <div style={{width: '100%', height: cnv ? FOOTER_HEIGHT : 0, transition: 'height 300ms',
            display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{flex: '0 0 72px'}}/>
            <div style={{
              fontSize: 14, 
              color: unformattable().length > 0 ? 'rgba(0,0,0,0.87)' : 
                this.props.muiTheme.palette.accent1Color
            }}>
              { cnv && this.partitionedDiskNewVolumeWarning(unformattable()) }
            </div>
          </div>
        </Paper>
      )
    }

    // file system disk is determined by idFsUsage
    this.FileSystemUsageDisk = props => {

      const primary1Color = this.props.muiTheme.palette.primary1Color
      const accent1Color = this.props.muiTheme.palette.accent1Color

      let boot = this.state.boot
      let storage = this.state.storage
      let disk = props.disk

      let cnv = !!this.state.creatingNewVolume

      let floatingTitleTop = () => {

        if (!cnv) return 0
        let outer = HEADER_HEIGHT + TABLEHEADER_HEIGHT
        let inner = TABLEHEADER_HEIGHT + TABLEDATA_HEIGHT + SUBTITLE_MARGINTOP + 2 * SUBTITLE_HEIGHT
        return this.state.expanded.indexOf(disk) !== -1 ? inner + outer : outer
      }
      
      return (
        <Paper {...props}>
          <div 
            style={{position: 'relative', width:'100%', height: HEADER_HEIGHT, 
              display:'flex', alignItems: 'center'}}
            onTouchTap={() => this.toggleExpanded(disk)}
          >
            <div style={{flex: '0 0 256px'}}>
              <this.DiskTitle disk={disk} top={floatingTitleTop()} />
            </div>
            <div style={{flex: '0 0 336px'}}>
              <this.DiskHeadline disk={disk} />
            </div>
          </div>

          <VerticalExpandable height={
            this.state.expanded.indexOf(disk) !== -1 ? 
              SUBTITLE_HEIGHT * 2 + 
              TABLEHEADER_HEIGHT + 
              TABLEDATA_HEIGHT + 
              SUBTITLE_MARGINTOP : 0
          }>

            <SubTitleRow text='文件系统信息' disabled={cnv} />
            <TableHeaderRow
              disabled={cnv}
              items={[
                ['', 256],
                ['文件系统', 184],
                ['文件系统UUID', 304],
                ['路径（挂载点）', 416],
              ]}/> 
            <Divider style={{marginLeft: 256}} />
            <TableDataRow
              disabled={cnv}
              selected={false}
              items = {[
                ['', 256],
                [disk.fileSystemType, 184],
                [disk.fileSystemUUID, 304],
                [disk.isMounted ? disk.mountpoint : '(未挂载)'],
              ]}
            />          
            <Divider style={{marginLeft: 256}} />
            <div style={{width: '100%', height: SUBTITLE_MARGINTOP }}/>

            <SubTitleRow text='磁盘信息' disabled={cnv && this.diskUnformattable(disk).length > 0} />
          </VerticalExpandable>

          <TableHeaderRow 
            disabled={cnv && this.diskUnformattable(disk).length > 0}
            items={[ 
              ['', 256], 
              ['接口', 64], 
              ['容量', 64, true], 
              ['', 56],
              ['设备名', 96],
              ['型号', 208],
              ['序列号', 208],
            ]} />
          <DoubleDivider grayLeft={256} colorLeft={cnv ? 256 : '100%'} />

          <TableDataRow
            disabled={cnv && this.diskUnformattable(disk).length > 0}
            selected={cnv && !!this.state.creatingNewVolume.disks.find(d => d === disk)}
            items = {[
              ['', 256],
              [disk.idBus, 64],
              [prettysize(disk.size * 512), 64, true],
              ['', 56],
              [disk.name, 96],
              [disk.model || '', 208],
              [disk.serial || '', 208],
            ]}
          />       
          <DoubleDivider colorLeft={cnv ? 72 : '100%'} />
          <div style={{width: '100%', height: cnv ? FOOTER_HEIGHT : 0, transition: 'height 300ms',
            display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{flex: '0 0 72px'}}/>
            <div style={{
              fontSize: 14, 
              color: (disk.isActiveSwap || disk.isRootFS) ? 'rgba(0,0,0,0.87)' : accent1Color
            }}>
              { cnv &&
                ( disk.isActiveSwap ? '该磁盘不能加入磁盘阵列；它是在使用的交换文件系统。' :
                  disk.isRootFS ? '该磁盘不能加入磁盘阵列；它是在使用的系统文件系统。' :
                  '选择该磁盘加入新的磁盘阵列，会摧毁该磁盘上的所有数据。'
                )
              }
            </div>
          </div>
        </Paper> 
      )
    }

    this.NoUsageDisk = props => {
      
      const primary1Color = this.props.muiTheme.palette.primary1Color
      const accent1Color = this.props.muiTheme.palette.accent1Color

      let boot = this.state.boot
      let storage = this.state.storage
      let disk = props.disk

      let cnv = !!this.state.creatingNewVolume

      let expandableHeight = this.state.expanded.indexOf(disk) !== -1 ?
        24 + SUBTITLE_HEIGHT + SUBTITLE_MARGINTOP : 0

      let floatingTitleTop = () => {
        if (!cnv) return 0
        return HEADER_HEIGHT + TABLEHEADER_HEIGHT + expandableHeight
      }
  
      return (
        <Paper {...props}>
          <div 
            style={{position: 'relative', width:'100%', height: HEADER_HEIGHT, 
              display:'flex', alignItems: 'center'}}
            onTouchTap={() => this.toggleExpanded(disk)}
          >
            <div style={{flex: '0 0 256px'}}>
              <this.DiskTitle disk={disk} top={floatingTitleTop()} />
            </div>
            <div style={{flex: '0 0 336px'}}>
              <this.DiskHeadline disk={disk} />
            </div>
          </div>

          <VerticalExpandable height={expandableHeight}>

            <div style={{height: 48, lineHeight: '24px', marginLeft: 256, fontSize: 14}}>
              该信息仅供参考；有可能磁盘上的文件系统特殊或者较新，本系统未能正确识别。
            </div>
            <div style={{height: SUBTITLE_MARGINTOP}} />
            <SubTitleRow text='磁盘信息' /> 

          </VerticalExpandable>

          <TableHeaderRow 
            disabled={false}
            items={[ 
              ['', 256], 
              ['接口', 64], 
              ['容量', 64, true], 
              ['', 56],
              ['设备名', 96],
              ['型号', 208],
              ['序列号', 208],
            ]} />
          <DoubleDivider grayLeft={256} colorLeft={cnv ? 256 : '100%'} />
          <TableDataRow
            disabled={false}
            selected={cnv && this.state.creatingNewVolume.disks.find(d => d === disk)}
            items = {[
              ['', 256],
              [disk.idBus, 64],
              [prettysize(disk.size * 512), 64, true],
              ['', 56],
              [disk.name, 96],
              [disk.model || '', 208],
              [disk.serial || '', 208],
            ]}
          />       
          <DoubleDivider colorLeft={cnv ? 72 : '100%'} />
          <div style={{width: '100%', height: cnv ? FOOTER_HEIGHT : 0, transition: 'height 300ms',
            display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{flex: '0 0 72px'}}/>
            <div style={{
              fontSize: 14, 
              color: (disk.isActiveSwap || disk.isRootFS) ? 'rgba(0,0,0,0.87)' : accent1Color
            }}>
              { cnv && '选择该磁盘加入新的磁盘阵列，会摧毁该磁盘上的所有数据。' }
            </div>
          </div>
        </Paper> 
      )
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
        else {
          this.setState({ 
            storage: res.body
          })
        }
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

  renderAppBar() {
    return <AppBar 
      style={{position: 'absolute', height: 128, width: 'calc(100% - 16px)'}} 
      showMenuIconButton={false}
      iconElementRight={
        <IconButton onTouchTap={() => window.store.dispatch({type: 'EXIT_MAINTENANCE'})}>
          <ActionExitToApp />
        </IconButton> }
      zDepth={2}
    />
  }

  renderCat() {
    return <CatSilhouette 
      style={{ position: 'absolute',
        top: 34, left: 48, width:120, height:114,
        zIndex: 10000 
      }} 
      color='#E0E0E0' 
    />
  } 

  renderTitle() {
    return (
      <div style={{
        position: 'absolute',
        top: 64, height: 64, width: 'calc(100% - 16px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          width: 1200, 
          fontSize: 24, color:'#FFF', 
          display: 'flex', alignItems: 'center',
          zIndex: 1200,
        }}>
          <div style={{width: 72, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <BallOfYarn style={{width: 24, height: 24}} color='#FFF' />
          </div>
          <div>WISNUC - 维护模式</div>
        </div>
      </div>
    )
  }

  render() {
    
    const primary1Color = this.props.muiTheme.palette.primary1Color
    const accent1Color = this.props.muiTheme.palette.accent1Color

    const cnv = !!this.state.creatingNewVolume  
    const raidDisabled = !this.state.creatingNewVolume || this.state.creatingNewVolume.disks.length < 2
    const bright = 'rgba(255,255,255,0.7)'
    const dim = 'rgba(0,0,0,0.54)'

    const cardStyle= {
      width: 1200, 
      marginBottom: cnv ? 4 : 24, 
      transition: 'margin-bottom 300ms',
    }
    
    if (typeof this.state.boot !== 'object' || typeof this.state.storage !== 'object') return <div />

    return (

      <div style={{width: '100%', height: '100%', backgroundColor: '#F5F5F5', overflowY: 'scroll'}}>

        { this.renderAppBar() }
        { this.renderCat() }
        { this.renderTitle() }

        {/* page container */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* placeholde for AppBar */}
          <div style={{ width: '100%', height: 128, marginBottom: 24 }}/>

          {/* gray box begin */}
          <div style={{            
            backgroundColor: cnv ? '#E0E0E0' : '#F5F5F5', 
            padding: cnv ? '24px 16px 24px 16px' : 0, 
            transition: 'all 300ms',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>

            {/* top panel selector */}
            <div style={{ width: 1200, height: cnv ? 136 - 48 - 16 : 48, transition: 'height 300ms' }}>
              { cnv ?  <this.NewVolumeTop /> : <this.TextButtonTop /> }
            </div>

            { typeof this.state.boot === 'object' && typeof this.state.storage === 'object' &&
              this.state.storage.volumes.map(vol => 
                <this.BtrfsVolume style={this.cardStyle(vol)} volume={vol} zDepth={this.cardDepth(vol)} />) }

            { typeof this.state.boot === 'object' && typeof this.state.storage === 'object' &&
              this.state.storage.blocks
                .filter(blk => blk.isDisk && !blk.isVolumeDevice)
                .map(disk => React.createElement( 
                  disk.isPartitioned ? this.PartitionedDisk : 
                  !!disk.idFsUsage ? this.FileSystemUsageDisk : this.NoUsageDisk, {
                    style: this.cardStyle(disk), zDepth: this.cardDepth(disk), disk
                  }, null)) }

          </div> 
          {/* gray box end */}

          <div style={{width: '100%', height: 48}} />
        </div>
      </div>
    )
  }
}

/**
                  disk.isPartitioned ? <this.PartitionedDisk style={this.cardStyle(disk)} disk={disk} /> :
                  !!disk.idFsUsage ? <this.FileSystemUsageDisk style={this.cardStyle(disk)} disk={disk} /> :
                  <this.NoUsageDisk style={this.cardStyle(disk)} disk={disk} />) } 
**/


export default Maintenance

