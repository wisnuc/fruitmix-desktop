import Debug from 'debug'
import React from 'react'
import {
  AppBar, Avatar, Checkbox, Chip, Divider, Paper, Menu, MenuItem, Dialog, IconButton, TextField, CircularProgress
} from 'material-ui'
import muiThemeable from 'material-ui/styles/muiThemeable'
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less'
import ContentAddCircle from 'material-ui/svg-icons/content/add-circle'
import {
  pinkA200, grey300, grey400, greenA400, green400, amber400,
  redA200, red400, lightGreen100, lightGreen400, lightGreenA100,
  lightGreenA200, lightGreenA400, lightGreenA700
} from 'material-ui/styles/colors'
import UUID from 'node-uuid'
import request from 'superagent'
import validator from 'validator'
import prettysize from 'prettysize'

import DoubleDivider from './DoubleDivider'
import BtrfsVolume from './BtrfsVolume'
import NewVolumeTop from './NewVolumeTop'

import FlatButton from '../common/FlatButton'
import InitVolumeDialogs from './InitVolumeDialogs'
import {
  operationTextConfirm, operationBase, Operation, operationBusy, operationSuccess, operationFailed, createOperation
} from '../common/Operation'
import { CatSilhouette, BallOfYarn, HDDIcon, UpIcon, DownIcon
} from './Svg'
import StateUp from './VPStateUp'

const debug = Debug('component:maintenance')
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

const partitionDisplayName = (name) => {
  const numstr = name.slice(3)
  return `分区 #${numstr}`
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
      {props.textFilesystem &&
        <Chip style={styles.chip} labelStyle={{ marginTop: -4 }}>
          <span style={{ color: '#9e9e9e' }}>
            {props.textFilesystem}
          </span>
        </Chip> }
      {props.volumemode &&
        <Chip style={styles.chip} labelStyle={{ marginTop: -4 }}>
          <span style={{ color: '#9e9e9e' }}>
            {props.volumemode}
          </span>
        </Chip> }
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

// disabled
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
          const style = { flex: `0 0 ${item[1]}px` }
          if (item[2] === true) { style.textAlign = 'right' }
          return (<div style={style} key={item.toString()}>{item[0]}</div>)
        }) }
      </div>
    </div>
  )
}

// disabled, selected
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

const VerticalExpandable = props => (
  <div style={{ width: '100%', height: props.height, transition: 'height 300ms', overflow: 'hidden' }}>
    { props.children }
  </div>
)

@muiThemeable()
class Maintenance extends StateUp(React.Component) {

  constructor(props) {
    super(props)
    const that = this
    this.ssb = this.setState.bind(this)

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
      operation: null
    }

