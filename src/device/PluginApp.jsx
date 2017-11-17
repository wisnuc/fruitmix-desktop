import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { CircularProgress, Divider, Toggle, RaisedButton } from 'material-ui'
import InfoIcon from 'material-ui/svg-icons/action/info-outline'
import FlatButton from '../common/FlatButton'
import { SambaIcon, MiniDLNAIcon, BTIcon } from '../common/Svg'

const debug = Debug('component:control:SettingsApp:')

class SettingsApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: '',
      expand: ''
    }

    this.toggle = (type) => {
      this.setState({ loading: type })
      setTimeout(() => {
        this.props.openSnackBar('修改成功')
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
        title: 'SAMBA服务',
        text: 'SAMBA服务是一种在局域网上共享文件和打印机的一种通信协议，它为局域网内的不同计算机之间提供文件及打印机等资源的共享服务。',
        enabled: samba,
        func: () => this.toggle('SAMBA服务')
      },
      {
        Icon: MiniDLNAIcon,
        title: 'miniDLNA服务',
        text: 'DLNA是一种多媒体远程播放技术，它允许一台显示设备直接访问并播放网络中其他DLNA设备中的图像、声音或者视频资源。',
        enabled: miniDLNA,
        func: () => this.toggle('miniDLNA服务')
      },
      {
        Icon: BTIcon,
        title: 'BT下载服务',
        text: 'BT是一种P2P下载服务，支持通过BT种子和磁力链接地址下载资源。',
        enabled: BT,
        func: () => this.toggle('BT下载服务')
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

export default SettingsApp
