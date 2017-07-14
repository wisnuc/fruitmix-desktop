import React, { PureComponent } from 'react'
import Debug from 'debug'
import Radium from 'radium'
import sanitize from 'sanitize-filename'
import { TextField, Checkbox, Divider } from 'material-ui'
import { blueGrey50, blueGrey100, orange200 } from 'material-ui/styles/colors'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:FirmDetail')

@Radium
class RelList extends React.PureComponent {
  render() {
    const { rel, onTouchTap, installed } = this.props
    const date = rel.published_at.split('T')[0].split('-')
    let label = ''
    if (installed.id === rel.id) {
      label = '当前使用的版本'
    }

    return (
      <div
        style={{
          height: 96,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 24,
          ':hover': { backgroundColor: blueGrey100 }
        }}
        onTouchTap={() => onTouchTap(rel)}
      >
        <div>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '12px',
              backgroundColor: label ? orange200 : ''
            }}
          />
          <div style={{ height: 24 }} />
        </div>
        <div style={{ width: 24 }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            { rel.tag_name.replace(/\./g, ' . ') }
            <div style={{ width: 8 }} />
            { rel.prerelease && '(beta)' }
            <div style={{ width: 48 }} />
            { label }
          </div>
          <div style={{ height: 8 }} />
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: 'rgba(0,0,0,0.54)' }}>
            { `发布日期：${date[0]}年${date[1]}月${date[2]}日` }
          </div>
        </div>
      </div>
    )
  }
}

class FirmDetail extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {
    const { firm, selectRel, showRel, latest, installed, primaryColor } = this.props
    if (!firm) return (<div />)

    /* filter prerelease */
    const rels = firm.remotes.filter(rel => !rel.prerelease || rel.id === installed.id)

    return (
      <div style={{ height: '100%', backgroundColor: blueGrey50 }}>
        <div style={{ height: 64, backgroundColor: primaryColor, filter: 'brightness(0.9)' }} />

        {/* current installed version */}
        <div style={{ display: 'flex', alignItems: 'center', margin: 24 }}>
          { '可用版本列表' }
        </div>

        <div style={{ height: 'calc(100% - 304px)', overflow: 'auto' }}>
          {
            rels.map(rel => (
              <RelList
                installed={installed}
                key={rel.id}
                rel={rel}
                onTouchTap={selectRel}
              />
            ))
          }
        </div>
      </div>
    )
  }
}

export default FirmDetail
