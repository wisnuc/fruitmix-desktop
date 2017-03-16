import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { Avatar, Checkbox, Chip, Divider, Paper } from 'material-ui'
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
import { 
  SUBTITLE_HEIGHT, TABLEHEADER_HEIGHT, TABLEDATA_HEIGHT, HEADER_HEIGHT, 
  FOOTER_HEIGHT, SUBTITLE_MARGINTOP, alphabet, styles, partitionDisplayName,
  SubTitleRow, VerticalExpandable, TableHeaderRow, TableDataRow
} from './ConstElement.jsx'

const debug = Debug('component:maintenance:BtrfsVolume')

@muiThemeable()
export default class PartitionedDisk extends React.Component {
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
    this.partitionedDiskNewVolumeWarning = (parts) => {
      if (parts.length === 0) { return '选择该磁盘建立新的磁盘阵列，会摧毁磁盘上的所有数据。' }
      return parts.reduce((p, c, i, a) => {
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
  }
  render() {
    // K combinator
    const K = x => y => x

    const { disk, ...rest } = this.props
    const boot = this.props.state.boot
    const { blocks } = this.props.state.storage
    const cnv = !!this.props.state.creatingNewVolume

    const parts = blocks.filter(blk => blk.parentName === disk.name && !blk.isExtended)

    const floatingTitleTop = () => {
      if (!cnv) return 0
      const inner = TABLEHEADER_HEIGHT + (parts.length * TABLEDATA_HEIGHT) + SUBTITLE_MARGINTOP + (2 * SUBTITLE_HEIGHT)
      const outer = HEADER_HEIGHT + TABLEHEADER_HEIGHT

      return this.props.state.expanded.indexOf(disk) !== -1 ? inner + outer : outer
    }

    // return array of unformattable partitions
    const unformattable = () =>
      parts.reduce((p, c) =>
        (c.isActiveSwap || c.isRootFS) ?
        K(p)(p.push(c)) :
        p, [])

    return (
      <Paper {...rest}>
        <div style={styles.paperHeader} onTouchTap={() => this.props.that.toggleExpanded(disk)}>
          <div style={{ flex: '0 0 256px' }}>
            <this.props.that.DiskTitle disk={disk} top={floatingTitleTop()} />
          </div>
          <div style={{ flex: '0 0 336px' }}>
            <this.props.that.DiskHeadline disk={disk} />
          </div>
          <div style={{ marginLeft: 560 }}>
            {this.props.state.expanded.indexOf(disk) !== -1 ? <UpIcon color={'#9e9e9e'} /> : <DownIcon color={'#9e9e9e'} />}
          </div>
        </div>
        <VerticalExpandable
          height={this.props.state.expanded.indexOf(disk) !== -1 ?
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
          {
          parts.map((blk, index) => (
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
          )).reduce((p, c, index) => {
            p.push(c)
            p.push(<Divider inset key={index.toString()} />)
            return p
          }, [])
        }
          <div style={{ width: '100%', height: SUBTITLE_MARGINTOP }} />
          <SubTitleRow text="磁盘信息" disabled={cnv && this.props.that.diskUnformattable(disk).length > 0} />
        </VerticalExpandable>
        <TableHeaderRow
          disabled={cnv && this.props.that.diskUnformattable(disk).length > 0}
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
          disabled={cnv && this.props.that.diskUnformattable(disk).length > 0}
          selected={cnv && !!this.props.state.creatingNewVolume.disks.find(d => d === disk)}
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
}
