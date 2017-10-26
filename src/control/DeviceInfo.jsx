import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { TextField, Divider, IconButton, CircularProgress } from 'material-ui'
import TV from 'material-ui/svg-icons/hardware/tv'
import CPU from 'material-ui/svg-icons/hardware/memory'
import ActionDns from 'material-ui/svg-icons/action/dns'
import DoneIcon from 'material-ui/svg-icons/action/done'
import Memory from 'material-ui/svg-icons/device/sd-storage'
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import StorageIcon from 'material-ui/svg-icons/device/storage'

import { RAIDIcon } from '../maintenance/Svg'

const debug = Debug('component:control:deviceinfo')

const phaseData = value => prettysize(parseInt(value, 10) * 1024)

class DeviceInfo extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      titleHover: false
    }

    this.updateLabel = (value) => {
      this.setState({ label: value, errorText: '', changed: true })
    }

    this.changeDeviceName = () => {
      this.setState({ progress: true }, () => {
        this.props.selectedDevice.request('renameStation', { name: this.state.label }, (err) => {
          if (err) this.props.openSnackBar('修改失败')
          else {
            this.props.selectedDevice.request('info', null, (e) => {
              if (e) this.props.openSnackBar('修改失败')
              else this.props.openSnackBar('修改成功')
              this.setState({ modify: false, progress: false, label: '' })
            })
          }
        })
      })
    }

    this.onKeyDown = (e) => {
      if (e.which === 13 && !this.state.errorText && this.state.label && this.state.label.length) this.changeDeviceName()
    }
  }

  renderList(Icon, titles, values) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: 420 }}>
        {
          titles.map((title, index) => (
            <div style={{ height: 72, display: 'flex', alignItems: 'center', width: '100%' }} key={title}>
              <div style={{ flex: '0 0 24px' }} />
              <div style={{ flex: '0 0 56px', marginTop: -16 }} >
                { !index && <Icon color={this.props.primaryColor} /> }
              </div>
              <div>
                <div style={{ fontSize: 16, color: 'rgba(0, 0, 0, 0.87)' }}> { values[index] }</div>
                <div style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.54)' }}> { title } </div>
              </div>
            </div>
          ))
        }
      </div>
    )
  }

  renderDivider() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', marginLeft: 80 }}>
        <div style={{ height: 8 }} />
        <hr style={{ marginRight: 80, backgroundColor: 'rgb(224, 224, 224)', border: 0, height: 1, width: 'calc(100% - 72px)' }} />
        <div style={{ height: 8 }} />
      </div>
    )
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.info && this.props.info && (nextProps.info.name !== this.props.info.name)) {
      this.currentLabel = nextProps.info.name
      this.setState({
        label: nextProps.info.name,
        modify: false,
        changed: false
      })
    }
  }

  render() {
    if (!this.props.device || !this.props.storage || !this.props.boot || !this.props.info) return <div />
      // debug('this.props.device true render', this.props)

    const { cpuInfo, memInfo, ws215i } = this.props.device
    const volume = this.props.storage.volumes.find(v => v.fileSystemUUID === this.props.boot.current)

    /* File System */
    const fsIcon = RAIDIcon
    const fsTitles = [
      '文件系统类型',
      '使用磁盘数量',
      '磁盘阵列模式'
    ]
    const fsValues = [
      'Brtfs',
      volume.total,
      volume.usage.data.mode.toUpperCase()
    ]

    /* storage */
    const storageIcon = StorageIcon
    const storageTitles = [
      '总容量',
      '用户数据空间',
      '可用空间'
    ]

    const storageValues = [
      prettysize(volume.usage.overall.deviceSize),
      prettysize(volume.usage.data.size),
      prettysize(volume.usage.overall.free)
    ]


    /* CPU */
    const cpuIcon = CPU

    const cpuTitles = [
      'CPU核心数',
      'CPU类型',
      'Cache'
    ]

    const cpuValues = [
      cpuInfo.length,
      cpuInfo[0].modelName,
      phaseData(cpuInfo[0].cacheSize)
    ]

    /* Memory */
    const memTitles = [
      '总内存',
      '未使用内存',
      '可用内存'
    ]

    const menIcon = Memory

    const memValues = [
      phaseData(memInfo.memTotal),
      phaseData(memInfo.memFree),
      phaseData(memInfo.memAvailable)
    ]

    /* WISNUC */
    let ws215iTitles
    let ws215iValues
    let ws215iIcon

    if (ws215i) {
      ws215iIcon = ActionDns

      ws215iTitles = [
        '型号',
        '硬件序列号',
        'MAC地址'
      ]

      ws215iValues = [
        'WS215i',
        ws215i.serial,
        ws215i.mac.toUpperCase()
      ]
    }

    return (
      <div
        style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}
        onTouchTap={() => this.setState({ modify: false, label: '' })}
      >
        <div style={{ height: 16 }} />
        <div style={{ height: 72, display: 'flex', alignItems: 'center', width: '100%' }} >
          <div style={{ flex: '0 0 24px' }} />
          <div style={{ flex: '0 0 56px' }} >
            <TV color={this.props.primaryColor} />
          </div>

          {/* device name */}
          <div>
            <div
              style={{ height: 48, fontSize: 16, color: 'rgba(0, 0, 0, 0.87)' }}
              onMouseOver={() => this.setState({ titleHover: true })}
              onMouseOut={() => this.setState({ titleHover: false })}
              onTouchTap={e => e.stopPropagation()}
            >
              <div style={{ height: 16 }} />
              {
                this.state.modify ?
                  <div style={{ marginTop: -8, display: 'flex' }}>
                    {/* FIXME */}
                    <TextField
                      name="deviceName"
                      onChange={e => this.updateLabel(e.target.value)}
                      maxLength={12}
                      value={this.state.modify ? this.state.label : this.props.info.name}
                      errorText={this.state.errorText}
                      ref={(input) => { if (input && this.state.modify) { input.focus() } }}
                      onKeyDown={this.onKeyDown}
                    />
                    {
                      this.state.progress ?
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}>
                          <CircularProgress size={16} thickness={2} />
                        </div>
                        :
                        <IconButton
                          onTouchTap={() => this.state.changed && this.changeDeviceName()}
                          disabled={!!this.state.errorText || !this.state.label || !this.state.label.length}
                        >
                          <DoneIcon color={this.props.primaryColor} />
                        </IconButton>
                    }
                  </div> :
                  <div
                    style={{ display: 'flex', alignItems: 'center', height: 32 }}
                    onTouchTap={() => this.setState({ modify: true })}
                  >
                    { this.state.label ? this.state.label : this.props.info.name }
                    <ModeEdit color={this.props.primaryColor} style={{ marginLeft: 24 }} />
                  </div>
              }
              {
                <Divider
                  color="rgba(0, 0, 0, 0.87)"
                  style={{ opacity: !this.state.modify && this.state.titleHover ? 1 : 0 }}
                />
              }
            </div>
            <div style={{ fontSize: 14, flex: '0 0 240px', color: 'rgba(0, 0, 0, 0.54)' }}> { '设备名称' } </div>
          </div>
        </div>
        <div style={{ height: 16 }} />
        <this.renderDivider />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { ws215i && this.renderList(ws215iIcon, ws215iTitles, ws215iValues) }
          { this.renderList(menIcon, memTitles, memValues) }
          { this.renderList(cpuIcon, cpuTitles, cpuValues) }
        </div>
        <this.renderDivider />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { this.renderList(fsIcon, fsTitles, fsValues) }
          { this.renderList(storageIcon, storageTitles, storageValues) }
        </div>
      </div>
    )
  }
}

export default DeviceInfo
