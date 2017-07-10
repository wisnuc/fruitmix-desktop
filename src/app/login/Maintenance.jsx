import React from 'react'
import Debug from 'debug'
import Radium from 'radium'
import { Avatar, CircularProgress, Divider } from 'material-ui'
import DownIcon from 'material-ui/svg-icons/action/done'
import CloudDoneIcon from 'material-ui/svg-icons/file/cloud-done'
import CloudOffIcon from 'material-ui/svg-icons/file/cloud-off'
import WifiIcon from 'material-ui/svg-icons/notification/wifi'
import LocalLogin from './LocalLogin'
import FlatButton from '../common/FlatButton'
import Checkmark from '../common/Checkmark'
import { Barcelona } from '../common/Svg'

const debug = Debug('component:Login:maintenance')
const duration = 300

class Maintenance extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount() {
  }

  render() {
    return (
      <div style={{ zIndex: 100, opacity: this.state.hello ? 0 : 1, transition: `opacity ${duration}ms` }}>
        <div style={{ width: 380, height: 468, backgroundColor: '#FAFAFA', color: 'rgba(0,0,0,0.87)' }}>
          <div style={{ marginLeft: 24 }}>
            <div style={{ height: 72, display: 'flex', alignItems: 'center', fontWeight: 500 }}>
              { '维护模式-自动检测' }
            </div>
            <div style={{ height: 72, display: 'flex', alignItems: 'center' }}>
              { '卷信息完整性' }
            </div>
            <div style={{ height: 72, display: 'flex', alignItems: 'center' }}>
              { '发现上一次启动系统' }
            </div>
            <div style={{ height: 72, display: 'flex', alignItems: 'center' }}>
              { '检测到WISNUC安装目录' }
            </div>
            <div style={{ height: 72, display: 'flex', alignItems: 'center' }}>
              { '用户信息完整性' }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Maintenance
