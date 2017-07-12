import React from 'react'
import Debug from 'debug'
import { Avatar, CircularProgress, Divider } from 'material-ui'
import { teal500, pinkA200 } from 'material-ui/styles/colors'
import DoneIcon from 'material-ui/svg-icons/action/done'
import ClearIcon from 'material-ui/svg-icons/content/clear'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:Login:maintenance')
const duration = 300
const primaryColor = teal500
const accentColor = pinkA200

class Maintenance extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      test: null,
      action: false
    }

    this.getStatus = (volume, boot) => {
      const mounted = volume.isMounted
      const noMissing = !volume.missing
      const lastSystem = boot.last === volume.uuid
      const fruitmixOK = typeof volume.users === 'object' || volume.users === 'EDATA'
      const usersOK = typeof volume.users !== 'string'

      const check = [mounted, noMissing, lastSystem, fruitmixOK, usersOK]
      debug('this.getStatus', check)
      return check
    }

    this.testVolume = (volume) => {
      this.setState({ test: volume })
    }

    this.backToVolumeCard = () => {
      this.setState({ test: null })
    }

    this.action = () => {
      this.setState({ test: null, action: true })
    }
  }

  componentDidMount() {
  }

  renderList(text, check) {
    return (
      <div style={{ height: 56, display: 'flex', alignItems: 'center' }} key={text}>
        <div style={{ width: 220 }}> { text } </div>
        { check ? <DoneIcon color={primaryColor} /> : <ClearIcon color={accentColor} /> }
        <div style={{ width: 40 }} />
      </div>
    )
  }

  renderTest(volume) {
    const { device, enterMaint } = this.props
    const test = [
      '是否挂载',
      '磁盘阵列是否完整',
      '是否是上次启动的文件系统',
      '是否存在Wisnuc系统',
      '用户信息是否完整'
    ]

    const check = this.getStatus(volume, this.props.device.boot.data)

    return (
      <div>
        <div style={{ marginLeft: 24 }}>
          { `磁盘阵列 ${volume.uuid}` }
          { test.map((text, index) => this.renderList(text, check[index])) }
        </div>
      </div>
    )
  }

  renderVolumeCard(volume) {
    const { uuid } = volume
    return (
      <div style={{ height: 72, display: 'flex', alignItems: 'center', fontWeight: 500 }}>
        { `磁盘阵列 ${uuid}` }
        <FlatButton label="检测" onTouchTap={() => this.testVolume(volume)} primary />
      </div>
    )
  }

  renderButton() {
    let allCheck = false
    if (this.state.test) {
      const check = this.getStatus(this.state.test, this.props.device.boot.data)
      check.forEach((item) => { if (!item) allCheck = false })
    }

    return (
      <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {
          this.state.test &&
          <FlatButton
            label={allCheck ? '查看' : '修复'}
            onTouchTap={this.action}
            primary
          />
        }
        <FlatButton
          label="返回"
          onTouchTap={this.state.test ? this.backToVolumeCard : this.props.toggleMaint}
          primary
        />
      </div>
    )
  }

  renderActions() {
    const diskLabels = [
      '删减磁盘',
      '更换磁盘',
      '升级为Raid1模式',
      'Raid1恢复'
    ]

    const wisnucLabels = [
      '重新安装WISNUC系统',
      '用户信息备份与恢复',
      '导出数据',
      '找回数据'
    ]

    const action = (label, func) => (
      <div style={{ height: 56 }}>
        <FlatButton
          label={label}
          onTouchTap={func}
          primary
        />
      </div>
      )

    const funcs = []
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ marginLeft: 24 }}>
          <div style={{ height: 16 }} />
          { '磁盘管理' }
          { diskLabels.map((label, index) => action(label, funcs[index])) }
        </div>
        <div style={{ marginLeft: 24 }}>
          <div style={{ height: 16 }} />
          { 'WISNUC系统管理' }
          { wisnucLabels.map((label, index) => action(label, funcs[index])) }
        </div>
      </div>
    )
  }

  render() {
    debug('render!', this.props)
    const { device, toggleMaint, enterMaint } = this.props
    if (!device) return (<div />)

    const boot = device.boot.data
    const storage = device.storage.data

    const volumes = device.storage.data.volumes

    return (
      <div style={{ width: 380, height: 468, backgroundColor: '#FAFAFA', color: 'rgba(0,0,0,0.87)' }}>
        {/* head */}
        <div style={{ height: 72, display: 'flex', alignItems: 'center', fontWeight: 500, marginLeft: 24 }}>
          { '维护模式-自动检测' }
        </div>

        {/* content */}
        <div style={{ height: 344 }}>
          {
            this.state.test
            ? this.renderTest(this.state.test)
            : this.state.action
            ? this.renderActions()
            : volumes.map(volume => this.renderVolumeCard(volume))
          }
        </div>

        {/* button */}
        { this.renderButton() }
      </div>
    )
  }
}

export default Maintenance
