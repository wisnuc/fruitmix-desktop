import React from 'react'
import Debug from 'debug'
import { Divider, Paper } from 'material-ui'
import { UpIcon, DownIcon } from './Svg'
import {
  SUBTITLE_HEIGHT, TABLEHEADER_HEIGHT, HEADER_HEIGHT,
  FOOTER_HEIGHT, SUBTITLE_MARGINTOP, styles, SubTitleRow,
  VerticalExpandable, DiskHeadline, DiskTitle, DiskInfoTable
} from './ConstElement'

const debug = Debug('component:maintenance:NoUsageDisk')

export default class NoUsageDisk extends React.Component {
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
    debug('NoUsageDisk Render')
    const accent1Color = this.props.that.colors.accent
    const { disk, state, setState, that, zDepth, ...rest } = this.props
    const cnv = this.props.state.creatingNewVolume
    const uf = this.props.that.diskUnformattable(disk).length > 0
    const expandableHeight = this.state.expanded ?
      36 + SUBTITLE_HEIGHT + SUBTITLE_MARGINTOP : 0
    const ExpandedzDepth = this.state.expanded ? 2 : zDepth
    const floatingTitleTop = () => {
      if (!cnv) return 0
      return HEADER_HEIGHT + TABLEHEADER_HEIGHT + expandableHeight
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

        <VerticalExpandable height={expandableHeight}>
          <div
            style={{
              height: 24,
              lineHeight: '24px',
              marginLeft: 256,
              fontSize: 14,
              marginTop: '12px',
              color: cnv ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)'
            }}
          >
            该信息仅供参考；有可能磁盘上的文件系统特殊或者较新，本系统未能正确识别。
          </div>
          <div style={{ height: SUBTITLE_MARGINTOP }} />
          <SubTitleRow text="磁盘信息" disabled={cnv} />
        </VerticalExpandable>

        <DiskInfoTable cnv={cnv} disk={disk} type="NoUsageDisk" />
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
            { cnv && '选择该磁盘加入新的磁盘阵列，会摧毁该磁盘上的所有数据。' }
          </div>
        </div>
      </Paper>
    )
  }

}
