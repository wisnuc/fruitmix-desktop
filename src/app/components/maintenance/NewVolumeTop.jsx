import React from 'react'
import Debug from 'debug'
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover'
import { Paper, Menu, MenuItem } from 'material-ui'
import request from 'superagent'
import {
  operationTextConfirm, Operation, operationBusy, operationSuccess, operationFailed, createOperation
} from '../common/Operation'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:maintenance:NewVolumeTop')

class RaidModePopover extends React.Component {

  constructor(props) {
    super(props)
    this.state = { open: false, hover: false }
    this.label = () => this.props.list.find(item => item[0] === this.props.select)[1]
    this.handleRequestClose = () => this.setState({ open: false, anchorEl: null })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.disabled) this.setState({ open: false, hover: false })
  }

  render() {
    return (
      <div style={this.props.style}>
        <div
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            fontSize: 13,
            color: this.props.disabled ? 'rgba(0,0,0,0.38)' : this.props.color,
            borderRadius: '2px',
            backgroundColor: this.state.hover || this.state.open ? '#EEEEEE' : undefined
          }}
          onMouseEnter={() => !this.props.disabled && this.setState({ hover: true })}
          onMouseLeave={() => !this.props.disabled && this.setState({ hover: false })}
          onTouchTap={e => !this.props.disabled && this.setState({ open: true, anchorEl: e.currentTarget })}
        >
          {this.label()}
          <NavigationExpandMore
            style={{ width: 18, height: 18, marginLeft: 8 }}
            color={this.props.disabled ? 'rgba(0,0,0,0.38)' : this.props.color}
          />
        </div>

        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
          animation={PopoverAnimationVertical}
        >
          <Menu>
            { this.props.list.map(item => (
              <MenuItem
                key={item[1].toString()}
                style={{ fontSize: 13 }}
                primaryText={item[1]}
                disabled={item[2]}
                onTouchTap={() => {
                  this.handleRequestClose()
                  this.props.onSelect(item[0])
                }}
              />
            )) }
          </Menu>
        </Popover>
      </div>
    )
  }
}

export default class NewVolumeTop extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      dialog: undefined
    }

    this.setVolumeMode = (mode) => {
      if (this.props.state.creatingNewVolume === null) return
      this.props.setState({
        creatingNewVolume: Object.assign({}, this.props.state.creatingNewVolume, { mode })
      })
    }

    this.onToggleCreatingNewVolume = () => {
      this.props.setState((state) => {
        if (state.creatingNewVolume === null) {
          return {
            creatingNewVolume: { disks: [], mode: 'single' }
          }
        }
        return { creatingNewVolume: null }
      })
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

    this.mkfsBtrfsVolume = () => {
      if (this.props.state.creatingNewVolume === null) return

      const target = this.props.state.creatingNewVolume.disks.map(disk => disk.name)
      const type = 'btrfs'
      const mode = this.props.state.creatingNewVolume.mode
      const text = []

      text.push(`使用硬盘 ${target.join('、')} ，以${mode}模式创建新磁盘阵列，` +
        '这些磁盘和包含这些磁盘的磁盘阵列上的数据都会被删除且无法恢复。确定要执行该操作吗？')

      this.createOperation(operationTextConfirm, text, () => {
        this.state.dialog.setState(operationBusy)
        const device = window.store.getState().maintenance.device
        request
          .post(`http://${device.address}:3000/system/mir/mkfs`)
          .set('Accept', 'application/json')
          .send({ type, target, mode })
          .end((err, res) => {
            if (err) {
              this.props.that.reloadBootStorage(() => {
                this.state.dialog.setState(operationFailed, this.errorText(err, res))
              })
            } else {
              this.props.that.reloadBootStorage(() => {
                this.state.dialog.setState(operationSuccess, ['成功'])
              })
            }
          })
      })
    }
  }
  render() {
    const cnv = this.props.state.creatingNewVolume
    const accent1Color = this.props.that.colors.accent
    const actionEnabled = cnv.disks.length > 0
    const raidEnabled = cnv.disks.length > 1
    const hint = cnv.disks.length > 0 ? `已选中${cnv.disks.length}个磁盘` : '请选择磁盘'

    return (
      <div style={{ width: '100%', height: 136 - 48 - 16 }}>

        <Paper
          style={{ width: '100%',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: accent1Color
          }}
        >
          <div style={{ marginLeft: 16, fontSize: 16 }}>{ hint }</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RaidModePopover
              list={[
                ['single', '使用SINGLE模式', false],
                ['raid0',
                  raidEnabled ? '使用RAID0模式' : '使用RAID0模式 (需选择至少两块磁盘)',
                  !raidEnabled
                ],
                ['raid1',
                  raidEnabled ? '使用RAID1模式' : '使用RAID1模式 (需选择至少两块磁盘)',
                  !raidEnabled
                ]
              ]}
              color={accent1Color}
              select={cnv.mode}
              disabled={!actionEnabled}
              onSelect={this.setVolumeMode}
            />
            <FlatButton
              label="创建" secondary
              onTouchTap={this.mkfsBtrfsVolume}
              disabled={this.props.state.creatingNewVolume.disks.length === 0}
            />
            <FlatButton
              label="取消" secondary
              onTouchTap={this.onToggleCreatingNewVolume}
            />
          </div>
          <Operation substate={this.state.dialog} />
        </Paper>
      </div>
    )
  }
}
