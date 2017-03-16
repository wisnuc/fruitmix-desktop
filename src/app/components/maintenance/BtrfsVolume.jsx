import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { Avatar, Checkbox, Chip, Paper } from 'material-ui'
import {
  pinkA200, grey300, grey400, greenA400, green400, amber400,
  redA200, red400, lightGreen100, lightGreen400, lightGreenA100,
  lightGreenA200, lightGreenA400, lightGreenA700
} from 'material-ui/styles/colors'
import request from 'superagent'
import {
  operationTextConfirm, operationBase, Operation, operationBusy, operationSuccess, operationFailed, createOperation
} from '../common/Operation'
import VolumeWisnucError from './VolumeWisnucError'
import DoubleDivider from './DoubleDivider'
import Users from './Users'
import FlatButton from '../common/FlatButton'
import { HDDIcon, RAIDIcon, UpIcon, DownIcon } from './Svg'

const debug = Debug('component:maintenance:BtrfsVolume')
const SUBTITLE_HEIGHT = 32
const TABLEHEADER_HEIGHT = 48
const TABLEDATA_HEIGHT = 48
const HEADER_HEIGHT = 104
const FOOTER_HEIGHT = 48
const SUBTITLE_MARGINTOP = 24
const alphabet = 'abcdefghijklmnopqrstuvwxyz'

const diskDisplayName = (name) => {
  const chr = name.charAt(2)
  const number = alphabet.indexOf(chr) + 1
  return `硬盘 #${number}`
}

const VerticalExpandable = props => (
  <div style={{ width: '100%', height: props.height, transition: 'height 300ms', overflow: 'hidden' }}>
    { props.children }
  </div>
)

const styles = {
  chip: {
    backgroundColor: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'medium',
    height: 26,
    marginRight: 5,
    border: '1px solid #e6e6e6'
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  paperHeader: {
    position: 'relative',
    width: '100%',
    height: HEADER_HEIGHT,
    border: '1px solid #e6e6e6',
    display: 'flex',
    alignItems: 'center'
  }
}

const HeaderTitle1 = props => (
  <div style={props.style} onTouchTap={props.onTouchTap}>
    <div style={{ marginBottom: 2 }}>
      {props.title}
    </div>
    <div style={styles.wrapper}>
      {
        props.textFilesystem &&
        <Chip style={styles.chip} labelStyle={{ marginTop: -4 }}>
          <span style={{ color: '#9e9e9e' }}>
            {props.textFilesystem}
          </span>
        </Chip>
      }
      {
        props.volumemode &&
          <Chip style={styles.chip} labelStyle={{ marginTop: -4 }}>
            <span style={{ color: '#9e9e9e' }}>
              {props.volumemode}
            </span>
          </Chip>
        }
    </div>
  </div>
)

const SubTitleRow = props => (
  <div style={{ width: '100%', height: SUBTITLE_HEIGHT, display: 'flex', alignItems: 'center' }}>
    <div style={{ flex: '0 0 256px' }} />
    <div
      style={{ flex: '0 0 184px',
        fontSize: 13,
        color: props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)',
        fontWeight: 'bold'
      }}
    >
      {props.text}
    </div>
  </div>
)

const TableHeaderRow = (props) => {
  const style = {
    height: TABLEHEADER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    fontSize: 11,
    color: props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.54)',
    fontWeight: props.disabled ? 'normal' : 'bold'
  }

  return (
    <div style={props.style}>
      <div style={style}>
        { props.items.map((item) => {
          const styles = { flex: `0 0 ${item[1]}px` }
          if (item[2] === true) { styles.textAlign = 'right' }
          return (<div style={styles} key={item.toString()}>{item[0]}</div>)
        }) }
      </div>
    </div>
  )
}

const TableDataRow = (props) => {
  const containerStyle = {
    height: TABLEDATA_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)'
  }

  if (!props.disabled && props.selected) { containerStyle.backgroundColor = '#F5F5F5' }

  return (
    <div style={props.style}>
      <div style={containerStyle}>
        { props.items.map((item) => {
          if (typeof item[0] === 'string') {
            const style = { flex: `0 0 ${item[1]}px` }
            if (item[2] === true) style.textAlign = 'right'
            return <div style={style} key={item.toString()}>{item[0]}</div>
          }
          const style = {
            flex: `0 0 ${item[1]}px`,
            display: 'flex',
            alignItems: 'center'
          }

          if (item[2] === true) style.justifyContent = 'center'
          return <div style={style} key={item.toString()}>{item[0]}</div>
        }) }
      </div>
    </div>
  )
}

