import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { Avatar, Paper, CircularProgress } from 'material-ui'
import {
  grey300, grey400, amber400, redA200, red400, lightGreen400
} from 'material-ui/styles/colors'
import request from 'superagent'
import {
  Operation, createOperation, operationTextConfirm, operationBusy, operationSuccess, operationFailed
} from '../common/Operation'
import VolumeWisnucError from './VolumeWisnucError'
import Users from './Users'
import InitVolumeDialogs from './InitVolumeDialogs'
import FlatButton from '../common/FlatButton'
import { HDDIcon, RAIDIcon, UpIcon, DownIcon } from './Svg'
import {
  SUBTITLE_HEIGHT, HEADER_HEIGHT, FOOTER_HEIGHT, SUBTITLE_MARGINTOP, SubTitleRow,
  VerticalExpandable, TableHeaderRow, TableDataRow, diskDisplayName, HeaderTitle1,
  HeaderIcon, Checkbox40, KeyValueList, DoubleDivider
} from './ConstElement'

import PureDialog from '../common/PureDialog.jsx'

const debug = Debug('component:maintenance:BtrfsVolume')

export default class BtrfsVolume extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      expanded: false,
      initVolume: undefined,
      dialog: undefined,
      pureDialog: false
    }

    this.toggleExpanded = () => {
      const newstatus = !this.state.expanded
      this.setState({ expanded: newstatus })
    }

    this.colors = {
      fillGrey: grey400,
      fillGreyFaded: grey300
    }

    this.volumeIconColor = (volume, boot) => {
      if (this.props.state.creatingNewVolume) return this.colors.fillGreyFaded
      // return this.colors.fillGrey
      // TODO
      if (volume.isMissing) return redA200
      switch (boot.error) {
        case null:
          return lightGreen400
        case 'ENOENT':
          return red400
        case 'EDATA':
          return red400
        case 'EFAIL':
          return red400
        case 'ENOALT':
          return red400
      }
      return '#000'
    }

    this.VolumeTitle = (volume, boot) => {
      return (
        <div style={{ width: '100%', height: HEADER_HEIGHT, display: 'flex', alignItems: 'center' }}>
          <HeaderIcon>
            <Avatar
              size={40}
              color={'white'}
              backgroundColor={this.volumeIconColor(volume, boot)}
              icon={<RAIDIcon />}
            />
          </HeaderIcon>
          <div style={{ width: 176 }}>
            <HeaderTitle1
              style={{
                fontWeight: 500,
                fontSize: 21,
                width: 176,
                color: this.props.state.creatingNewVolume ? 'rgba(0,0,0,0.38)' : '#212121'
              }}
              title="磁盘阵列"
            />
            <div
              style={{ textTransform: 'capitalize', fontSize: 14, fontWeight: 500, color: '#9e9e9e', marginTop: 2 }}
              onTouchTap={props.onTouchTap}
            >
              <span style={{ marginRight: 5 }}>Btrfs</span>
              { volume.usage.data.mode && <span style={{ marginRight: 5 }}> {volume.usage.data.mode.toLowerCase()} </span> }
            </div>
          </div>
        </div>
      )
    }

    this.createOperation = (operation, ...args) =>
      createOperation(this, 'dialog', operation, ...args)


    this.errorText = (err, res) => {
      const text = []

      // see superagent documentation on error handling
      if (err.status) {
        text.push(`${err.status} ${err.message}`)
        if (res && res.body && res.body.message) { text.push(`message: ${res.body.message}`) }
      } else {
        text.push('错误信息：', err.message)
      }

      return text
    }

    this.startWisnucOnVolume = (volume) => {
      const text = ['启动安装于Btrfs磁盘阵列上的WISNUC应用？']
      this.createOperation(operationTextConfirm, text, () => {
        this.state.dialog.setState()
        this.props.device.manualBoot({ target: volume.fileSystemUUID }) // FIXME
        this.setState({ pureDialog: 'start' })
      })
    }

    this.initWisnucOnVolume = (volume) => {
      if (this.props.state.boot.error !== 'ENOALT') {
        this.setState({ pureDialog: 'init' })
        return
      }
      this.setState({ initVolume: volume })
    }

    this.end = () => {
      // TODO
      this.setState({ pureDialog: false })
      this.props.that.reloadBootStorage(() => {
        this.props.nav('login')
      })
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

  render() {
    debug('BtrfsVolume render!', this.props)
    const { volume, state, setState, zDepth, that, nav, device, ...rest } = this.props
    const accent1Color = this.props.that.colors.accent
    const { blocks } = this.props.state.storage
    const boot = this.props.state.boot
    const cnv = !!this.props.state.creatingNewVolume
    const expandableHeight = this.state.expanded ?
      17 * 23 + 3 * SUBTITLE_HEIGHT + SUBTITLE_MARGINTOP * 2 + 0.5 : 0
    const ExpandedzDepth = this.state.expanded ? 2 : zDepth
    const comment = () => volume.missing ? '有磁盘缺失' : '全部在线' // TODO if(volume.missing === true)
    const DivStyle = () => ({
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '',
      boxSizing: 'border-box',
      borderStyle: 'none none solid none',
      borderWidth: '1px',
      borderColor: '#e6e6e6'
    })
    // debug('volume.usage', volume.usage, '!volume.usage', !volume.usage)
    if (!volume.usage) return <div />
    return (
      <Paper zDepth={ExpandedzDepth} {...rest}>
        <div
          style={DivStyle()}
          onTouchTap={() => this.toggleExpanded()}
        >
          <div style={{ flex: '0 0 900px', height: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: '0 0 256px' }}>
              { this.VolumeTitle(volume, boot) }
            </div>
            <VolumeWisnucError creatingNewVolume={this.props.state.creatingNewVolume} volume={volume} boot={boot} device={device} />
          </div>
          <div style={{ marginRight: 24 }}>
            {this.state.expanded ? <UpIcon color={'#9e9e9e'} /> : <DownIcon color={'#9e9e9e'} />}
          </div>

        </div>
        <VerticalExpandable height={expandableHeight}>

          <div style={{ width: '100%', height: 0.5 }} />
          <SubTitleRow text="磁盘阵列信息" disabled={cnv} />

          <div style={{ width: '100%', display: 'flex' }}>
            <div style={{ flex: '0 0 256px' }} />
            <KeyValueList
              disabled={cnv}
              items={[
                ['磁盘数量', (volume.total >= 2) ? `${volume.total}（${comment()}）` : `${volume.total}`],
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

        <TableHeaderRow
          disabled={cnv}
          items={[
            ['', 256],
            ['接口', 40],
            ['容量', 72, true],
            ['', 56],
            ['设备名', 98],
            ['型号', 216],
            ['序列号', 236],
            ['DEV ID', 64],
            ['已使用', 82, true]
          ]}
        />

        <div style={{ overflow: 'hidden' }}>
          {
          blocks.filter(blk => blk.isVolumeDevice && blk.fileSystemUUID === volume.uuid)
            .map(blk => (
              <TableDataRow
                key={blk.name}
                disabled={cnv}
                selected={cnv && !!this.props.state.creatingNewVolume.disks.find(d => d === blk)}
                style={{ marginLeft: 80 }}
                items={[
                  [(cnv ?
                    <Checkbox40
                      fill={accent1Color}
                      checked={!!this.props.state.creatingNewVolume.disks.find(d => d === blk)}
                      onCheck={() => this.props.that.toggleCandidate(blk)}
                    /> :
                    <HDDIcon
                      color="rgba(0,0,0,0.38)"
                      viewBox="0 0 24 24"
                    />), 40
                  ],
                  [diskDisplayName(blk.name), 136],
                  [blk.idBus, 40],
                  [prettysize(blk.size * 512), 72, true],
                  ['', 56],
                  [blk.name, 98],
                  [blk.model || '', 216],
                  [blk.serial || '', 236],
                  [volume.devices.find(d => d.name === blk.name).id.toString(), 64],
                  [volume.devices.find(d => d.name === blk.name).used, 82, true]
                ]}
              />
            ))
            .reduce((p, c, index, array) => {
              p.push(c)
              p.push(
                <DoubleDivider
                  key={index.toString()}
                  grayLeft={index === array.length - 1 ? null : 80}
                  colorLeft={cnv ? 80 : '100%'}
                  accent1Color={accent1Color}
                  width={1040}
                />
              )
              return p
            }, [])
        }
        </div>
        <div
          style={{ width: '100%',
            height: cnv ? FOOTER_HEIGHT : 0,
            transition: 'height 300ms',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden' }}
        >
          <div style={{ flex: '0 0 80px' }} />
          <div style={{ fontSize: 14, color: accent1Color }}>
            { cnv && '选择该磁盘阵列中的磁盘建立新的磁盘阵列，会摧毁当前磁盘阵列存储的所有数据。' }
          </div>
        </div>
        { !cnv && <div
          style={{
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
            borderStyle: 'solid none none none',
            borderWidth: '1px',
            borderColor: '#e6e6e6'
          }}
        >
          <div style={{ width: 1000 }}>
            <Users creatingNewVolume={this.props.state.creatingNewVolume} volume={volume} />
          </div>
          <div
            style={{
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: 8,
              fontSize: 14,
              width: 200
            }}
          >
            { this.props.state.boot.state === 'maintenance' &&
                this.props.state.creatingNewVolume === null &&
                !volume.isMissing && typeof volume.wisnuc === 'object' &&
                volume.wisnuc.status === 'READY' &&
                <div>
                  <FlatButton
                    label="启动"
                    primary
                    onTouchTap={(e) => {
                      e.stopPropagation()
                      this.startWisnucOnVolume(volume)
                    }}
                  />
                </div>
            }
            {
                this.props.state.creatingNewVolume === null &&
                boot.current === null &&
                <FlatButton
                  label={boot.error === 'ENOALT' ? '安装' : '修复问题' }
                  primary
                  onTouchTap={() => this.initWisnucOnVolume(volume)}
                />
            }
            { /* debug('volume, 安装', volume) */ }
          </div>
        </div> }
        <InitVolumeDialogs
          volume={this.state.initVolume}
          boot={boot}
          onRequestClose={() => this.setState({ initVolume: undefined })}
          onResponse={() => this.props.that.reloadBootStorage()}
          device={this.props.device}
          nav={this.props.nav}
        />
        <Operation substate={this.state.dialog} />
        <PureDialog
          open={!!this.state.pureDialog}
          onRequestClose={() => this.setState({ pureDialog: false })}
        >
          <div
            style={{ height: 300, width: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            { this.state.pureDialog === 'start' && this.renderFinished() }
          </div>
          {
            this.state.pureDialog === 'init' && <div style={{ padding: 24, width: 300 }}>
              系统出现严重问题！<br />请联系闻上科技，寻求人工技术支持！
              </div>
          }
        </PureDialog>
      </Paper>
    )
  }
}
