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
      if (type === 'bt') {
        const op = this.props.bt.switch ? 'close' : 'start'
        const typeText = i18n.__('BT Service Title')
        const actionText = this.props.bt.switch ? i18n.__('Stopped') : i18n.__('Started')
        this.props.apis.pureRequest('switchBT', { op }, (err) => {
          if (!err) this.props.openSnackBar(`${typeText} ${actionText}`)
          else this.props.openSnackBar(i18n.__('Operation Failed'))
          this.setState({ loading: '' })
          this.props.refresh()
        })
      } else {
        const action = this.props[type].status === 'active' ? 'stop' : 'start'
        const typeText = type === 'samba' ? i18n.__('Samba Service Title') : i18n.__('miniDLNA Service Title')
        const actionText = this.props[type].status === 'active' ? i18n.__('Stopped') : i18n.__('Started')
        this.props.apis.pureRequest('handlePlugin', { type, action }, (err) => {
          if (!err) this.props.openSnackBar(`${typeText} ${actionText}`)
          else this.props.openSnackBar(i18n.__('Operation Failed'))
          this.setState({ loading: '' })
          this.props.refresh()
        })
      }
    }
  }

  componentDidMount() {
  }

  renderRow({ key, Icon, title, text, enabled, func }) {
    const isExpand = this.state.expand === key
    const isWIP = this.state.loading === key
    return (
      <div key={title} >
        <div
          style={{ height: 56, width: '100%', display: 'flex', alignItems: 'center', marginLeft: 24, cursor: 'pointer' }}
          onTouchTap={() => this.setState({ expand: this.state.expand === key ? '' : key })}
        >
          <div style={{ width: 40, display: 'flex', alignItems: 'center', marginRight: 8 }}>
            <Icon color="rgba(0,0,0,0.54)" />
          </div>
          <div style={{ width: 560, display: 'flex', alignItems: 'center' }}>
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
        <div style={{ height: isExpand ? 80 : 0, width: 560, overflow: 'hidden', marginLeft: 72, transition: 'all 225ms' }}>
          { text }
        </div>
      </div>
    )
  }

  render() {
    const { dlna, samba, bt } = this.props
    if (!dlna || !samba) return (<div />)
    console.log('plugin this.props', this.props)

    const settings = [
      {
        key: 'samba',
        Icon: SambaIcon,
        title: i18n.__('Samba Service Title'),
        text: i18n.__('Samba Service Text'),
        enabled: samba.status === 'active',
        func: () => this.toggle('samba')
      },
      {
        key: 'dlna',
        Icon: MiniDLNAIcon,
        title: i18n.__('miniDLNA Service Title'),
        text: i18n.__('miniDLNA Service Text'),
        enabled: dlna.status === 'active',
        func: () => this.toggle('dlna')
      },
      {
        key: 'bt',
        Icon: BTIcon,
        title: i18n.__('BT Service Title'),
        text: i18n.__('BT Service Text'),
        enabled: !!bt.switch,
        func: () => this.toggle('bt')
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
