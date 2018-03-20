import React from 'react'
import i18n from 'i18n'
import prettysize from 'prettysize'
import { cyan500 } from 'material-ui/styles/colors'
import { Checkbox, Divider } from 'material-ui'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'

class CreatingVolumeDiskSelection extends React.PureComponent {
  static State = class State {
    constructor () {
      this.selection = []
      this.mode = null
    }
  }

  renderDiskRow (blk) {
    const model = blk.model ? blk.model : i18n.__('Unknown Disk Model')
    const name = blk.name
    const size = prettysize(blk.size * 512)
    const iface = blk.isATA ? 'ATA'
      : blk.isSCSI ? 'SCSI'
        : blk.isUSB ? 'USB' : i18n.__('Unknown Disk Iterface')

    const usage = blk.isFileSystem ? `${blk.fileSystemType} ${i18n.__('File System')}`
      : blk.isPartitioned ? i18n.__('isPartitioned') : i18n.__('No FileSystem or Partition')

    const valid = !blk.unformattable

    let comment
    if (/RootFS/.test(blk.unformattable)) {
      comment = i18n.__('Unformattable Comment isRootFS')
    } else if (/ActiveSwap/.test(blk.unformattable)) {
      comment = i18n.__('Unformattable Comment isActiveSwap')
    } else if (blk.unformattable) {
      comment = i18n.__('Unformattable Comment')
    } else if (blk.removable) {
      comment = i18n.__('Removable Disk Comment')
    } else comment = i18n.__('Disk All OK Comment')

    return (
      <div
        key={name}
        style={{
          width: '100%',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          color: valid ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.38)'
        }}
      >
        <div style={{ flex: '0 0 64px' }}>
          { valid && <Checkbox
            style={{ marginLeft: 16 }}
            checked={this.props.state.selection.indexOf(name) !== -1}
            onCheck={() => {
              console.log('......=============.......', this.props.state.selection)
              let nextState

              const index = this.props.state.selection.indexOf(name)
              if (index === -1) {
                nextState = Object.assign({}, this.state, {
                  selection: [...this.props.state.selection, name]
                })
              } else {
                nextState = Object.assign({}, this.state, {
                  selection: [...this.props.state.selection.slice(0, index),
                    ...this.props.state.selection.slice(index + 1)]
                })
              }

              if (nextState.selection.length === 1) {
                nextState.mode = 'single'
              } else if (nextState.selection.length === 0) {
                nextState.mode = null
              }

              this.props.setState(nextState)
            }}
          />}
        </div>
        <div style={{ flex: '0 0 180px' }}>{model}</div>
        <div style={{ flex: '0 0 80px' }}>{name}</div>
        <div style={{ flex: '0 0 80px' }}>{size}</div>
        <div style={{ flex: '0 0 80px' }}>{iface}</div>
        <div style={{ flex: '0 0 180px' }}>{usage}</div>
        <div style={{ flex: '0 0 240px' }}>{comment}</div>
      </div>
    )
  }

  render () {
    return (
      <div>
        <div style={{ height: 40, display: 'flex', alignItems: 'center', color: cyan500, paddingLeft: 10, paddingBottom: 20 }}>
          { i18n.__('Create Volume Warning') }
        </div>
        <div style={{ color: 'rgba(0,0,0,0.87)' }}>
          <div style={{ marginLeft: 10, fontSize: 13 }}>
            <Divider />
            <div style={{ width: '100%', height: 32, display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: '0 0 64px' }} />
              <div style={{ flex: '0 0 180px' }}>{ i18n.__('Model') }</div>
              <div style={{ flex: '0 0 80px' }}>{ i18n.__('Device Name')}</div>
              <div style={{ flex: '0 0 80px' }}>{ i18n.__('Disk Size') }</div>
              <div style={{ flex: '0 0 80px' }}>{ i18n.__('Disk Interface') }</div>
              <div style={{ flex: '0 0 180px' }}>{ i18n.__('Disk Status') }</div>
              <div style={{ flex: '0 0 240px' }}>{ i18n.__('Disk Comment') }</div>
            </div>
            <Divider />
            <div style={{ maxHeight: 180, overflowY: 'auto' }}>
              { this.props.storage && this.props.storage.blocks.filter(blk => blk.isDisk).map(blk => this.renderDiskRow(blk)) }
            </div>
            <Divider />
          </div>

          <div style={{ position: 'relative', marginLeft: 10, marginTop: 12, marginBottom: 12, display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: 13 }}> { i18n.__('Choose Disk Mode') }</div>
            <div style={{ width: 160 }}>
              <RadioButtonGroup
                style={{ position: 'relative', display: 'flex' }}
                valueSelected={this.props.state.mode}
                onChange={(e, value) => this.props.setState({ mode: value })}
                name="volume-name"
              >
                <RadioButton
                  style={{ fontSize: 13, width: 128 }}
                  iconStyle={{ width: 16, height: 16, padding: 2 }}
                  disableTouchRipple
                  disableFocusRipple
                  value="single"
                  label={i18n.__('Single Mode')}
                  disabled={this.props.state.selection.length === 0}
                />
                <RadioButton
                  style={{ fontSize: 13, width: 128 }}
                  iconStyle={{ width: 16, height: 16, padding: 2 }}
                  disableTouchRipple
                  disableFocusRipple
                  value="raid0"
                  label={i18n.__('Raid0 Mode')}
                  disabled={this.props.state.selection.length < 2}
                />
                <RadioButton
                  style={{ fontSize: 13, width: 128 }}
                  iconStyle={{ width: 16, height: 16, padding: 2 }}
                  disableTouchRipple
                  disableFocusRipple
                  value="raid1"
                  label={i18n.__('Raid1 Mode')}
                  disabled={this.props.state.selection.length < 2}
                />
              </RadioButtonGroup>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default CreatingVolumeDiskSelection
