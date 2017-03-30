import React from 'react'
import Debug from 'debug'
import { Divider, Paper } from 'material-ui'
import { UpIcon, DownIcon } from './Svg'
import {
  SUBTITLE_HEIGHT, TABLEHEADER_HEIGHT, TABLEDATA_HEIGHT, HEADER_HEIGHT,
  FOOTER_HEIGHT, SUBTITLE_MARGINTOP, styles, SubTitleRow, VerticalExpandable,
  TableHeaderRow, TableDataRow, DiskHeadline, DiskTitle, DiskInfoTable
} from './ConstElement'

const debug = Debug('component:maintenance:FileSystemUsageDisk')

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
    this.state = {
      expanded: false
    }
    this.toggleExpanded = () => {
      const newstatus = !this.state.expanded
      this.setState({ expanded: newstatus })
    }
  }
  render() {
    debug('FileSystemUsageDisk render! ')
    const { disk, state, setState, zDepth, that, ...rest } = this.props
    const accent1Color = this.props.that.colors.accent
    const cnv = this.props.state.creatingNewVolume
    const ExpandedzDepth = this.state.expanded ? 2 : zDepth
    const uf = this.props.that.diskUnformattable(disk).length > 0

    const floatingTitleTop = () => {
      if (!cnv) return 0
      const outer = HEADER_HEIGHT + TABLEHEADER_HEIGHT
      const inner = TABLEHEADER_HEIGHT + TABLEDATA_HEIGHT + SUBTITLE_MARGINTOP + 2 * SUBTITLE_HEIGHT
      return this.state.expanded ? inner + outer : outer
    }

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
          height={
            this.state.expanded ?
              SUBTITLE_HEIGHT * 2 +
              TABLEHEADER_HEIGHT +
              TABLEDATA_HEIGHT +
              SUBTITLE_MARGINTOP*2 : 0
          }
        >
          <div style={{ width: '100%', height: SUBTITLE_MARGINTOP }} />
          <SubTitleRow text="文件系统信息" disabled={cnv} />

          <TableHeaderRow
            disabled={cnv}
            items={[
            ['', 256],
            ['文件系统', 120],
            ['文件系统UUID', 304],
            ['路径（挂载点）', 264]
            ]}
          />
          <Divider style={{ marginLeft: 256, width: 688 }} />
          <TableDataRow
            disabled={cnv}
            selected={false}
            items={[
            ['', 256],
            [disk.fileSystemType, 120],
            [disk.fileSystemUUID, 304],
            [disk.isMounted ? disk.mountpoint : '(未挂载)', 264]
            ]}
          />
          <Divider style={{ marginLeft: 256, width: 688 }} />
          <div style={{ width: '100%', height: SUBTITLE_MARGINTOP }} />
          <SubTitleRow text="磁盘信息" disabled={cnv} />
        </VerticalExpandable>

        <DiskInfoTable cnv={cnv} disk={disk} type="FileSystemUsageDisk" />
        <Divider
          style={{
            marginLeft: 80,
            width: 1040,
            backgroundColor: cnv ? accent1Color : '' }}
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
