import Debug from 'debug'
import React from 'react'
import muiThemeable from 'material-ui/styles/muiThemeable'
import ContentAddCircle from 'material-ui/svg-icons/content/add-circle'
import { grey300, grey400 } from 'material-ui/styles/colors'
import request from 'superagent'
import BtrfsVolume from './BtrfsVolume'
import NewVolumeTop from './NewVolumeTop'
import PartitionedDisk from './PartitionedDisk'
import FileSystemUsageDisk from './FileSystemUsageDisk'
import NoUsageDisk from './NoUsageDisk'
import RenderTitle from './RenderTitle'
import FlatButton from '../common/FlatButton'
import StateUp from './VPStateUp'

const debug = Debug('component:maintenance')

@muiThemeable()
class Maintenance extends StateUp(React.Component) {

  constructor(props) {
    super(props)

    this.state = {
      boot: props.selectedDevice.boot.value(),
      storage: props.selectedDevice.storage.value(),
      creatingNewVolume: null
    }

    this.colors = {
      primary: this.props.muiTheme.palette.primary1Color,
      accent: this.props.muiTheme.palette.accent1Color,

      fillGrey: grey400,
      fillGreyFaded: grey300
    }

    this.ssb = this.setState.bind(this)

    this.unmounted = false

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
    // actions
    //

    this.onToggleCreatingNewVolume = () => {
      this.setState((state) => {
        if (state.creatingNewVolume === null) {
          return {
            creatingNewVolume: { disks: [], mode: 'single' }
          }
        }
        return { creatingNewVolume: null }
      })
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

    this.cardStyle = () => ({
      width: 1200,
      margin: 8,
      transition: 'all 300ms'
    })

    this.cardDepth = () => this.state.creatingNewVolume === null ? 1 : 0

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
        { props.text ? <div /> :
        <FlatButton
          label="创建磁盘阵列"
          labelPosition="before"
          icon={<ContentAddCircle color={this.props.muiTheme.palette.primary1Color} style={{ verticalAlign: '-18%' }} />}
          disableTouchRipple
          disableFocusRipple
          onTouchTap={this.onToggleCreatingNewVolume}
          disabled={props.disabled}
        />
        }
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
  }

  componentDidMount() {
    // this.reloadBootStorage()
  }

  componentWillUnmount() {
    this.unmounted = true
  }

  renderBootStatus() {

    // let data = window.store.getState().maintenance.device
    let data = this.props.selectedDevice.mdev

    const TextMaintence = `该设备已正常启动，此界面仅用于浏览。
      设备的ip为 ${data.address}，model为 ${data.model}，serial为 ${data.serial}`
    // debug("data = window.store.getState().maintenance = ", data);
    return (
      <this.TextButtonTop
        text={this.state.boot.state !== 'maintenance' ? TextMaintence : ''}
        disabled={this.state.boot.state !== 'maintenance'}
      />
    )
  }

  render() {
    debug('render Maintenance', this.state)
    const cnv = !!this.state.creatingNewVolume

    if (typeof this.state.boot !== 'object' || typeof this.state.storage !== 'object') return <div />
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#F5F5F5', overflowY: 'scroll' }}>
        <RenderTitle state={this.state} {...this.props} />
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

            {
              typeof this.state.boot === 'object' && typeof this.state.storage === 'object' &&
                this.state.storage.volumes.map((vol, index) =>
                  <BtrfsVolume
                    state={this.state} setState={this.ssb} that={this} key={index.toString()}
                    style={this.cardStyle(vol)} volume={vol} zDepth={this.cardDepth(vol)}
                  />)
            }

            {
              typeof this.state.boot === 'object' && typeof this.state.storage === 'object' &&
                this.state.storage.blocks.filter(blk =>
                  blk.isDisk && !blk.isVolumeDevice).map((disk, index) => {
                    const props = {
                      state: this.state,
                      setState: this.ssb,
                      that: this,
                      style: this.cardStyle(disk),
                      zDepth: this.cardDepth(disk),
                      disk,
                      key: index.toString() }
                    return disk.isPartitioned ? <PartitionedDisk {...props} />
                      : disk.idFsUsage ? <FileSystemUsageDisk {...props} />
                      : <NoUsageDisk {...props} />
                  })
            }
          </div>
          {/* gray box end */}
          <div style={{ width: '100%', height: 48 }} />
        </div>
      </div>
    )
  }
}

export default Maintenance