const Checkbox40 = props => (
  <div style={{ width: 40, height: 40 }}>
    <Checkbox
      {...props} style={{ margin: 8 }}
      iconStyle={{ fill: props.fill }}
    />
  </div>
)

const HeaderIcon = props => (
  <div
    style={{
      width: 40,
      marginLeft: 24,
      marginTop: 24,
      marginRight: 16
    }}
  >
    { props.children }
  </div>
)

class KeyValueList extends React.PureComponent {

  constructor(props) {
    super(props)
  }

  render() {
    const style = { flexGrow: 1 }
    if (this.props.right === true) { style.textAlign = 'right' }

    return (
      <div style={this.props.style}>
        { this.props.items.map(item => (
          <div
            key={item.toString()}
            style={{
              height: 24,
              display: 'flex',
              alignItems: 'center',
              fontSize: 13,
              color: this.props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87'
            }}
          >
            <div style={{ width: 184 }}>{item[0]}</div>
            <div style={style}>{item[1]}</div>
          </div>
        ))}
      </div>
    )
  }
}

@muiThemeable()
export default class BtrfsVolume extends React.Component {
  /*
  static State = class State {
    constructor() {
      this.creatingNewVolume = null
      this.expanded = []
      this.operation = null
    }
  }
  */
  constructor(props) {
    super(props)
    this.unmounted = false
    this.colors = {
      fillGrey: grey400,
      fillGreyFaded: grey300
    }

    this.volumeUnformattable = volume => []

    this.volumeIconColor = (volume) => {
      if (this.props.state.creatingNewVolume) { return this.colors.fillGreyFaded }

      if (volume.isMissing) return redA200
      if (typeof volume.wisnuc !== 'object') return '#000'
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

    this.VolumeTitle = (props) => {
      const volume = props.volume
      return (
        <div style={{ width: '100%', height: HEADER_HEIGHT, display: 'flex' }}>
          <HeaderIcon>
            <Avatar
              size={40}
              color={'white'}
              backgroundColor={this.volumeIconColor(volume)}
              icon={<RAIDIcon />}
            />
          </HeaderIcon>
          <HeaderTitle1
            style={{
              fontWeight: 'regular',
              fontSize: 26,
              width: 176,
              marginTop: 18,
              color: this.props.state.creatingNewVolume ? 'rgba(0,0,0,0.38)' : '#212121'
            }}
            volumemode={volume.usage.data.mode.toUpperCase()}
            title="磁盘阵列"
            textFilesystem="Btrfs"
          />
        </div>
      )
    }

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

      this.props.that.createOperation(operationTextConfirm, text, () => {
        this.props.state.dialog.setState(operationBusy)

        const device = window.store.getState().maintenance.device
        const url = `http://${device.address}:3000/system/mir/run`

        request
          .post(url)
          .set('Accept', 'application/json')
          .send({ target: volume.fileSystemUUID })
          .end((err, res) => {
            if (err) {
              this.props.that.reloadBootStorage(() => {
                this.props.state.dialog.setState(operationFailed, this.errorText(err, res))
              })
            } else {
              this.props.that.reloadBootStorage(() => {
                for (let i = 3; i >= 0; i--) {
                  const time = (3 - i) * 1000
                  setTimeout(() => { this.props.state.dialog.setState(operationSuccess, [`启动成功，系统将在${i}秒钟后跳转到登录页面`]) }, time)
                }
                setTimeout(() => { window.store.dispatch({ type: 'EXIT_MAINTENANCE' }) }, 4000)
              })
            }
          })
      })
    }

    this.initWisnucOnVolume = (volume) => {
      // TODO FIXME
      if (typeof volume.wisnuc !== 'object') {
        alert('功能开发中......')
        return
      }
      this.props.setState({ initVolume: volume })
    }
  }

