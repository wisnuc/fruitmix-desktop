import React, { PureComponent } from 'react'
import Debug from 'debug'
import Radium from 'radium'
import sanitize from 'sanitize-filename'
import { TextField, Checkbox, Divider } from 'material-ui'
import { blueGrey50, blueGrey100 } from 'material-ui/styles/colors'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:FirmDetail')

@Radium
class RelList extends React.PureComponent {
  render() {
    const { rel, onTouchTap, install } = this.props
    const date = rel.published_at.split('T')[0].split('-')
    const label = '一键安装'
    const disabled = false

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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            { rel.tag_name.replace(/\./g, ' . ') }
            <div style={{ width: 8 }} />
            { rel.prerelease && '(beta)' }
          </div>
          <div style={{ height: 8 }} />
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: 'rgba(0,0,0,0.54)' }}>
            { `发布日期：${date[0]}年${date[1]}月${date[2]}日` }
          </div>
        </div>
        {/*
          <FlatButton label={label} disabled={disabled} onTouchTap={() => install(rel)} primary />
          */}
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
    const rels = firm.remotes.filter(rel => !rel.prerelease)
    const index = rels.findIndex(rel => rel.id === installed.id)

    let otherRels = rels
    if (index > -1) {
      otherRels = [...rels.slice(0, index), ...rels.slice(index + 1)]
    }
    return (
      <div style={{ height: '100%', backgroundColor: blueGrey50 }}>
        <div style={{ height: 64, backgroundColor: primaryColor, filter: 'brightness(0.9)' }} />

        {/* current installed version */}
        <div style={{ display: 'flex', alignItems: 'center', margin: 24 }}>
          { '当前使用版本' }
        </div>
        <RelList
          rel={installed}
          onTouchTap={selectRel}
        />


        {/* other  versions */}
        <div style={{ margin: 24 }} >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            { '其他可用版本' }
          </div>
        </div>

        <div style={{ height: 'calc(100% - 304px)', overflow: 'auto' }}>
          {
            otherRels.map(rel => (
              <RelList
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
