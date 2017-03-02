import React from 'react'
import { Checkbox, CircularProgress, Dialog, TextField } from 'material-ui'
import FlatButton from './FlatButton'
import ToggleRadioButtonChecked from 'material-ui/svg-icons/toggle/radio-button-checked'
import ToggleRadioButtonUnchecked from 'material-ui/svg-icons/toggle/radio-button-unchecked'

import Debug from 'debug'

const debug = Debug('component:operation')

export const Operation = props => {

  let state = props.substate

  return (
    <Dialog
      contentStyle={{ width: (state && state.getWidth) || 800 }}
      title={state && state.getTitle()}
      open={state !== undefined}
      modal={true}
      actions={ state && 
        state.getActions().map(action => 
          <FlatButton 
            label={action.label}
            onTouchTap={action.onTouchTap}
            disabled={typeof action.disabled === 'function' ? action.disabled() : action.disabled}
          /> ) 
      }
    >
      { state && state.render() }
    </Dialog>
  )
}

export class operationBase {

  constructor(obj) {

    debug('base constructor', obj)

    this._context = obj._context
    this._propName = obj._propName 

    this.close = () => this.setState()

    if (obj.width) this.width = width
  }

  setState(Next, ...args) {

    this.exit()

    let obj = {}
    obj[this._propName] = Next ? new Next(this, ...args) : undefined

    debug('set context state', this._context, obj)
    this._context.setState(state => obj)
  }

  // short circuit exit/entry
  update(props) {

    let clone = new this.constructor(this)
    Object.assign(clone, props)

    let obj = {}
    obj[this._propName] = clone

    this._context.setState(state => obj)
  }

  exit() {
    debug('base exit')
  }

  getTitle() {
    debug('base get title')
    return '无标题'
  }

  getWidth() {
    debug('base get width')
    return 560
  }

  getActions() {
    debug('base get actions')
    return []
  }

  render() {
    debug('base render')
    return <div style={{backgroundColor: 'yellow'}}>This is base render</div>
  }
}

export class operationBusy extends operationBase {

  constructor(obj) {
    super(obj)
  }

  getTitle() {
    return '执行操作'
  }