  render() {
    debug("BtrfsVolume render! ")
    const { volume, muiTheme, state, setState, that, ...rest } = this.props
    const primary1Color = this.props.muiTheme.palette.primary1Color
    const accent1Color = this.props.muiTheme.palette.accent1Color
    const { blocks } = this.props.state.storage
    const cnv = !!this.props.state.creatingNewVolume
    const expandableHeight = this.props.state.expanded.indexOf(volume) !== -1 ?
      17 * 24 + 3 * SUBTITLE_HEIGHT + SUBTITLE_MARGINTOP : 0
    const comment = () => volume.missing ? '有磁盘缺失' : '全部在线' // TODO if(volume.missing === true)
    const DivStyle = () => ({
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '',
      border: '1px solid #e6e6e6'
    })
    return (
      <Paper {...rest}>
        <div
          style={DivStyle()}
          onTouchTap={() => this.props.that.toggleExpanded(volume)}
        >
          <div style={{ flex: '0 0 900px', height: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: '0 0 256px' }}>
              <this.VolumeTitle volume={volume} />
            </div>
            <VolumeWisnucError creatingNewVolume={this.props.state.creatingNewVolume} volume={volume} />
          </div>
          <div style={{ marginRight: 24 }}>
            {expandableHeight ? <UpIcon color={'#9e9e9e'} /> : <DownIcon color={'#9e9e9e'} />}
          </div>

        </div>
        <VerticalExpandable height={expandableHeight}>

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
          <SubTitleRow text="磁盘信息" disabled={cnv && this.volumeUnformattable(volume).length > 0} />
        </VerticalExpandable>

        <TableHeaderRow
          style={{ fontWeight: 'regular', fontSize: 18, color: '#212121' }}
          items={[
            ['', 256],
            ['接口', 64],
            ['容量', 64, true],
            ['', 56],
            ['设备名', 96],
            ['型号', 208],
            ['序列号', 208],
            ['DEV ID', 96],
            ['已使用', 64, true]
          ]}
        />

        {
        blocks.filter(blk => blk.isVolumeDevice && blk.fileSystemUUID === volume.uuid)
          .map((blk, index) => (
            <TableDataRow
              key={blk.name}
              disabled={this.volumeUnformattable(volume).length > 0}
              selected={cnv && !!this.props.state.creatingNewVolume.disks.find(d => d === blk)}
              style={{ marginLeft: 80, fontWeight: 'medium', fontSize: 14, color: '#212121' }}
              items={[
                [(cnv ?
                  <Checkbox40
                    fill={accent1Color}
                    checked={!!this.props.state.creatingNewVolume.disks.find(d => d === blk)}
                    onCheck={() => this.that.toggleCandidate(blk)}
                  /> :
                  <HDDIcon
                    color="rgba(0,0,0,0.38)"
                    viewBox="0 0 24 24"
                  />), 36
                ],
                [diskDisplayName(blk.name), 140],
                [blk.idBus, 64],
                [prettysize(blk.size * 512), 64, true],
                ['', 56],
                [blk.name, 96],
                [blk.model || '', 208],
                [blk.serial || '', 208],
                [volume.devices.find(d => d.name === blk.name).id.toString(), 96],
                [volume.devices.find(d => d.name === blk.name).used, 64, true]
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
              />
            )
            return p
          }, [])
      }
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
        <DoubleDivider grayLeft={80} colorLeft={cnv ? 80 : '100%'} />
        <div>
          <div style={{ height: 24 }} />
          <Users creatingNewVolume={this.props.state.creatingNewVolume} volume={volume} />
          <div
            style={{ display: 'flex',
              alignItems: 'center',
              marginLeft: 80,
              height: 36,
              marginBottom: 24,
              fontSize: 14
            }}
          >
            { this.props.state.boot.state === 'maintenance' &&
                this.props.state.creatingNewVolume === null &&
                !volume.isMissing && typeof volume.wisnuc === 'object' &&
                volume.wisnuc.status === 'READY' &&
                <div>
                  <FlatButton
                    style={{ marginLeft: -8 }}
                    label="启动"
                    primary
                    onTouchTap={(e) => {
                      e.stopPropagation()
                      this.startWisnucOnVolume(volume)
                    }}
                  />
                  <span style={{ width: 8, display: 'inline-block' }} />
                </div>
            }
            { this.props.state.boot.state === 'maintenance' &&
                this.props.state.creatingNewVolume === null &&
                <FlatButton
                  style={{ marginLeft: -8 }}
                  label={
                    typeof volume.wisnuc === 'object'
                      ? [[volume.wisnuc.error === 'ENOWISNUC' ? '安装' : '重新安装']]
                      : [['修复问题']] // TODO
                  }
                  primary
                  onTouchTap={() => this.initWisnucOnVolume(volume)}
                />
            }

          </div>
        </div>
      </Paper>
    )
  }
}
