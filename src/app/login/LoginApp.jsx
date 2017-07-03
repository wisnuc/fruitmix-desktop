import Debug from 'debug'
import React, { Component, PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { CircularProgress } from 'material-ui'
import { indigo900, cyan500, cyan900, teal900, lightGreen900, lime900, yellow900 } from 'material-ui/styles/colors'
import RightIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import LocalLogin from './LocalLogin'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:Login')
const colorArray = [indigo900, cyan900, teal900, lightGreen900, lime900, yellow900]
const duration = 300

class LoginApp extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      local: false,
      dim: true,
      hello: true,
      error: 'wisnuc' // '', 'net', 'wisnuc'
    }

    this.toggleMode = () => {
      this.setState({ local: !this.state.local })
    }
  }

  componentDidMount() {
    setTimeout(() => this.setState({ hello: false }), 300)
  }

  renderCard() {
    return (
      <div
        style={{
          zIndex: 100,
          opacity: this.state.hello ? 0 : 1,
          transition: `opacity ${duration}ms`
        }}
      >
        {
          !this.state.error ?
            <div style={{ width: 380, height: 540, backgroundColor: '#FAFAFA' }}>
              <div style={{ width: 270, height: 270, margin: '42px auto 12px', backgroundColor: 'grey' }} />
              <div style={{ height: 24 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.87)', fontSize: 20 }}>
                请使用手机微信扫码登陆
              </div>
              <div style={{ height: 24 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.54)', fontSize: 20 }}>
                客户端远程登陆需要配合手机使用
              </div>
            </div>
            :
            <div style={{ width: 380, height: 540, backgroundColor: '#FAFAFA' }}>
              <div
                style={{
                  width: 270,
                  height: 270,
                  margin: '42px auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  width={96}
                  height={96}
                  alt=""
                  src="../src/assets/images/index/icon.png"
                  style={{ filter: 'grayscale(100%)' }}
                />
              </div>
              <div style={{ height: 24 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.87)', fontSize: 20 }}>
                { this.state.error === 'net' ? '网络连接已断开' : '云服务已断开' }
              </div>
              <div style={{ height: 24 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.54)', fontSize: 20 }}>
                { this.state.error === 'net' ? '请检查您的网络设置' : '请您稍后登录或局域网登录' }
              </div>
            </div>
        }
      </div>
    )
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
        {/*
          background: ` linear-gradient(120deg, #9E9D24 30%, #263238 0%, #64B5F6 40%, #64B5F6 60%, transparent 60%),
          linear-gradient(105deg, #64B5F6 70%, #01579B 0%, #1976D2 80%, #1976D2)`
        */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            filter: 'blur(2px)',
            opacity: this.state.hello ? 0 : 1,
            transition: `opacity ${duration}ms`
          }}
        >
          <img
            style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1000 }}
            src="../src/assets/images/index/index.jpg"
          />
        </div>

        {/* Icon */}
        <div
          style={{
            position: 'absolute',
            top: -16,
            left: 24
          }}
        >
          <img
            width={96}
            height={96}
            alt=""
            src="../src/assets/images/index/wisnuc.png"
            style={{ filter: 'brightness(5000%)' }}
          />
        </div>

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

        {/* copyright */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            color: '#FAFAFA',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          ©2016-2017 上海闻上信息科技有限公司 版权所有
        </div>

        { !this.state.local ? this.renderCard() : <LocalLogin {...this.props} />}
      </div>
    )
  }
}

export default LoginApp
