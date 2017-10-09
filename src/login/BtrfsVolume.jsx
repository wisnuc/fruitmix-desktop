import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { Avatar, CircularProgress, Divider } from 'material-ui'

import CreatingVolumeDiskSelection from './CreatingVolumeDiskSelection'

import Users from '../maintenance/Users'
import InitVolumeDialogs from '../maintenance/InitVolumeDialogs'
import FlatButton from '../common/FlatButton'
import { HDDIcon, RAIDIcon, UpIcon, DownIcon } from '../common/Svg'
import { SUBTITLE_HEIGHT, SUBTITLE_MARGINTOP, SubTitleRow, VerticalExpandable, KeyValueList } from '../maintenance/ConstElement'
import DialogOverlay from '../common/DialogOverlay'

const debug = Debug('component:maintenance:BtrfsVolume')

class BtrfsVolume extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false
    }

    this.toggleExpanded = () => {
      this.setState({ expanded: !this.state.expanded })
    }

    this.install = () => {
      debug('install!!!')
    }

    this.end = () => {
      debug('end!!!')
    }
  }

  finishedInfo() {
    const { run } = this.props.device
    debug('this.props.device', this.props.device)
    if (!run || run.isPending()) {
      return ['busy', '启动应用']
    } else if (run.isRejected()) {
      return ['error', '启动应用失败']
    }
    return ['success', '成功']
  }

  renderFinished() {
    const info = this.finishedInfo()
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
        <div style={{ flex: '0 0 48px' }}>
          { info[0] === 'busy' && <CircularProgress /> }
        </div>
        <div
          style={{ flex: '0 0 64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: 'rgba(0,0,0,0.54)' }}
        >
          { info[1] }
        </div>
        <div style={{ flex: '0 0 48px' }}>
          { info[0] === 'success'
            ? <FlatButton label="进入登陆页面" onTouchTap={this.end} />
            : <FlatButton label="退出" onTouchTap={this.end} /> }
        </div>
      </div>
    )
  }

  renderDiskRow(device, blocks, index) {
    const blk = blocks.find(b => b.name === device.name)

    const model = blk.model ? blk.model : '未知型号'
    const name = blk.name
    const iface = blk.isATA ? 'ATA' :
      blk.isSCSI ? 'SCSI' :
        blk.isUSB ? 'USB' : '未知'

    const size = prettysize(blk.size * 512)
    const usage = device.used

    const serial = blk.serial
    const comment = `该磁盘在磁盘阵列${index + 1}中`

    return (
      <div key={name} style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: '0 0 66px' }} />
        <div style={{ flex: '0 0 160px' }}>{model}</div>
        <div style={{ flex: '0 0 80px' }}>{name}</div>
        <div style={{ flex: '0 0 80px' }}>{iface}</div>
        <div style={{ flex: '0 0 240px' }}>{serial}</div>
        <div style={{ flex: '0 0 80px' }}>{size}</div>
        <div style={{ flex: '0 0 80px' }}>{usage}</div>
        <div style={{ flex: '0 0 240px' }}>{comment}</div>
      </div>
    )
  }

  render() {
    debug('BtrfsVolume render!', this.props)
    const { volume, blocks, index } = this.props
    const cnv = false
    const expandableHeight = this.state.expanded ?
      17 * 23 + 3 * SUBTITLE_HEIGHT + SUBTITLE_MARGINTOP * 2 + 0.5 : 0
    const comment = volume.missing ? '有磁盘缺失' : '全部在线' // TODO if(volume.missing === true)
    return (
      <div>
        <VerticalExpandable height={expandableHeight}>
          <div style={{ width: '100%', height: 0.5 }} />
          <SubTitleRow text="磁盘阵列信息" disabled={cnv} />

          <div style={{ width: '100%', display: 'flex' }}>
            <div style={{ flex: '0 0 256px' }} />
            <KeyValueList
              disabled={cnv}
              items={[
                ['磁盘数量', (volume.total >= 2) ? `${volume.total}（${comment}）` : `${volume.total}`],
                ['文件系统UUID', volume.uuid.toUpperCase()],
                ['访问路径', volume.mountpoint]
              ]}
            />
          </div>
          <div style={{ width: '100%', height: SUBTITLE_MARGINTOP }} />
          <SubTitleRow text="数据使用" disabled={cnv} />

          <div style={{ width: '100%', display: 'flex' }}>
            <div style={{ flex: '0 0 256px' }} />
            <KeyValueList
              style={{ width: 336 }}
              disabled={cnv}
              right
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
                ['系统数据空间（已使用）', prettysize(volume.usage.system.used)]
              ]}
            />
            <div style={{ flex: '0 0 56px' }} />
            <KeyValueList
              style={{ width: 336 }}
              disabled={cnv}
              right
              items={[
                ['用户数据', volume.usage.data.mode],
                ['元数据', volume.usage.metadata.mode],
                ['系统数据', volume.usage.system.mode]
              ]}
            />
          </div>
          <div style={{ width: '100%', height: SUBTITLE_MARGINTOP }} />
          <SubTitleRow text="磁盘信息" disabled={cnv} />
        </VerticalExpandable>

        <div style={{ marginLeft: 24, width: 1000, fontSize: 13 }}>
          <Divider />
          <div style={{ width: '100%', height: 32, display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: '0 0 66px' }} />
            <div style={{ flex: '0 0 160px' }}>型号</div>
            <div style={{ flex: '0 0 80px' }}>设备名</div>
            <div style={{ flex: '0 0 80px' }}>接口</div>
            <div style={{ flex: '0 0 240px' }}>序列号</div>
            <div style={{ flex: '0 0 80px' }}>容量</div>
            <div style={{ flex: '0 0 80px' }}>已使用</div>
            <div style={{ flex: '0 0 240px' }}>说明</div>
          </div>
          <Divider />
          { volume.devices.map(device => this.renderDiskRow(device, blocks, index)) }
          <Divider />
        </div>

        <div style={{ height: 72, display: 'flex', alignItems: 'center', marginLeft: 24 }}>
          <FlatButton
            label="磁盘阵列及数据使用信息"
            onTouchTap={this.toggleExpanded}
            primary
          />
        </div>
        <div style={{ height: 72, display: 'flex', alignItems: 'center', marginLeft: 24 }}>
          <FlatButton
            label="重新安装WISNUC"
            onTouchTap={this.install}
            primary
          />
          { '该操作会清空硬盘上的所有数据后重建磁盘阵列，务必请先做好备份工作！' }
        </div>

        <div style={{ width: 1000, height: 56 }}>
          <Users volume={volume} />
        </div>

        {/* dialog */}
        {
        /*
        <DialogOverlay open={!!this.state.user}>
          {
            this.state.editAvatar &&
            <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
              <div style={{ color: 'rgba(0,0,0,0.54)' }}>{'请绑定微信，将会自动获取您的微信头像。'}</div>
              <div style={{ height: 24 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <FlatButton label="确定" primary onTouchTap={() => this.toggleDialog('editAvatar')} />
              </div>
            </div>
          }
        </DialogOverlay>
        */
        }
      </div>
    )
  }
}

export default BtrfsVolume
