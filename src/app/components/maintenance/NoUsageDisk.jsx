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
} from './ConstElement'

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
  }
  render() {
    const primary1Color = this.props.muiTheme.palette.primary1Color
    const accent1Color = this.props.muiTheme.palette.accent1Color

    const boot = this.props.state.boot
    const storage = this.props.state.storage
    const { disk, muiTheme, state, setState, that, ...rest } = this.props

    const cnv = !!this.props.state.creatingNewVolume

    const expandableHeight = this.props.state.expanded.indexOf(disk) !== -1 ?
      24 + SUBTITLE_HEIGHT + SUBTITLE_MARGINTOP : 0

    const floatingTitleTop = () => {
      if (!cnv) return 0
      return HEADER_HEIGHT + TABLEHEADER_HEIGHT + expandableHeight
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
          selected={cnv && this.props.state.creatingNewVolume.disks.find(d => d === disk)}
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

}
