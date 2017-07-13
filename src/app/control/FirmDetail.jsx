import React, { PureComponent } from 'react'
import Debug from 'debug'
import sanitize from 'sanitize-filename'
import { TextField, Checkbox, Divider } from 'material-ui'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:FirmDetail')

class FirmDetail extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {
    const { rel, primaryColor } = this.props
    if (!rel) return (<div />)
    return (<div />)
    return (
      <div style={{ height: '100%' }}>
        <div style={{ height: 64, backgroundColor: primaryColor, filter: 'brightness(0.9)' }}>
          {/* header */}
            <div style={{ height: 16 }} />
            {
              this.state.modify ?
                <div style={{ marginTop: -8 }}>
                  <TextField
                    name="shareDiskName"
                    fullWidth
                    onChange={e => this.updateLabel(e.target.value)}
                    value={this.state.modify ? this.state.label : detailDrive.label}
                    errorText={this.state.errorText}
                    onBlur={() => this.setState({ modify: false, changed: true })}
                    ref={(input) => { if (input && this.state.modify) { input.focus() } }}
                    inputStyle={{ fontSize: 20, fontWeight: 500, color: '#FAFAFA' }}
                    underlineFocusStyle={{ borderColor: '#FAFAFA' }}
                    underlineStyle={{ borderColor: '#5E35B1' }}
                    errorStyle={{ marginTop: 16 }}
                  />
                </div> :
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 32,
                    fontSize: 20,
                    fontWeight: 500,
                    color: '#FAFAFA'
                  }}
                  onTouchTap={() => this.setState({ modify: true })}
                >
                  { this.state.label ? this.state.label : this.currentLabel }
                  {/* <ModeEdit color="FAFAFA" style={{ marginLeft: 24 }} /> */}
                </div>
            }
            {
              <Divider
                color="rgba(0, 0, 0, 0.87)"
                style={{ opacity: !this.state.modify && this.state.titleHover ? 1 : 0 }}
              />
            }
        </div>

        {/* content */}
        <div style={{ width: 312, height: 'calc(100% - 152px)', padding: 24, display: 'flex', flexDirection: 'column' }}>
          {/* users */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(0,0,0,0.54)',
              marginTop: -2
            }}
          > 共享用户 </div>
          <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key="all" >
            <Checkbox
              label="所有人"
              labelStyle={{ fontSize: 14 }}
              iconStyle={{ fill: this.state.writelist.length === users.length ? '#5E35B1' : 'rgba(0, 0, 0, 0.54)' }}
              checked={this.state.writelist.length === users.length}
              onCheck={() => this.togglecheckAll()}
            />
          </div>
          <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
          <div style={{ overflow: 'auto', flexGrow: 1 }}>
            {
              users.map(user =>
                <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center' }} key={user.username} >
                  <Checkbox
                    label={user.username}
                    labelStyle={{ fontSize: 14 }}
                    iconStyle={{ fill: this.state.writelist.includes(user.uuid) ? '#5E35B1' : 'rgba(0, 0, 0, 0.54)' }}
                    checked={this.state.writelist.includes(user.uuid)}
                    onCheck={() => this.handleCheck(user.uuid)}
                  />
                </div>
              )
            }
            <div style={{ height: 8 }} />
          </div>

          <div style={{ height: 16 }} />
          {/* button */}
          <Divider style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
          <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
            {/*
            <FlatButton
              label="返回" primary={primary}
              onTouchTap={toggleDetail}
            />
            */}
            <FlatButton
              label="应用" primary={primary}
              disabled={!this.state.changed || !!this.state.errorText || this.state.modify}
              onTouchTap={this.fire}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default FirmDetail
