import Debug from 'debug'
const debug = Debug('component:maintenance')

import React from 'react'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { 
  AppBar, Avatar, Checkbox, Chip, Divider, Paper, SvgIcon, Menu, MenuItem, 
  FloatingActionButton, Subheader, Dialog, RaisedButton, 
  IconButton, TextField, Toggle, CircularProgress 
} from 'material-ui'

import FlatButton from '../common/FlatButton'

import Popover, {PopoverAnimationVertical} from 'material-ui/Popover'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import { List, ListItem } from 'material-ui/List'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'
import ActionDns from 'material-ui/svg-icons/action/dns'
import ActionDonutSmall from 'material-ui/svg-icons/action/donut-small'
import ImageCropPortrait from 'material-ui/svg-icons/image/crop-portrait'
import ContentContentCopy from 'material-ui/svg-icons/content/content-copy'
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import NavigationMoreVert from 'material-ui/svg-icons/navigation/more-vert'
import ContentAddCircle from 'material-ui/svg-icons/content/add-circle'

import { 
  pinkA200, grey300, grey400, greenA400, green400, amber400, 
  redA200,
  red400, 
  lightGreen100,
  lightGreen400,
  lightGreenA100,
  lightGreenA200,
  lightGreenA400, 
  lightGreenA700
} from 'material-ui/styles/colors'

import UUID from 'node-uuid'

import { CatSilhouette, BallOfYarn } from './svg'
import { InitVolumeDialogs } from './InitVolumeDialogs'

import { 
  operationTextConfirm, operationBase, Operation, operationBusy, operationSuccess, operationFailed, createOperation 
} from '../common/Operation'

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

const diskDisplayName = name => {
  let chr = name.charAt(2)
  let number = alphabet.indexOf(chr) + 1
  return `硬盘 #${number}`
}

