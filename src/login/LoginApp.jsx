import React from 'react'
import Debug from 'debug'
import RightIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import LocalLogin from './LocalLogin'
import WechatLogin from './WechatLogin'
import FlatButton from '../common/FlatButton'
import { WISNUC } from '../common/Svg'

const debug = Debug('component:Login')
const duration = 300

class LoginApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = { local: true, hello: true }

    this.toggleMode = () => { this.setState({ local: !this.state.local }) }
  }

  componentDidMount() {
    document.getElementById('start-bg').style.display = 'none'
    setTimeout(() => this.setState({ hello: false }), 300)
  }

  render() {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* background */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: this.state.hello ? 0 : 1,
            transition: `opacity ${duration}ms`
          }}
        >
          <img
            style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1000 }}
            src="./assets/images/index.jpg"
            alt=""
          />
        </div>

        {/* Icon */}
        <div style={{ position: 'absolute', top: -4, left: 24 }} > <WISNUC /> </div>

        {/* change mode button */}
        <div
          style={{
            position: 'absolute',
            top: 32,
            right: 16,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <FlatButton
            label={this.state.local ? '微信扫码登录' : '局域网登录'}
            labelPosition="before"
            labelStyle={{ color: '#FAFAFA', fontWeight: 500 }}
            onTouchTap={this.toggleMode}
            icon={<RightIcon color="#FAFAFA" />}
          />
        </div>

        {/* version */}
        <div style={{ position: 'absolute', bottom: 24, left: 24, fontSize: 14, color: '#FAFAFA' }}>
          { `版本: ${global.config.appVersion}` }
        </div>

        {/* copyright */}
        <div style={{ position: 'absolute', bottom: 24, right: 24, fontSize: 14, color: '#FAFAFA' }}>
          ©2017 上海闻上信息科技有限公司 版权所有
        </div>

        {/* login card */}
        { !this.state.local ? <WechatLogin {...this.props} /> : <LocalLogin {...this.props} />}
      </div>
    )
  }
}

export default LoginApp