    this.reloadBootStorage = (callback) => {
      let storage
      let boot
      let done = false
      const device = window.store.getState().maintenance.device
      const finish = () => {
        if (storage && boot) {
          this.setState({
            storage,
            boot,
            creatingNewVolume: this.state.creatingNewVolume ? { disks: [], mode: 'single' } : null
          })

          if (callback) callback(null, { storage, boot })
          done = true
        }
      }

      request.get(`http://${device.address}:3000/system/storage?wisnuc=true`)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (this.unmounted) {
            if (!done) {
              if (callback) callback(new Error('unmounted'))
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
              if (callback) callback(new Error('unmounted'))
              done = true
            }
          }
          boot = err ? err.message : res.body
          finish()
        })
    }

    // //////////////////////////////////////////////////////////////////////////
    //
    // operation
    //
    this.operationOnCancel = () => {
      this.setState({ operation: null })
    }

    this.UsernamePasswordContent = () => {
      const onChange = (name, value) => {
        const operation = Object.assign({}, this.state.operation)
        operation[name] = value
        this.setState({ operation })
      }

      return (
        <div>
          <TextField
            hintText="" floatingLabelText="用户名"
            onChange={e => onChange('username', e.target.value)}
          />
          <TextField
            hintText="" floatingLabelText="输入密码" type="password"
            onChange={e => onChange('password', e.target.value)}
          />
          <TextField
            hintText="" floatingLabelText="再次输入密码" type="password"
            onChange={e => onChange('passwordAgain', e.target.value)}
          />
        </div>
      )
    }

    // Sub Component
    this.OperationTextContent = () => (
      <div style={{ width: '100%' }}>
        { this.state.operation.text.map((line, index, array) => (
          <div
            style={{
              fontSize: 15,
              lineHeight: '24px',
              marginBottom: index === array.length - 1 ? 0 : 20
            }}
          >{ line }</div>))}
      </div>
    )

    // Sub Component
    this.OperationBusy = () => (
      <div
        style={{ width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center' }}
      >
        <CircularProgress color={pinkA200} />
      </div>
    )

    // state transition
    this.setOperationDialogBusy = () => {
      const operation = {
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

    this.setOperationDialogSuccess = (text) => {
      const operation = {
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

    this.setOperationDialogFailed = (text) => {
      const operation = {
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
    this.OperationDialog = () => {
      const operation = this.state.operation
      return (
        <Dialog
          contentStyle={{ width: (this.state.operation && this.state.operation.width) || 560 }}
          title={operation && operation.title}
          open={operation !== null}
          modal
          actions={operation && operation.actions &&
              operation.actions.map(action =>
                <FlatButton
                  label={action.label}
                  onTouchTap={action.onTouchTap}
                  disabled={typeof action.disabled === 'function' ? action.disabled() : action.disabled}
                />)
          }
        >
          { operation && operation.Content && <operation.Content /> }
        </Dialog>
      )
    }

    // //////////////////////////////////////////////////////////////////////////
    //
    // actions
    //

    this.onToggleCreatingNewVolume = () => {
      this.setState((state) => {
        if (state.creatingNewVolume === null) {
          return {
            creatingNewVolume: { disks: [], mode: 'single' },
            expanded: []
          }
        }
        return { creatingNewVolume: null }
      })
    }

    this.toggleExpanded = (disvol) => {
      const index = this.state.expanded.indexOf(disvol)
      if (index === -1) { this.setState({ expanded: [...this.state.expanded, disvol] }) } else {
        this.setState({
          expanded: [...this.state.expanded.slice(0, index), ...this.state.expanded.slice(index + 1)]
        })
      }
    }

    this.toggleCandidate = (disk) => {
      if (this.state.creatingNewVolume === null) return
      const arr = this.state.creatingNewVolume.disks
      const index = arr.indexOf(disk)
      let nextArr
      // TODO not necessary as immutable
      if (index === -1) { nextArr = [...arr, disk] } else { nextArr = [...arr.slice(0, index), ...arr.slice(index + 1)] }

      this.setState({
        creatingNewVolume: {
          disks: nextArr,
          mode: nextArr.length > 1 ? this.state.creatingNewVolume.mode : 'single'
        }
      })
    }

    this.setVolumeMode = (mode) => {
      if (this.state.creatingNewVolume === null) return
      this.setState({
        creatingNewVolume: Object.assign({}, this.state.creatingNewVolume, { mode })
      })
    }

    this.extractAllCardItems = storage => ([
      ...storage.volumes,
      ...storage.blocks.filter(blk => blk.isDisk && !blk.isVolumeDevice)
    ])

    this.cardStyle = (item) => {
      const expanded = this.state.expanded.indexOf(item) !== -1
      if (this.state.creatingNewVolume === null) {
        // if(item.missing){
        if (0) {
          return {
            width: 1200,
            margin: expanded ? 24 : 8,
            transition: 'all 300ms',
            backgroundColor: red400
          }
        }
        return {
          width: 1200,
          margin: expanded ? 24 : 8,
          transition: 'all 300ms'
        }
      }
      return {
        width: 1200,
        margin: 2,
        transition: 'all 300ms'
      }
    }

    this.cardDepth = (item) => {
      const expanded = this.state.expanded.indexOf(item) !== -1
      if (this.state.creatingNewVolume === null) { return expanded ? 2 : 1 }
      return 0
    }

    // //////////////////////////////////////////////////////////////////////////
    //
    // widget
    //

    // frame height should be 36 + marginBottom (12, supposed)
    this.TextButtonTop = props => (
      <div
        style={{ width: '100%',
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between' }}
      >
        <div>{ props.text || '' }</div>
        <FlatButton
          label="创建磁盘阵列"
          labelPosition="before"
          icon={<ContentAddCircle color={this.props.muiTheme.palette.primary1Color} style={{ verticalAlign: '-18%' }} />}
          disableTouchRipple
          disableFocusRipple
          onTouchTap={this.onToggleCreatingNewVolume}
          disabled={props.disabled}
        />
      </div>
    )

    // frame height should be 48 + 16 + 64 + 8 = 136

    this.diskUnformattable = (disk) => {
      const K = x => y => x
      const blocks = this.state.storage.blocks

      if (disk.isVolumeDevice) { throw new Error('diskUnformattable requires non-volume disk as arguments') }

      if (disk.isPartitioned) {
        return blocks
          .filter(blk => blk.parentName === disk.name && !blk.isExtended)
          .reduce((p, c) => (c.isActiveSwap || c.isRootFS) ? K(p)(p.push(c)) : p, [])
      } else if (disk.isFileSystem) {
        return (disk.isActiveSwap || disk.isRootFS) ? [disk] : []
      } return []
    }

    this.volumeIconColor = (volume) => {
      if (this.state.creatingNewVolume) { return this.colors.fillGreyFaded }

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

    this.DiskHeadline = (props) => {
      const disk = props.disk
      let text = ''
      if (disk.isPartitioned) {
        text = '分区使用的磁盘'
      } else if (disk.idFsUsage === 'filesystem') {
        text = '包含文件系统，无分区表'
      } else if (disk.idFsUsage === 'other') {
        text = '包含特殊文件系统，无分区表'
      } else if (disk.idFsUsage === 'raid') {
        text = 'Linux RAID设备'
      } else if (disk.idFsUsage === 'crypto') {
        text = '加密文件系统'
      } else if (disk.idFsUsage) {
        text = `未知的使用方式 (ID_FS_USAGE=${disk.idFsUsage})`
      } else {
        text = '未发现文件系统或分区表'
      }

      return (
        <div
          style={{
            fontSize: 13,
            color: this.state.creatingNewVolume ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)'
          }}
        >
          {text}
        </div>
      )
    }

    this.DiskTitle = (props) => {
      const disk = props.disk
      const { primary1Color, accent1Color } = this.props.muiTheme.palette
      const cnv = !!this.state.creatingNewVolume
      const uf = this.diskUnformattable(disk).length > 0

      return (
        <div
          style={{ position: 'absolute',
            width: 256,
            display: 'flex',
            top: props.top,
            height: cnv ? TABLEDATA_HEIGHT : HEADER_HEIGHT,
            transition: 'all 300ms' }}
        >
          <HeaderIcon>
            { cnv ?
              <div style={{ marginTop: -16, marginLeft: 56 }}>
                <Checkbox40
                  fill={accent1Color}
                  disabled={uf}
                  onTouchTap={e => e.stopPropagation()}
                  checked={!!this.state.creatingNewVolume.disks.find(d => d === disk)}
                  onCheck={() => this.toggleCandidate(disk)}
                />
              </div>
                  :
              <Avatar
                size={40}
                color="white"
                backgroundColor="#BDBDBD"
                icon={<HDDIcon />}
              />
              }
          </HeaderIcon>
          <HeaderTitle1
            style={{
              fontWeight: 'regular',
              fontSize: cnv ? 13 : 26,
              height: cnv ? TABLEDATA_HEIGHT : HEADER_HEIGHT,
              width: 176,
              marginTop: 18,
              marginLeft: cnv ? 40 : 0,
              color: (!cnv || !uf) ? '#212121' : 'rgba(0,0,0,0.38)',
              transition: 'height 300ms'
            }}
            title={diskDisplayName(disk.name)}
            onTouchTap={e => cnv && e.stopPropagation()}
          />
        </div>
      )
    }

    this.partitionedDiskNewVolumeWarning = (parts) => {
      if (parts.length === 0) { return '选择该磁盘建立新的磁盘阵列，会摧毁磁盘上的所有数据。' }

      return parts
        .reduce((p, c, i, a) => {
          let s
          if (c.isActiveSwap) { s = `${p}在使用的交换分区(${c.name})` } else if (c.isRootFS) { s = `${p}在使用的系统分区(${c.name})` }

          if (i === a.length - 2) {
            s += '和'
          } else if (i === a.length - 1) {
            s += '。'
          } else {
            s += '，'
          }
          return s
        }, '该磁盘不能加入磁盘阵列；它包含')
    }

    this.PartitionedDisk = (props) => {
      // K combinator
      const K = x => y => x

      const { disk, ...rest } = props
      const boot = this.state.boot
      const { blocks } = this.state.storage
      const cnv = !!this.state.creatingNewVolume

      const parts = blocks.filter(blk => blk.parentName === disk.name && !blk.isExtended)

      const floatingTitleTop = () => {
        if (!cnv) return 0
        const inner = TABLEHEADER_HEIGHT + (parts.length * TABLEDATA_HEIGHT) + SUBTITLE_MARGINTOP + (2 * SUBTITLE_HEIGHT)
        const outer = HEADER_HEIGHT + TABLEHEADER_HEIGHT

        return this.state.expanded.indexOf(disk) !== -1 ? inner + outer : outer
      }

      // return array of unformattable partitions
      const unformattable = () =>
        parts.reduce((p, c) =>
          (c.isActiveSwap || c.isRootFS) ?
          K(p)(p.push(c)) :
          p, [])

      return (

        <Paper {...rest}>
          <div style={styles.paperHeader} onTouchTap={() => this.toggleExpanded(disk)}>
            <div style={{ flex: '0 0 256px' }}>
              <this.DiskTitle disk={disk} top={floatingTitleTop()} />
            </div>
            <div style={{ flex: '0 0 336px' }}>
              <this.DiskHeadline disk={disk} />
            </div>
            <div style={{ marginLeft: 560 }}>
              {this.state.expanded.indexOf(disk) !== -1 ? <UpIcon color={'#9e9e9e'} /> : <DownIcon color={'#9e9e9e'} />}
            </div>
          </div>
          <VerticalExpandable
            height={this.state.expanded.indexOf(disk) !== -1 ?
                SUBTITLE_HEIGHT * 2 +
                TABLEHEADER_HEIGHT +
                TABLEDATA_HEIGHT * parts.length +
                SUBTITLE_MARGINTOP : 0
            }
          >

            <SubTitleRow text="分区信息" disabled={cnv} />
            <TableHeaderRow
              disabled={cnv}
              items={[
              ['', 256],
              ['文件系统', 64],
              ['容量', 64, true],
              ['', 56],
              ['设备名', 96],
              ['路径（挂载点）', 416]
              ]}
            />
            { parts.map((blk, index) => (
              <TableDataRow
                key={blk.name}
                disabled={cnv}
                selected={false}
                items={[
                ['', 72],
                [partitionDisplayName(blk.name), 184],
                [(blk.idFsUsage && blk.fileSystemType) ? blk.fileSystemType : '(未知)', 64],
                [prettysize(blk.size * 512), 64, true],
                ['', 56],
                [blk.name, 96],
                [blk.isMounted ? blk.mountpoint : '', 416]
                ]}
              />
          ))
              .reduce((p, c, index) => {
                p.push(c)
                p.push(<Divider inset key={index.toString()} />)
                return p
              }, []) }
            <div style={{ width: '100%', height: SUBTITLE_MARGINTOP }} />

            <SubTitleRow text="磁盘信息" disabled={cnv && this.diskUnformattable(disk).length > 0} />
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
                ['分区表类型', 112]
            ]}
          />

          <TableDataRow
            disabled={cnv && this.diskUnformattable(disk).length > 0}
            selected={cnv && !!this.state.creatingNewVolume.disks.find(d => d === disk)}
            items={[
              ['', 72],
              ['', 184],
              [disk.idBus, 64],
              [prettysize(disk.size * 512), 64, true],
              ['', 56],
              [disk.name, 96],
              [disk.model || '', 208],
              [disk.serial || '', 208],
              [disk.partitionTableType, 112]
            ]}
          />

          {/* exclusive OR */}
          <DoubleDivider
            grayLeft={unformattable().length > 0 ? (cnv ? 80 : '100%') : null}
            colorLeft={unformattable().length === 0 ? (cnv ? 80 : '100%') : null}
          />

          <div
            style={{ width: '100%',
              height: cnv ? FOOTER_HEIGHT : 0,
              transition: 'height 300ms',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden' }}
          >
            <div style={{ flex: '0 0 80px' }} />
            <div
              style={{
                fontSize: 14,
                color: unformattable().length > 0 ? 'rgba(0,0,0,0.87)' :
              this.props.muiTheme.palette.accent1Color
              }}
            >
              { cnv && this.partitionedDiskNewVolumeWarning(unformattable()) }
            </div>
          </div>
        </Paper>
      )
    }

    // file system disk is determined by idFsUsage
    this.FileSystemUsageDisk = (props) => {
      const primary1Color = this.props.muiTheme.palette.primary1Color
      const accent1Color = this.props.muiTheme.palette.accent1Color
      const cnv = !!this.state.creatingNewVolume
      const { disk, ...rest } = props
      const floatingTitleTop = () => {
        if (!cnv) return 0
        const outer = HEADER_HEIGHT + TABLEHEADER_HEIGHT
        const inner = TABLEHEADER_HEIGHT + TABLEDATA_HEIGHT + SUBTITLE_MARGINTOP + 2 * SUBTITLE_HEIGHT
        return this.state.expanded.indexOf(disk) !== -1 ? inner + outer : outer
      }

      return (
        <Paper {...rest}>
          <div style={styles.paperHeader} onTouchTap={() => this.toggleExpanded(disk)}>
            <div style={{ flex: '0 0 256px' }}>
              <this.DiskTitle disk={disk} top={floatingTitleTop()} />
            </div>
            <div style={{ flex: '0 0 336px' }}>
              <this.DiskHeadline disk={disk} />
            </div>
            <div style={{ marginLeft: 560 }}>
              {this.state.expanded.indexOf(disk) !== -1 ? <UpIcon color={'#9e9e9e'} /> : <DownIcon color={'#9e9e9e'} />}
            </div>
          </div>

          <VerticalExpandable
            height={
              this.state.expanded.indexOf(disk) !== -1 ?
                SUBTITLE_HEIGHT * 2 +
                TABLEHEADER_HEIGHT +
                TABLEDATA_HEIGHT +
                SUBTITLE_MARGINTOP : 0
            }
          >

            <SubTitleRow text="文件系统信息" disabled={cnv} />

            <TableHeaderRow
              disabled={cnv}
              items={[
              ['', 256],
              ['文件系统', 184],
              ['文件系统UUID', 304],
              ['路径（挂载点）', 416]
              ]}
            />
            <Divider style={{ marginLeft: 256 }} />
            <TableDataRow
              disabled={cnv}
              selected={false}
              items={[
              ['', 256],
              [disk.fileSystemType, 184],
              [disk.fileSystemUUID, 304],
              [disk.isMounted ? disk.mountpoint : '(未挂载)']
              ]}
            />
            <Divider style={{ marginLeft: 256 }} />
            <div style={{ width: '100%', height: SUBTITLE_MARGINTOP }} />

            <SubTitleRow text="磁盘信息" disabled={cnv && this.diskUnformattable(disk).length > 0} />

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
            ['序列号', 208]
            ]}
          />
          <DoubleDivider grayLeft={256} colorLeft={cnv ? 256 : '100%'} />

          <TableDataRow
            disabled={cnv && this.diskUnformattable(disk).length > 0}
            selected={cnv && !!this.state.creatingNewVolume.disks.find(d => d === disk)}
            items={[
            ['', 256],
            [disk.idBus, 64],
            [prettysize(disk.size * 512), 64, true],
            ['', 56],
            [disk.name, 96],
            [disk.model || '', 208],
            [disk.serial || '', 208]
            ]}
          />
          <DoubleDivider colorLeft={cnv ? 80 : '100%'} />
          <div
            style={{ width: '100%',
              height: cnv ? FOOTER_HEIGHT : 0,
              transition: 'height 300ms',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden' }}
          >
            <div style={{ flex: '0 0 80px' }} />
            <div
              style={{
                fontSize: 14,
                color: (disk.isActiveSwap || disk.isRootFS) ? 'rgba(0,0,0,0.87)' : accent1Color
              }}
            >
              { cnv &&
                  (disk.isActiveSwap ? '该磁盘不能加入磁盘阵列；它是在使用的交换文件系统。' :
                    disk.isRootFS ? '该磁盘不能加入磁盘阵列；它是在使用的系统文件系统。' :
                    '选择该磁盘加入新的磁盘阵列，会摧毁该磁盘上的所有数据。'
                  )
              }
            </div>
          </div>
        </Paper>
      )
    }

    this.NoUsageDisk = (props) => {
      const primary1Color = this.props.muiTheme.palette.primary1Color
      const accent1Color = this.props.muiTheme.palette.accent1Color

      const boot = this.state.boot
      const storage = this.state.storage
      const { disk, ...rest } = props

      const cnv = !!this.state.creatingNewVolume

      const expandableHeight = this.state.expanded.indexOf(disk) !== -1 ?
        24 + SUBTITLE_HEIGHT + SUBTITLE_MARGINTOP : 0

      const floatingTitleTop = () => {
        if (!cnv) return 0
        return HEADER_HEIGHT + TABLEHEADER_HEIGHT + expandableHeight
      }

      return (
        <Paper {...rest}>
          <div style={styles.paperHeader} onTouchTap={() => this.toggleExpanded(disk)}>
            <div style={{ flex: '0 0 256px' }}>
              <this.DiskTitle disk={disk} top={floatingTitleTop()} />
            </div>
            <div style={{ flex: '0 0 336px' }}>
              <this.DiskHeadline disk={disk} />
            </div>
            <div style={{ marginLeft: 560 }}>
              {this.state.expanded.indexOf(disk) !== -1 ? <UpIcon color={'#9e9e9e'} /> : <DownIcon color={'#9e9e9e'} />}
            </div>
          </div>

          <VerticalExpandable height={expandableHeight}>

            <div style={{ height: 24, lineHeight: '24px', marginLeft: 256, fontSize: 14 }}>
              该信息仅供参考；有可能磁盘上的文件系统特殊或者较新，本系统未能正确识别。
            </div>
            <div style={{ height: SUBTITLE_MARGINTOP }} />
            <SubTitleRow text="磁盘信息" />

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
              ['序列号', 208]
            ]}
          />
          <DoubleDivider grayLeft={256} colorLeft={cnv ? 256 : '100%'} />
          <TableDataRow
            disabled={false}
            selected={cnv && this.state.creatingNewVolume.disks.find(d => d === disk)}
            items={[
              ['', 256],
              [disk.idBus, 64],
              [prettysize(disk.size * 512), 64, true],
              ['', 56],
              [disk.name, 96],
              [disk.model || '', 208],
              [disk.serial || '', 208]
            ]}
          />
          <DoubleDivider colorLeft={cnv ? 80 : '100%'} />
          <div
            style={{ width: '100%',
              height: cnv ? FOOTER_HEIGHT : 0,
              transition: 'height 300ms',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden' }}
          >
            <div style={{ flex: '0 0 80px' }} />
            <div
              style={{
                fontSize: 14,
                color: (disk.isActiveSwap || disk.isRootFS) ? 'rgba(0,0,0,0.87)' : accent1Color
              }}
            >
              { cnv && '选择该磁盘加入新的磁盘阵列，会摧毁该磁盘上的所有数据。' }
            </div>
          </div>
        </Paper>
      )
    }
    this.renderAppBar = () => (<AppBar
      style={{ position: 'absolute', height: 128, width: 'calc(100% - 16px)' }}
      showMenuIconButton={false}
      iconElementRight={
        <IconButton onTouchTap={() => window.store.dispatch({ type: 'EXIT_MAINTENANCE' })}>
          <ActionExitToApp />
        </IconButton>}
      zDepth={2}
    />)

    this.renderCat = () => (<CatSilhouette
      style={{ position: 'absolute',
        top: 34,
        left: 48,
        width: 120,
        height: 114,
        zIndex: 10000
      }}
      color="#E0E0E0"
    />)
  }

  componentDidMount() {
    this.reloadBootStorage()
  }

  componentWillUnmount() {
    this.unmounted = true
  }

  renderBootStatus() {
    const data = window.store.getState().maintenance.device
    const TextMaintence = `该设备已正常启动，此界面仅用于浏览；设备的ip为 ${data.address}，model为 ${data.model}，serial为 ${data.serial}。`
    // debug("data = window.store.getState().maintenance = ", data);
    return (
      <this.TextButtonTop
        text={this.state.boot.state !== 'maintenance' ? TextMaintence : ''}
        disabled={this.state.boot.state !== 'maintenance'}
      />
    )
  }
  renderTitle() {
    return (
      <div
        style={{
          position: 'absolute',
          top: 64,
          height: 64,
          width: 'calc(100% - 16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: 1200,
            fontSize: 24,
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1200
          }}
        >
          <div style={{ width: 72, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BallOfYarn style={{ width: 24, height: 24 }} color="#FFF" />
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
    const cnv = !!this.state.creatingNewVolume

    if (typeof this.state.boot !== 'object' || typeof this.state.storage !== 'object') return <div />

    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#F5F5F5', overflowY: 'scroll' }}>

        { this.renderAppBar() }
        { this.renderCat() }
        { this.renderTitle() }

        <this.OperationDialog />

        {/* page container */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* placeholde for AppBar */}
          <div style={{ width: '100%', height: 128, marginBottom: 24 }} />

          {/* gray box begin */}
          <div
            style={{
              backgroundColor: cnv ? '#E0E0E0' : '#F5F5F5',
              padding: cnv ? '24px 16px 24px 16px' : 0,
              transition: 'all 300ms',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >

            {/* top panel selector */}
            <div style={{ width: 1200, height: cnv ? 136 - 48 - 16 : 48, transition: 'height 300ms' }}>
              { cnv ? <NewVolumeTop state={this.state} setState={this.ssb} that={this} /> : this.renderBootStatus()}
            </div>

            { typeof this.state.boot === 'object' && typeof this.state.storage === 'object' &&
                this.state.storage.volumes.map((vol, index) =>
                  <BtrfsVolume state={this.state} setState={this.ssb} that={this} key={index.toString()} style={this.cardStyle(vol)} volume={vol} zDepth={this.cardDepth(vol)} />) }

            { typeof this.state.boot === 'object' && typeof this.state.storage === 'object' &&
                      this.state.storage.blocks
                      .filter(blk => blk.isDisk && !blk.isVolumeDevice)
                      .map((disk, index) => React.createElement(
                        disk.isPartitioned ? this.PartitionedDisk :
                        disk.idFsUsage ? this.FileSystemUsageDisk : this.NoUsageDisk, {
                          style: this.cardStyle(disk), zDepth: this.cardDepth(disk), disk, key: index.toString()
                        }, null)) }

          </div>
          {/* gray box end */}

          <div style={{ width: '100%', height: 48 }} />
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
