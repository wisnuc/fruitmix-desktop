import React from 'react'
import Debug from 'debug'
import { Avatar, CircularProgress, Divider, IconButton } from 'material-ui'
import NavigationChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import { teal500, pinkA200 } from 'material-ui/styles/colors'
import DoneIcon from 'material-ui/svg-icons/action/done'
import ClearIcon from 'material-ui/svg-icons/content/clear'
import RaidIcon from 'material-ui/svg-icons/device/storage'
import FlatButton from '../common/FlatButton'
import BtrfsVolume from './BtrfsVolume'
import InitWizard from './InitWizard'

const debug = Debug('component:Login:maintenance')
const duration = 300
const primaryColor = teal500
const accentColor = pinkA200

class MaintGuide extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      test: null,
      index: 0,
      action: false,
      detail: false,
      expand: false
    }

    this.getStatus = (volume, boot) => {
      const mounted = volume.isMounted
      const noMissing = !volume.missing
      const lastSystem = boot.last === volume.uuid
      const fruitmixOK = typeof volume.users === 'object' || volume.users === 'EDATA'
      const usersOK = typeof volume.users !== 'string'

      const check = [mounted, noMissing, lastSystem, fruitmixOK, usersOK]
      // debug('this.getStatus', check)
      return check
    }

    this.backToVolumeCard = () => {
      this.setState({ expand: false }, () => {
        this.props.toggleExpanded(true)
        setTimeout(() => this.setState({ detail: false }), 600)
      })
    }

    this.toggleAction = () => {
      this.setState({ action: !this.state.action })
    }

    this.changeIndex = (change) => {
      const length = this.props.device.storage.data.volumes.length
      const index = this.state.index + change
      if (index < 0 || index > length - 1) return
      this.setState({ index })
    }


    /* Disk Funcs */
    this.recoverRaid1 = () => {}

    this.addDisk = () => {}

    this.deleteDisk = () => {}

    this.replaceDisk = () => {}

    /* Wisnuc Funcs */
    this.backup = () => {}

    this.reinstall = () => {
      this.setState({ action: false, detail: true }, () => {
        this.props.toggleExpanded()
        setTimeout(() => this.setState({ expand: true }), 600)
      })
    }

    this.exportData = () => {}

    this.recoverData = () => {}

    this.forceBoot = () => {
      const current = this.props.device.storage.data.volumes[this.state.index].uuid
      this.props.device.request('forceBoot', { current }, (error) => {
        if (error) {
          debug('forceBoot error', error)
        } else {
          this.props.refresh()
          debug('forceBoot success !')
        }
      })
    }
  }

  componentDidMount() {
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

    let allCheck = true
    const check = this.getStatus(volume, this.props.device.boot.data)
    check.forEach((item) => { if (!item) allCheck = false })

    return (
      <div style={{ marginLeft: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 500, height: 56, display: 'flex', alignItems: 'center' }}>
          { '自动检测' }
          <div style={{ flexGrow: 1 }} />
          { allCheck && <FlatButton label="启动" onTouchTap={this.forceBoot} style={{ marginRight: 24 }} primary /> }
        </div>
        {
          test.map((text, index) => (
            <div style={{ height: 56, display: 'flex', alignItems: 'center', fontSize: 14, marginLeft: 12 }} key={text}>
              { check[index] ? <DoneIcon color={primaryColor} /> : <ClearIcon color={accentColor} /> }
              <div style={{ width: 28 }} />
              <div style={{ width: 220 }}> { text } </div>
              {/* !check[index] && '提示' */}
            </div>
          ))
        }
      </div>
    )
  }

  renderButton() {
    return (
      <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <FlatButton
          label="返回"
          onTouchTap={this.state.action ? this.toggleAction : this.props.toggleMaint}
          primary
        />
        {
          !this.state.action &&
          <FlatButton
            label="进入维护模式"
            onTouchTap={this.toggleAction}
            primary
          />
        }
      </div>
    )
  }

  renderActions() {
    const diskLabels = ['Raid1恢复', '增加磁盘', '删减磁盘', '更换磁盘']
    const diskFuncs = [this.recoverRaid1, this.addDisk, this.deleteDisk, this.replaceDisk]
    const diskDisable = [true, true, true, true]

    const wisnucLabels = ['用户信息备份与恢复', '重新安装WISNUC', '导出磁盘数据', '找回数据', '强制启动']
    const wisnucFuncs = [this.backup, this.reinstall, this.exportData, this.recoverData, this.forceBoot]
    const wisnucDisable = [true, false, true, true, false]

    const action = (label, func, disabled) => (
      <div style={{ height: 56, display: 'flex', alignItems: 'center' }} key={label}>
        <FlatButton
          label={label}
          onTouchTap={func}
          style={{ marginLeft: -8 }}
          disabled={disabled}
          primary
        />
      </div>
    )

    return (
      <div style={{ display: 'flex' }}>
        <div style={{ marginLeft: 24 }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center' }}>
            { '磁盘与卷管理' }
          </div>
          { diskLabels.map((label, index) => action(label, diskFuncs[index], diskDisable[index])) }
        </div>
        <div style={{ marginLeft: 96 }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center' }}>
            { 'WISNUC系统管理' }
          </div>
          { wisnucLabels.map((label, index) => action(label, wisnucFuncs[index], wisnucDisable[index])) }
        </div>
      </div>
    )
  }

  renderDetail() {
    if (!this.state.expand) return (<div />)
    const device = this.props.device
    const blocks = this.props.device.storage.data.blocks
    const volume = this.props.device.storage.data.volumes[this.state.index]
    return (
      <InitWizard
        device={device}
        showContent
        onCancel={this.backToVolumeCard}
        onFail={this.backToVolumeCard}
        onOK={this.props.OKAndLogin}
        title="重新安装向导"
      />
    )
  }

  render() {
    debug('render!', this.props, this.state)
    const { device, toggleMaint, enterMaint } = this.props
    if (!device) return (<div />)

    const boot = device.boot.data
    const storage = device.storage.data

    const volumes = device.storage.data.volumes
    const length = volumes.length
    const volume = volumes[this.state.index]
    debug('volume!!!!!!!!', volume)

    return (
      <div
        style={{
          width: this.state.detail ? '100%' : 380,
          height: this.state.detail ? '100%' : 468,
          backgroundColor: '#FAFAFA'
        }}
      >
        {/* head */}
        {
          !this.state.detail &&
            <div style={{ height: 72, display: 'flex', alignItems: 'center', fontWeight: 500, marginLeft: 24 }}>
              <RaidIcon style={{ height: 48, width: 48 }} color={primaryColor} />
              <div style={{ marginLeft: 16, marginTop: -2 }}>
                <div>
                  {`磁盘阵列 ${this.state.index + 1}`}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.54)' }}>
                  {`Brtfs | ${volume && volume.usage && volume.usage.data && volume.usage.data.mode}`}
                </div>
              </div>
            </div>
        }

        {/* content */}
        {
          this.state.detail
            ? this.renderDetail()
            : <div>
              <div style={{ height: 344 }}>
                {
                  this.state.action
                  ? this.renderActions()
                  : this.renderTest(volume, this.state.index)
                }
              </div>

              {/* action button */}
              { this.renderButton() }

              {/* change card button */}
              {
                this.state.index > 0 &&
                  <div style={{ position: 'absolute', right: 72, top: 88 }}>
                    <IconButton
                      iconStyle={{ width: 24, height: 24 }}
                      style={{ width: 40, height: 40, padding: 8 }}
                      onTouchTap={() => this.changeIndex(-1)}
                    >
                      <NavigationChevronLeft />
                    </IconButton>
                  </div>
              }
              {
                this.state.index < length - 1 &&
                  <div style={{ position: 'absolute', right: 24, top: 88 }}>
                    <IconButton
                      iconStyle={{ width: 24, height: 24 }}
                      style={{ width: 40, height: 40, padding: 8 }}
                      onTouchTap={() => this.changeIndex(1)}
                    >
                      <NavigationChevronRight />
                    </IconButton>
                  </div>
              }
            </div>
        }
      </div>
    )
  }
}

export default MaintGuide
