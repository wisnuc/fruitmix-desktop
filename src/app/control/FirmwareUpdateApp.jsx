import React from 'react'
import Debug from 'debug'
import Radium from 'radium'
import { CircularProgress, Divider } from 'material-ui'
import FlatButton from '../common/FlatButton'
import Checkmark from '../common/Checkmark'
import DialogOverlay from '../common/DialogOverlay'

const debug = Debug('component:control:power:')

@Radium
class RelList extends React.PureComponent {
  render() {
    const { rel, current, onTouchTap, install } = this.props
    const date = rel.published_at.split('T')[0].split('-')
    let label = '一键安装'
    let disabled = false

    if (current.id === rel.id) {
      label = '当前版本'
      disabled = true
    }

    return (
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 24,
          ':hover': { backgroundColor: '#F5F5F5' }
        }}
        onTouchTap={() => onTouchTap(rel)}
      >
        <div style={{ width: 56, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.54)', overflow: 'hidden' }} />
        </div>
        <div style={{ width: 160, display: 'flex', alignItems: 'center' }}>
          { rel.prerelease ? '测试版' : '正式版' }
        </div>
        <div style={{ width: 200, display: 'flex', alignItems: 'center' }}>
          { rel.tag_name }
        </div>
        <div style={{ width: 360, display: 'flex', alignItems: 'center' }}>
          { `${date[0]}年${date[1]}月${date[2]}日` }
        </div>
        <div style={{ width: 120, display: 'flex', alignItems: 'center' }}>
          <FlatButton label={label} disabled={disabled} onTouchTap={() => install(rel)} primary />
        </div>
      </div>
    )
  }

}

class FirmwareUpdate extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    }

    this.install = () => {
      debug('this.install')
    }
  }


  render() {
    const { firm, selectRel } = this.props
    if (!firm) return (<div />)
    const rels = firm.remotes
    const current = rels.find(rel => rel.id === firm.current.id)
    return (
      <div style={{ height: '100%' }}>
        <div style={{ height: 16 }} />
        <div style={{ width: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>
          { current.tag_name }
          <div style={{ width: 8 }} />
          { current.prerelease ? '测试版' : '正式版' }
        </div>
        <div style={{ width: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          { '当前版本' }
        </div>

        <div style={{ height: 24 }} />

        <div style={{ height: 64, display: 'flex', alignItems: 'center', marginLeft: 24 }}>
          <div style={{ width: 56 }} />
          {'版本类型'}
          <div style={{ width: 96 }} />
          {'版本号'}
          <div style={{ width: 152 }} />
          {'更新日期'}
        </div>

        <div style={{ height: 'calc(100% - 180px)', overflow: 'auto' }}>
          { rels.map(rel => <RelList rel={rel} current={current} onTouchTap={selectRel} install={() => {}} key={rel.id} />) }
        </div>

        {/* dialog */}
        <DialogOverlay open={this.state.operation === 'progress'} >
          {
            this.state.operation === 'progress' &&
              <div
                style={{
                  position: 'absolute',
                  width: 360,
                  height: 240,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'white'
                }}
              >
                { this.renderDiaContent()}
              </div>
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default FirmwareUpdate