const partitionDisplayName = name => {
  let numstr = name.slice(3)
  return `分区 #${numstr}`
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
    this.handleRequestClose = () => this.setState({ open: false, anchorEl: null })
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
          onTouchTap={e => !this.props.disabled && this.setState({ open: true, anchorEl: e.currentTarget })}
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

@muiThemeable()
class Maintenance extends React.Component {

  constructor(props) {

    super(props)
    const that = this

    this.unmounted = false
    this.createOperation = (operation, ...args) =>
      createOperation(this, 'dialog', operation, ...args)

    this.colors = {

      primary: this.props.muiTheme.palette.primary1Color,
      accent: this.props.muiTheme.palette.accent1Color,
      
      fillGrey: grey400,
      fillGreyFaded: grey300      
    }

    this.dim = {
      
    }

    this.state = { 
      creatingNewVolume: null,
      expanded: [],
      operation: null,
    }

    this.reloadBootStorage = callback => {

      let done = false
      let device = window.store.getState().maintenance.device
      let storage, boot

      const finish = () => {
        if (storage && boot) {
          debug('reload boot storage', boot, storage)
          this.setState({ 
            storage, boot,  
            creatingNewVolume: this.state.creatingNewVolume ? { disks: [], mode: 'single' } : null
          })

          callback && callback(null, { storage, boot })
          done = true 
        }
      }

      request.get(`http://${device.address}:3000/system/storage?wisnuc=true`)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (this.unmounted) {
            if (!done) {
              callback && callback(new Error('unmounted'))
              done = true
            }
            return
          }
          storage = err ? err.message : res.body
          finish()
        })

      request.get(`http://${device.address}:3000/system/boot`)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (this.unmounted) {
            if (!done) {
              callback && callback(new Error('unmounted'))
              done = true
            }
          }
          boot = err ? err.message : res.body
          finish()
        })
    }

    ////////////////////////////////////////////////////////////////////////////
    //
    // operation
    //
    this.operationOnCancel = () => {
      this.setState({ operation: null }) 
    }

    this.UsernamePasswordContent = props => {

      const onChange = (name, value) => {
        let operation = Object.assign({}, this.state.operation)
        operation[name] = value
        this.setState({ operation })
      }

      return (
        <div>
          <TextField hintText='' floatingLabelText='用户名' 
            onChange={e => onChange('username', e.target.value)} />
          <TextField hintText='' floatingLabelText='输入密码' type='password'
            onChange={e => onChange('password', e.target.value)} />
          <TextField hintText='' floatingLabelText='再次输入密码' type='password'
            onChange={e => onChange('passwordAgain', e.target.value)} />
        </div>
      )
    }

    // Sub Component
    this.OperationTextContent = props => (
      <div style={{width: '100%'}}>
        { this.state.operation.text.map((line, index, array) => {
          return (
          <div style={{ 
            fontSize: 15, lineHeight: '24px', 
            marginBottom: index === array.length - 1 ? 0 : 20
          }}>{ line }</div>)
        })}
      </div>     
    )

    // Sub Component
    this.OperationBusy = props => (
      <div style={{width: '100%', height: '100%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress color={pinkA200} />
      </div> 
    )

    // state transition
    this.setOperationDialogBusy = () => {

      let operation = {
        stage: 'WIP',
        title: '执行操作',
        Content: this.OperationBusy,
        actions: [
          {
            label: ' ',
            disabled: true
          }
        ]
      }

      this.setState({ operation })
    }

    this.setOperationDialogSuccess = text => {

      let operation = {
        stage: 'SUCCESS',
        title: '操作成功',
        text,
        Content: this.OperationTextContent,
        actions: [ 
          {
            label: '晓得了',
            onTouchTap: this.operationOnCancel
          }
        ]
      }

      this.setState({ operation })
    }

    this.setOperationDialogFailed = text => {

      let operation = {
        stage: 'FAILED',
        title: '操作失败',
        text,
        Content: this.OperationTextContent,
        actions: [ 
          {
            label: '晓得了',
            onTouchTap: this.operationOnCancel
          }
        ]
      }

      this.setState({ operation })
    }

    // TODO move to main render
    this.OperationDialog = props => {

      let operation = this.state.operation
      return ( 
        <Dialog
          contentStyle={{ width: (this.state.operation && this.state.operation.width) || 560 }}
          title={operation && operation.title}
          open={operation !== null}
          modal={true}
          actions={ operation && operation.actions && 
            operation.actions.map(action => 
              <FlatButton 
                label={action.label}
                onTouchTap={action.onTouchTap}
                disabled={typeof action.disabled === 'function' ? action.disabled() : action.disabled}
              /> ) 
          }
        >
          { operation && operation.Content && <operation.Content /> }
        </Dialog>
      )
    }

    ////////////////////////////////////////////////////////////////////////////
    // 
    // operations
    //
    
    this.errorText = (err, res) => {

      let text = []

      // see superagent documentation on error handling
      if (err.status) {
        text.push(`${err.status} ${err.message}`)
        if (res && res.body && res.body.message)
          text.push(`message: ${res.body.message}`)
      } 
      else {
        text.push(`错误信息：`, err.message)
      }

      return text
    }

    this.startWisnucOnVolume = volume => {
    
      let text = ['启动安装于Btrfs磁盘阵列上的WISNUC应用？']

      this.createOperation(operationTextConfirm, text, () => {

        this.state.dialog.setState(operationBusy)

        let device = window.store.getState().maintenance.device
        let url = `http://${device.address}:3000/system/mir/run`

        request
          .post(url)
          .set('Accept', 'application/json')
          .send({ target: volume.fileSystemUUID })
          .end((err, res) => {

            if (err) {
              this.reloadBootStorage((err2, { boot, storage }) => {
                this.state.dialog.setState(operationFailed, this.errorText(err, res))
              })
            }
            else {
              this.reloadBootStorage((err2, { boot, storage }) => {
                // FIXMED
                for(let i=3;i>=0;i--)
                {
                  let time=(3-i)*1000;
                  let that=this;
                  setTimeout(function(){that.state.dialog.setState(operationSuccess, ['启动成功，系统将在' + i + '秒钟后跳转到登录页面'])},time)
                }
                  setTimeout(function(){window.store.dispatch({type: 'EXIT_MAINTENANCE'})},4000)
              })
            }
          })
      })  
    }

    this.initWisnucOnVolume = volume => {

      debug('initWisnucOnVolume', volume)

      // TODO FIXME
      if (typeof volume.wisnuc !== 'object') return

      this.setState({ initVolume: volume })
    }

    this.mkfsBtrfsVolume = () => {
      
      if (this.state.creatingNewVolume === null) return

      let target = this.state.creatingNewVolume.disks.map(disk => disk.name)
      let type = 'btrfs'
      let mode = this.state.creatingNewVolume.mode

      let text = []

      text.push(`使用设备${target.join()}和${mode}模式创建新磁盘阵列，` +
        '这些磁盘和包含这些磁盘的磁盘阵列上的数据都会被删除且无法恢复。')
      text.push('确定要执行该操作吗？')

      this.createOperation(operationTextConfirm, text, () => {

        // set dialog state to busy
        this.state.dialog.setState(operationBusy)

        let device = window.store.getState().maintenance.device
        request
          .post(`http://${device.address}:3000/system/mir/mkfs`)
          .set('Accept', 'application/json')
          .send({ type, target, mode })
          .end((err, res) => {

            debug('mkfs btrfs request', err || res.body)
          
            // set dialog state to success or failed
            if (err) {
              this.reloadBootStorage((err2, { boot, storage }) => {  
                this.state.dialog.setState(operationFailed, this.errorText(err, res))
              })
            }
            else {
              this.reloadBootStorage((err2, { boot, storage }) => {
                this.state.dialog.setState(operationSuccess, ['成功'])
              })
            }
          })
      })
    }

    ////////////////////////////////////////////////////////////////////////////
    // 
    // actions
    //

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
        //if(item.missing){
        if(0){
          return {
            width: 1200, 
            margin: expanded ? 24 : 8, 
            transition: 'all 300ms',
            backgroundColor: red400
          }
        }
        else{
          return {
            width: 1200, 
            margin: expanded ? 24 : 8, 
            transition: 'all 300ms',
          }
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
    this.TextButtonTop = props => (
      <div style={{width: '100%', height: 36, 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div>{ props.text || '' }</div>
        <FlatButton
          label='创建磁盘阵列'
          labelPosition='before'
          icon={<ContentAddCircle color={this.props.muiTheme.palette.primary1Color} style={{verticalAlign : '-18%'}}/>}
          disableTouchRipple={true} 
          disableFocusRipple={true}
          onTouchTap={this.onToggleCreatingNewVolume}
          disabled={props.disabled}
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

      let wrap = {
        FB: FlatButton
      }

      return (
        <div style={{width: '100%', height: 136 - 48 - 16}}>

          <Paper style={{ width: '100%', height: 64, 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: this.props.muiTheme.palette.accent1Color,
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

              <FlatButton label='创建' secondary={true}
                onTouchTap={this.mkfsBtrfsVolume}
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

    this.VolumeStatus = volume => {
      
    }

    this.VolumeWisnucBadge = class extends React.Component {

    /****

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

    ****/

      constructor(props) {
        super(props)
        this.state = {
          open: false,
          anchorEl: null
        }
        this.toggleList = target => {
          if (this.state.open === false) {
            this.setState({
              open: true,
              anchorEl: target
            })
          }
          else {
            this.setState({
              open: false,
              anchorEl: null
            })
          }
        }
      }
      render() {
        let VolumeisMissing = this.props.volume.isMissing
        //debug("VolumeWisnucBadge props, VolumeisMissing, UUID",this.props,VolumeisMissing,this.props.volume.fileSystemUUID)
        if (VolumeisMissing){
          return (
            <div 
              style={{
                height: 28,
                display: 'flex', alignItems: 'center',
                boxSizing: 'border-box', padding: 8, borderRadius: 4,
                fontSize: 13,
                fontWeight: 'bold',
                color: that.state.creatingNewVolume === null ? '#D50000' : 'rgba(0,0,0,0.38)' , 
                backgroundColor: that.state.creatingNewVolume === null ? '#FF8A80' : '#E0E0E0'
              }}
            >
              发现有磁盘缺失
            </div>
          )
        }
        if (typeof this.props.volume.wisnuc !== 'object') return null //ENOFRUITMIX can't work
        let { status, users, error, message } = this.props.volume.wisnuc
        if (users) {
          if (users.length === 0) {
            return <div>WISNUC已安装但尚未创建用户。</div>
          } 
          else {
            return (
              <div 
                style={{
                  height: 28,
                  display: 'flex', alignItems: 'center',
                  boxSizing: 'border-box', padding: 8, borderRadius: 4,
                  fontSize: 13, 
                  fontWeight: 'bold', 
                  color: that.state.creatingNewVolume === null ? 
                    lightGreen400 : 'rgba(0,0,0,0.38)', 
                }}
                onTouchTap={e => {
                  e.stopPropagation()
                  this.toggleList(e.currentTarget)
                }}
              >
                <div>WISNUC已安装，有{users.length}位用户</div>
                <Popover
                  open={this.state.open}
                  anchorEl={this.state.anchorEl}
                  anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                  targetOrigin={{horizontal: 'left', vertical: 'top'}}
                  onRequestClose={() => this.setState({ open: false, anchorEl: null })}
                  animated={false}
                  animation={PopoverAnimationVertical}
                >
                  <List style={{minWidth: 240}}>
                    <Subheader>用户列表</Subheader>
                    { users.map(user => 
                        <ListItem 
                          leftAvatar={<Avatar>{user.username.slice(0,1).toUpperCase()}</Avatar>}
                          primaryText={user.username} 
                          secondaryText={ 
                            user.isFirstUser ? '第一管理员' : 
                            user.isAdmin ? '管理员' : '普通用户' 
                          }
                          disabled={true}
                        />
                      ) }
                  </List>
                </Popover>
              </div>
            )
          }
        }
        else if (status === 'NOTFOUND') {
          //debug("status",status)
          //debug("error",error)
          var text='';
          switch (error){
            case "ENOWISNUC" :
              text = "(WISNUC未安装)";break;
            case "EWISNUCNOTDIR":
              text = "(WISNUC未安装,wisnuc路径存在但不是文件夹)";break;
            case "ENOFRUITMIX":
              text = "(WISNUC未正确安装,不存在wisnuc/fruitmix文件夹)";break;
            case "EFRUITMIXNOTDIR":
              text = "(WISNUC未正确安装,wisnuc/fruitmix不是文件夹)";break;
          }
          //debug("text",text)
          return <div
            style={{
              fontSize: 13,
              color: that.state.creatingNewVolume === null ?
                'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.38)' 
            }}
          >{ text }</div>
        }
        else if (error) {

          return (
            <div 
              style={{
                height: 28,
                display: 'flex', alignItems: 'center',
                boxSizing: 'border-box', padding: 8, borderRadius: 4,
                fontSize: 13, 
                fontWeight: 'bold', 
                color: that.state.creatingNewVolume === null ? '#00C853' : 'rgba(0,0,0,0.38)' , 
                backgroundColor: that.state.creatingNewVolume === null ? '#B9F6CA' : '#E0E0E0'
              }}
              onTouchTap={e => {
                e.stopPropagation()
                this.toggleList(e.currentTarget)
              }}
            >
              <div>检测WISNUC时遇到问题</div>
              <Popover
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onRequestClose={() => this.setState({ open: false, anchorEl: null })}
                animated={false}
                animation={PopoverAnimationVertical}
              >
                <div style={{width: 240}}>
                  文件系统存在{`wisnuc/fruitmix`}目录，但是
                  {
                    error === 'ENOMODELS' ? '没有models目录' :
                    error === 'EMODELS' ? 'models不是目录' :
                    error === 'ENOUSERS' ? '没有users.json文件' :
                    error === 'EUSERSNOTFILE' ? 'users.json不是文件' :
                    error === 'EUSERSPARSE' ? 'users.json无法解析，不是合法的json格式' :
                    error === 'EUSERSFORMAT' ? 'users.json文件内部数据格式错误' : '未知的错误'
                  }
                </div>
              </Popover>
            </div>
          )       
        }

        return <div/>
      }
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

    this.volumeIconColor = volume => {

      if (this.state.creatingNewVolume)
        return this.colors.fillGreyFaded

      if (volume.isMissing) return redA200
      if (typeof volume.wisnuc !== 'object') return '#000'
      //debug("volume.wisnuc.status",volume.wisnuc.status)
      switch (volume.wisnuc.status) {
      case 'READY':
        return lightGreen400
      case 'NOTFOUND':
        return this.colors.fillGrey
      case 'AMBIGUOUS':
        return amber400
      case 'DAMAGED':
        return red400
      }
      
      return '#000'
    }

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
          fontSize: 13, 
          color: this.state.creatingNewVolume ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)'
        }}>
          {text}
        </div>
      )
    }

    this.DiskHeadline = props => {

      let disk = props.disk
      let text 

      if (disk.isPartitioned) {
        text = '分区使用的磁盘'
      }
      else if (disk.idFsUsage === 'filesystem') {
        text = '包含文件系统，无分区表'
      }
      else if (disk.idFsUsage === 'other') {
        text = '包含特殊文件系统，无分区表'
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
          fontSize: 13, 
          color: this.state.creatingNewVolume ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)'
        }}>
          {text}
        </div>
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
                backgroundColor='#BDBDBD'
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
            title={diskDisplayName(disk.name)} 
            onTouchTap={e => cnv && e.stopPropagation()}
          />
        </div>
      )
    }

    // props: 1) volume; 2) actions [[], []]
    this.VolumeMenu = class extends React.Component {

      constructor(props) {
        super(props)
        this.state = {
          open: false
        }

        this.handleRequestClose = () => this.setState({ open: false })
        //debug("this.VolumeMenu, this.props",this.props)
      }
      render() {
        let volume = this.props.volume
        return (
          <div>
            <IconButton
              onTouchTap={e => {
                e.stopPropagation()
                this.setState({ 
                  open: true,
                  anchorEl: e.currentTarget
                })
              }}
            >
              <NavigationMoreVert />
            </IconButton>
            <Popover
              open={this.state.open}
              anchorEl={this.state.anchorEl}
              anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
              targetOrigin={{horizontal: 'left', vertical: 'top'}}
              onRequestClose={this.handleRequestClose}
              animation={PopoverAnimationVertical}
            >
              <Menu>
                { this.props.actions.map(act => (
                    <MenuItem
                      style={{fontSize: 13}}
                      primaryText={act[0]}
                      disabled={act[2]}
                      onTouchTap={() => {
                        this.handleRequestClose()
                        act[1] && act[1](volume)
                      }}
                    />
                  )) }
               </Menu>
            </Popover>
          </div>
        )
      }
    }

    this.BtrfsVolume = props => {

      const primary1Color = this.props.muiTheme.palette.primary1Color
      const accent1Color = this.props.muiTheme.palette.accent1Color
   
      let volume = props.volume
      let boot = this.state.boot
      let { volumes, blocks } = this.state.storage
      let cnv = !!this.state.creatingNewVolume

      let expandableHeight = this.state.expanded.indexOf(volume) !== -1 ?
        17 * 24 + 3 * SUBTITLE_HEIGHT + SUBTITLE_MARGINTOP : 0
      //debug("BtrfsVolume props",props)
      //debug("BtrfsVolume volumes",volumes)
      const comment = () => volume.missing ? '有磁盘缺失' : '全部在线' //TODO if(volume.missing === true)
      const DivStyle = VolumeIsMissing => {
      //debug("VolumeIsMissing",VolumeIsMissing)
        if(VolumeIsMissing){
          return {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: ''
            //backgroundColor: red400
          }
        }
        else{
          return {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: ''
          }
        }
      }
      return (
        <Paper {...props}>
          <div style={DivStyle(volume.missing)}
          onTouchTap={() => this.toggleExpanded(volume)}>
            <div style={{flex: '0 0 800px', height: '100%', display: 'flex', alignItems: 'center'}}>
              <div style={{flex: '0 0 256px'}}>
                <this.VolumeTitle volume={volume} />
              </div>
              <this.VolumeHeadline volume={volume} />
              <div style={{flex: '0 0 16px'}} />
              <this.VolumeWisnucBadge volume={volume} />
            </div>

            <div style={{display: 'flex', alignItems: 'center'}}>

              { this.state.boot.state === 'maintenance' &&
                this.state.creatingNewVolume === null &&
                !volume.isMissing && typeof volume.wisnuc === 'object' &&
                volume.wisnuc.status === 'READY' &&
                <FlatButton 
                  label='启动' 
                  primary={true} 
                  onTouchTap={e => {
                    e.stopPropagation()
                    this.startWisnucOnVolume(volume)
                  }}/> }

              { this.state.boot.state === 'maintenance' &&
                this.state.creatingNewVolume === null &&
                <this.VolumeMenu volume={volume}
                  actions={
                    typeof volume.wisnuc === 'object' ?  [
                      [ volume.wisnuc.error === 'ENOWISNUC' ? '安装' : '重新安装',
                        () => this.initWisnucOnVolume(volume), 
                        volume.isMissing
                      ]
                    ] : [['修复问题',() => alert("功能开发中......")]] //TODO
                  }
                />
              }
            </div>
          </div>

          <VerticalExpandable height={expandableHeight}>

            <SubTitleRow text='磁盘阵列信息' disabled={cnv} />

            <div style={{width: '100%', display: 'flex'}}>
              <div style={{flex: '0 0 256px'}} />
              <KeyValueList 
                disabled={cnv}
                items={[
                  ['磁盘数量', (volume.total >= 2) ? `${volume.total}（${comment()}）` : `${volume.total}`],
                  ['文件系统UUID', volume.uuid.toUpperCase()],
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
                    [diskDisplayName(blk.name), 184],
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
      
        //debug('partitioned disk floatingTitleTop', cnv, inner, outer)

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
                    [partitionDisplayName(blk.name), 184],
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
            colorLeft={this.diskUnformattable(disk).length > 0 ? null : cnv ? 256 : '100%'} 
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

            <div style={{height: 24, lineHeight: '24px', marginLeft: 256, fontSize: 14}}>
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
    this.reloadBootStorage()    
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
  
  renderBootStatus() {
    var data = window.store.getState().maintenance.device;
    var TextMaintence = '该设备已正常启动，此界面仅用于浏览；设备的ip为 ' + data.address + '，model为 ' + data.model + '，serial为 '+ data.serial + '。';
    //debug("data = window.store.getState().maintenance = ", data);
    return (
      <this.TextButtonTop 
        text={this.state.boot.state !== 'maintenance' ? TextMaintence : '' }
        disabled={this.state.boot.state !== 'maintenance'}
      /> 
    )
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
          <div>
            WISNUC - {
              !this.state.boot ? '' :
              this.state.boot.state === 'maintenance' ? '维护模式' : '已正常启动'
            }
          </div>
        </div>
      </div>
    )
  }

  render() {

    //debug('main render', this.state)
    
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

        <this.OperationDialog />

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
              { cnv ?  <this.NewVolumeTop /> : this.renderBootStatus()}
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

        <Operation substate={this.state.dialog} />

        <InitVolumeDialogs 
          volume={this.state.initVolume}
          onRequestClose={() => this.setState({ initVolume: undefined })}
          onResponse={() => this.reloadBootStorage()}
        />

      </div>
    )
  }
}

export default Maintenance

