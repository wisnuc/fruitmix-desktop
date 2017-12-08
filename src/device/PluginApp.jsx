import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import prettysize from 'prettysize'
import { CircularProgress, Divider, Toggle, RaisedButton } from 'material-ui'
import InfoIcon from 'material-ui/svg-icons/action/info-outline'
import FlatButton from '../common/FlatButton'
import { SambaIcon, MiniDLNAIcon, BTIcon } from '../common/Svg'

const debug = Debug('component:control:SettingsApp:')

class PluginApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: '',
      expand: ''
    }

    this.toggle = (type) => {
      this.setState({ loading: type })
      setTimeout(() => {
        this.props.openSnackBar(i18n.__('Modify Plugin Settings Success'))
        this.setState({ loading: '' })
      }, 1000)
    }
  }

  componentDidMount() {
  }

  renderRow({ Icon, title, text, enabled, func }) {
    const isExpand = this.state.expand === title
    const isWIP = this.state.loading === title
    return (
      <div key={title} >
        <div
          style={{ height: 56, width: '100%', display: 'flex', alignItems: 'center', marginLeft: 24, cursor: 'pointer' }}
          onTouchTap={() => this.setState({ expand: this.state.expand === title ? '' : title })}
        >
          <div style={{ width: 40, display: 'flex', alignItems: 'center', marginRight: 8 }}>
            <Icon color="rgba(0,0,0,0.54)" />
          </div>
          <div style={{ width: 480, display: 'flex', alignItems: 'center' }}>
            { title }
          </div>
          <Toggle
            style={{ width: 64 }}
            toggled={enabled}
            onToggle={func}
            disabled={isWIP}
            onTouchTap={(e) => { e.stopPropagation(); e.preventDefault() }}
          />
          { isWIP && <CircularProgress size={16} thickness={2} /> }
        </div>
        <div style={{ height: isExpand ? 80 : 0, width: 480, overflow: 'hidden', marginLeft: 72, transition: 'all 225ms' }}>
          { text }
        </div>
      </div>
    )
  }

  render() {
    const [samba, miniDLNA, BT] = [true, true, true]
    const settings = [
      {
        Icon: SambaIcon,
        title: i18n.__('Samba Service Title'),
        text: i18n.__('Samba Service Text'),
        enabled: samba,
        func: () => this.toggle(i18n.__('Samba Service Title'))
      },
      {
        Icon: MiniDLNAIcon,
        title: i18n.__('miniDLNA Service Title'),
        text: i18n.__('miniDLNA Service Text'),
        enabled: miniDLNA,
        func: () => this.toggle(i18n.__('miniDLNA Service Title'))
      },
      {
        Icon: BTIcon,
        title: i18n.__('BT Service Title'),
        text: i18n.__('BT Service Text'),
        enabled: BT,
        func: () => this.toggle(i18n.__('BT Service Title'))
      }
    ]
    return (
      <div style={{ height: '100%', margin: 16 }}>
        <div style={{ height: 16 }} />
        { settings.map(op => this.renderRow(op)) }
      </div>
    )
  }
}

export default PluginApp