  render() {
    return (
      <div style={{
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        <CircularProgress />
      </div> 
    )
  }
}

export class operationText extends operationBase {

  constructor(obj, title, text) {
    super(obj)
    this.title = title
    this.text = text
  }

  getTitle() {
    return this.title
  } 

  getActions() {
    return this.actions || []
  }

  render() {

    let style= { width: '100%' }
    if (this.height) style.height = height

    return (
      <div style={style}>
        { this.text.map((line, index, array) => {
          return (
          <div style={{ 
            fontSize: 15, lineHeight: '24px', 
            marginBottom: index === array.length - 1 ? 0 : 20
          }}>{ line }</div>)
        })}
      </div>     
    ) 
  }
}

export class operationFinish extends operationText {

  constructor(obj, title, text) {
    super(obj, title, text)
    this.actions = [{ label: '晓得了', onTouchTap: this.close }]
  }
}

export class operationSuccess extends operationFinish {

  constructor(obj, text) {
    super(obj, '操作成功', text) 
  }
}

export class operationFailed extends operationFinish {

  constructor(obj, text) {
    super(obj, '操作失败', text) 
  }
}

export class operationTextConfirm extends operationText {

  constructor(obj, text, onTouchTap) {
    super(obj, '确认操作', text)
    this.actions = [{ label: '取消', onTouchTap: this.close }, { label: '确认', onTouchTap }]
  }
}

export class operationUsernamePassword extends operationBase {

  constructor(obj, next) {
    super(obj)

    if (obj instanceof operationUsernamePassword) {
      Object.assign(this, obj)  
      return
    }

    this.next = next

    this.username = ''
    this.password = ''
    this.passwordAgain = ''
  }

  getTitle() {
    return '输入用户名和密码'
  }

  getActions() {
    return [
      { label: '取消', onTouchTap: this.close}, 
      { label: '确认', onTouchTap: () => this.next(this.username, this.password), }
    ]
  }

  render() {

    const onChange = (name, value) => {
      this[name] = value
      this.setState(operationUsernamePassword)
    }

    return (
      <div>
        <TextField hintText='用户名' floatingLabelText='用户名' maxLength={20} 
          onChange={e => onChange('username', e.target.value)} />
        <TextField hintText='输入密码' floatingLabelText='输入密码' type='password' maxLength={40}
          onChange={e => onChange('password', e.target.value)} />
        <TextField hintText='再次输入密码' floatingLabelText='再次输入密码' type='password' maxLength={40}
          onChange={e => onChange('passwordAgain', e.target.value)} />
      </div>
    )
  }
}

/**
                                                                  remove wisnuc     remove fruitmix
      USER > 0                                                          
      USER = 0
      ENOWISNUC             // wisnuc folder does not exist       x                 x
      EWISNUCNOTDIR         // wisnuc folder is not a dir                           x
      ENOFRUITMIX (nonroot) // fruitmix folder does not exist                       x
      EFRUITMIXNOTDIR       // fruitmix folder is not a dir
      ENOMODELS             // models folder does not exist
      EMODELSNOTDIR         // models folder is not a dir
      ENOUSERS              // users.json file does not exist
      EUSERSNOTFILE         // users.json is not a file
      EUSERSPARSE           // users.json parse fail
      EUSERSFORMAT          // users.json is not well formatted
**/

// this dialog content has copy constructor
export class operationReinitConfirmDeletion extends operationBase {
  
  constructor(obj, volume, next) {

    super(obj)
    if (obj instanceof operationReinitConfirmDeletion) {
      Object.assign(this, obj)
      return
    } 

    this.volume = volume
    this.next = next

    this.remove = undefined

    let wisnuc = volume.wisnuc

    this.warning
    this.text = []

    if (wisnuc.status === 'READY' || 'DAMAGED') {
      this.warning = '文件系统已经包含wisnuc应用的用户数据，请仔细阅读下述信息，避免数据丢失。'
    }
    else if (wisnuc.status === 'AMBIGUOUS') {
      this.warning = '文件系统可能包含wisnuc应用的用户数据，请仔细阅读下述信息，避免数据丢失。'
    }
    else if (wisnuc.error === 'EWISNUCNOTDIR' || wisnuc.error === 'EFRUITMIXNOTDIR') {
      this.warning = '文件系统存在文件与wisnuc应用数据的目录结构冲突，请仔细阅读下述信息，避免数据丢失。'
    }
    else if (wisnuc.error === 'EWISNUCNOFRUITMIX' && volume.mountpoint !== '/') { // for rootfs this is normal case
      this.warning = '文件系统不包含wisnuc应用的用户数据，但存在wisnuc文件夹，请仔细阅读下述信息，避免数据丢失。'
    }

    this.general = 'wisnuc应用在文件系统根目录上建立名为wisnuc的文件夹存放数据；其中fruitmix子文件夹存放用户的私有云应用数据，包括用户通过手机、客户端以及Windows文件共享(Samba)等方式传输的文件和照片；wisnuc目录下的其他文件夹可能用于存放appifi/docker第三方应用的镜像文件、私有数据（例如Transmission的下载文件，ownCloud的私有云文件）；对于ws215i用户，如果系统从2016年1月的版本升级至最新版本，且没有做过数据迁移，则老版本系统的用户数据也存放在wisnuc目录下的其他目录内。'

    this.removeWisnuc = '选择该选项会删除所有上述存放于wisnuc目录下的数据。'
    this.removeFruitmix = '选择该选项会保留原wisnuc目录下的其他目录数据，包括appifi/docker应用镜像，appifi/docker第三方应用数据，老版本软件尚未迁移的用户数据；但删除所有位于fruitmix目录下的wisnuc私有云应用数据，包括所有用户信息、云盘配置信息、用户上传的所有文件和照片。'
    this.keepBoth = '选择该选项不会删除任何数据，但会在该目录下重建新的用户和云盘配置；该操作之后旧的用户上传的文件和照片在新系统中无法直接使用，用户只能手动迁移；旧系统中创建的文件、照片和相册分享无法恢复。'

    if (wisnuc.error === 'EWISNUCNOTDIR')
      this.mustDelete = '必须选择删除和重建wisnuc文件夹方可执行操作'
    else if (wisnuc.error === 'EFRUITMIXNOTDIR')
      this.mustDelete = '必须选择删除和重建fruitmix文件夹方可执行操作'

  } 

  onCheck(option) {
    if (this.remove !== option) {
      this.update({ remove: option }) 
    }
  }

  getTitle() {
    return '确认操作'
  } 

  getActions() {
    return [
      { label: '取消', onTouchTap: this.close },
      { label: '下一步', onTouchTap: () => {
        console.log('====')
        console.log(this)
        console.log('====')
        this.next(this.remove) 
      }},
    ]
  }

  render() {

    return (<div>
      { this.warning && <div>{this.warning}</div> }              
      <div>{this.general}</div>
      <Checkbox 
        checked={this.remove === 'wisnuc'}
        checkedIcon={<ToggleRadioButtonChecked />}
        uncheckedIcon={<ToggleRadioButtonUnchecked />}
        label='删除并重建wisnuc目录' 
        onCheck={this.onCheck.bind(this, 'wisnuc')}

        disableTouchRipple={true}
        disableFocusRipple={true}
      />
      <div>{this.removeWisnuc}</div>
      <Checkbox 
        checked={this.remove === 'fruitmix'}
        checkedIcon={<ToggleRadioButtonChecked />}
        uncheckedIcon={<ToggleRadioButtonUnchecked />}
        label='保留wisnuc目录，删除和重建fruitmix目录' 
        onCheck={this.onCheck.bind(this, 'fruitmix')}

        disableTouchRipple={true}
        disableFocusRipple={true}
      />
      <div>{this.removeWisnuc}</div>
      <Checkbox 
        checked={this.remove === undefined}
        checkedIcon={<ToggleRadioButtonChecked />}
        uncheckedIcon={<ToggleRadioButtonUnchecked />}
        label='保留wisnuc和fruitmix目录，重建用户和云盘信息'
        onCheck={this.onCheck.bind(this, undefined)} 

        disableTouchRipple={true}
        disableFocusRipple={true}
      />
      <div>{this.keepBoth}</div>
    </div>)
  }
}

export const createOperation = (context, name, operation, ...args) => 
  new operationBase({ _context: context, _propName: name }).setState(operation, ...args)
 
