import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import muiThemeable from 'material-ui/styles/muiThemeable'
import { Divider, Paper } from 'material-ui'
import DoubleDivider from './DoubleDivider'
import { UpIcon, DownIcon } from './Svg'
import {
  SUBTITLE_HEIGHT, TABLEHEADER_HEIGHT, TABLEDATA_HEIGHT, HEADER_HEIGHT,
  FOOTER_HEIGHT, SUBTITLE_MARGINTOP, styles,
  SubTitleRow, VerticalExpandable, TableHeaderRow, TableDataRow
} from './ConstElement'

const debug = Debug('component:maintenance:BtrfsVolume')

export default class FileSystemUsageDisk extends React.Component {
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
  }
  render() {
    const primary1Color = this.props.that.colors.primary
    const accent1Color = this.props.that.colors.accent
    const cnv = !!this.props.state.creatingNewVolume
    const { disk, muiTheme, state, setState, that, ...rest } = this.props
    const floatingTitleTop = () => {
      if (!cnv) return 0
      const outer = HEADER_HEIGHT + TABLEHEADER_HEIGHT
      const inner = TABLEHEADER_HEIGHT + TABLEDATA_HEIGHT + SUBTITLE_MARGINTOP + 2 * SUBTITLE_HEIGHT
      return this.props.state.expanded.indexOf(disk) !== -1 ? inner + outer : outer
    }

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
          height={
            this.props.state.expanded.indexOf(disk) !== -1 ?
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
          ['序列号', 208]
          ]}
        />
        <DoubleDivider grayLeft={256} colorLeft={cnv ? 256 : '100%'} />

        <TableDataRow
          disabled={cnv && this.props.that.diskUnformattable(disk).length > 0}
          selected={cnv && !!this.props.state.creatingNewVolume.disks.find(d => d === disk)}
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
}
