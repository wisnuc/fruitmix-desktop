import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { Divider, Paper } from 'material-ui'
import { UpIcon, DownIcon } from './Svg'
import {
  SUBTITLE_HEIGHT, TABLEHEADER_HEIGHT, TABLEDATA_HEIGHT, HEADER_HEIGHT,
  FOOTER_HEIGHT, SUBTITLE_MARGINTOP, styles, partitionDisplayName,
  SubTitleRow, VerticalExpandable, TableHeaderRow, TableDataRow, DiskHeadline, DiskTitle, DiskInfoTable
} from './ConstElement'

const debug = Debug('component:maintenance:PartitionedDisk')

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

    this.state = {
      expanded: false
    }
    this.toggleExpanded = () => {
      const newstatus = !this.state.expanded
      this.setState({ expanded: newstatus })
    }

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
    debug('PartitionedDisk Render')
    // K combinator
    const K = x => y => x
    const { disk, state, setState, that, zDepth, ...rest } = this.props
    const { blocks } = this.props.state.storage
    const cnv = this.props.state.creatingNewVolume
    const ExpandedzDepth = this.state.expanded ? 2 : zDepth
    const uf = this.props.that.diskUnformattable(disk).length > 0
    const accent = this.props.that.colors.accent
    const parts = blocks.filter(blk => blk.parentName === disk.name && !blk.isExtended)

    const floatingTitleTop = () => {
      if (!cnv) return 0
      const inner = TABLEHEADER_HEIGHT + (parts.length * TABLEDATA_HEIGHT) + SUBTITLE_MARGINTOP + (2 * SUBTITLE_HEIGHT)
      const outer = HEADER_HEIGHT + TABLEHEADER_HEIGHT

      return this.state.expanded ? inner + outer : outer
    }

    // return array of unformattable partitions
    const unformattable = () =>
      parts.reduce((p, c) =>
        (c.isActiveSwap || c.isRootFS) ?
        K(p)(p.push(c)) :
        p, [])

    return (
      <Paper zDepth={ExpandedzDepth} {...rest}>
        <div style={styles.paperHeader} onTouchTap={() => this.toggleExpanded()}>
          <div style={{ flex: '0 0 256px' }}>
            <DiskTitle
              disk={disk} top={floatingTitleTop()} colors={this.props.that.colors}
              cnv={cnv} uf={uf} toggleCandidate={this.props.that.toggleCandidate}
            />
          </div>
          <div style={{ flex: '0 0 336px' }}>
            <DiskHeadline disk={disk} cnv={cnv} />
          </div>
          <div style={{ marginLeft: 560 }}>
            {this.state.expanded ? <UpIcon color={'#9e9e9e'} /> : <DownIcon color={'#9e9e9e'} />}
          </div>
        </div>
        <VerticalExpandable
          height={this.state.expanded ?
              SUBTITLE_HEIGHT * 2 +
              TABLEHEADER_HEIGHT +
              TABLEDATA_HEIGHT * parts.length +
              SUBTITLE_MARGINTOP * 2 : 0
          }
        >
          <div style={{ width: '100%', height: SUBTITLE_MARGINTOP }} />
          <SubTitleRow text="分区信息" disabled={cnv} />
          <TableHeaderRow
            disabled={cnv}
            items={[
            ['', 256],
            ['文件系统', 56],
            ['容量', 56, true],
            ['', 56],
            ['设备名', 98],
            ['路径（挂载点）', 568]
            ]}
          />
          {
          parts.map(blk => (
            <TableDataRow
              key={blk.name}
              disabled={cnv}
              selected={false}
              items={[
                ['', 116],
                [partitionDisplayName(blk.name), 140],
                [(blk.idFsUsage && blk.fileSystemType) ? blk.fileSystemType : '(未知)', 56],
                [prettysize(blk.size * 512), 56, true],
                ['', 56],
                [blk.name, 98],
                [blk.isMounted ? blk.mountpoint : '', 568]
              ]}
            />
          )).reduce((p, c, index) => {
            p.push(c)
            p.push(<Divider style={{ marginLeft: 116, width: 968 }} key={index.toString()} />)
            return p
          }, [])
        }
          <div style={{ width: '100%', height: SUBTITLE_MARGINTOP }} />
          <SubTitleRow text="磁盘信息" disabled={cnv} />
        </VerticalExpandable>

        <DiskInfoTable cnv={cnv} disk={disk} type="PartitionedDisk" />

        {/* exclusive OR */}
        <Divider
          style={{
            marginLeft: 80,
            width: 1040,
            backgroundColor: cnv ? (unformattable().length === 0 ? accent : '#E0E0E0') : '' }}
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
              color: unformattable().length > 0 ? 'rgba(0,0,0,0.87)' : accent
            }}
          >
            { cnv && this.partitionedDiskNewVolumeWarning(unformattable()) }
          </div>
        </div>
      </Paper>
    )
  }
}
