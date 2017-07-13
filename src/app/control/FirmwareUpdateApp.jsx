import React from 'react'
import Debug from 'debug'
import Radium from 'radium'
import { Avatar, CircularProgress, Divider } from 'material-ui'
import DeveloperIcon from 'material-ui/svg-icons/hardware/developer-board'
import FlatButton from '../common/FlatButton'
import Checkmark from '../common/Checkmark'
import DialogOverlay from '../common/DialogOverlay'

const debug = Debug('component:control:power:')

@Radium
class RelList extends React.PureComponent {
  render() {
    const { rel, current, onTouchTap, install, index } = this.props
    const date = rel.published_at.split('T')[0]
    let installed = false

    if (current.id === rel.id) {
      installed = true
    }

    return (
      <div
        style={{
          height: 72,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 24,
          ':hover': { backgroundColor: '#F5F5F5' }
        }}
        onTouchTap={() => onTouchTap(rel)}
      >
        <div style={{ width: 56, display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '20px',
              backgroundColor: installed ? '#FFAB40' : index === 0 ? '#CCFF90' : 'rgba(0,0,0,0.27)',
              overflow: 'hidden'
            }}
          />
        </div>
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 24 }}>
            { `Version: ${rel.tag_name}` }
            <div style={{ width: 8 }} />
            { rel.prerelease && '(BETA)' }
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'rgba(0,0,0,0.54)' }}>
            { date }
          </div>
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
      <div style={{ height: '100%', width: '100%', display: 'flex' }}>
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 20, margin: 48 }}>
            <DeveloperIcon style={{ color: 'rgba(0,0,0,0.54)' }} />
            <div style={{ width: 24 }} />
            { current.tag_name }
          </div>
        </div>
        <div style={{ width: 360, backgroundColor: '#FAFAFA' }}>
          <div style={{ height: '100%', overflow: 'auto' }}>
            {
              rels.map((rel, index) => (
                <RelList
                  rel={rel}
                  current={current}
                  onTouchTap={selectRel}
                  install={() => {}}
                  key={rel.id}
                  index={index}
                />
              ))
            }
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
      </div>
    )
  }
}

export default FirmwareUpdate
