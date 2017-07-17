import React from 'react'
import Debug from 'debug'
import { CircularProgress, Divider } from 'material-ui'
import { cyan600, grey200 } from 'material-ui/styles/colors'
import FlatButton from '../common/FlatButton'
import Checkmark from '../common/Checkmark'
import DialogOverlay from '../common/DialogOverlay'

const debug = Debug('component:control:power:')

class Update extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      confirm: false,
    }

    this.install = () => {
      this.props.api.request()
      debug('this.install')
    }

    this.toggleDialog = (op) => {
      this.setState({ [op]: !this.state[op] })
    }
  }

  render() {
    const { firm, showRel, latest, installed, toggleDetail } = this.props
    debug('render!', this.props)
    // if (!firm) return (<div />)
    const current = {}

    this.rel = showRel
    return (
      <div style={{ height: '100%', margin: 16 }}>
        <div style={{ width: '100%', height: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 34, color: cyan600 }}>
            { '1.9.6 (beta)' }
            <div style={{ width: 8 }} />
            <div style={{ width: 8 }} />
            <div style={{ fontSize: 14, height: 40 }}>
              <div style={{ height: 16 }} />
              { '最新稳定版' }
            </div>
          </div>
          <div style={{ height: 8 }} />
          <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }}>
            { `发布日期：2017年02月30日` }
          </div>
        </div>

        <div style={{ height: 24 }} />
        <div style={{ color: 'rgba(0,0,0,0.54)', height: 36, display: 'flex', alignItems: 'center' }}>
          {
            1 ? '已安装的版本'
            : <FlatButton
              style={{ marginLeft: -8 }}
              label="安装并使用"
              onTouchTap={() => this.toggleDialog('confirm')}
              primary
            />
          }
        </div>
        <div style={{ height: 48 }} />
        <div style={{ fontWeight: 500, height: 56, display: 'flex', alignItems: 'center' }}>
          { '更新内容：' }
        </div>
        {
          current.body ? current.body.split(/[1-9]\./).map(list => list && (
            <div style={{ marginLeft: 24, height: 40, display: 'flex', alignItems: 'center' }} key={list}>
              { '*' }
              <div style={{ width: 16 }} />
              { list }
            </div>
          ))
          : (
            <div style={{ marginLeft: 24, height: 40, display: 'flex', alignItems: 'center' }}>
              { '*' }
              <div style={{ width: 16 }} />
              { '修复bugs' }
            </div>
          )
        }

        {/* dialog */}
        <DialogOverlay open={this.state.confirm} >
          {
            this.state.confirm &&
              <div style={{ width: 560, padding: '24px 24px 0px 24px' }}>
                <div style={{ fontSize: 21, fontWeight: 500 }}>
                  { '固件安装' }
                </div>
                <div style={{ height: 20 }} />
                <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }}>
                  { `将要为您安装版本号为 ${this.rel.tag_name} 的固件程序。` }
                </div>
                <div style={{ height: 8 }} />
                <div style={{ color: 'rgba(0,0,0,0.54)', fontSize: 14 }} >
                  { '固件安装后需要重启WISNUC系统，客户端将退出至登录界面，需重新登录。' }
                </div>
                <div style={{ height: 24 }} />
                <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                  <FlatButton
                    label="取消"
                    primary
                    onTouchTap={() => this.toggleDialog('confirm')}
                  />
                  <FlatButton
                    label={'安装'}
                    primary
                    onTouchTap={this.install}
                  />
                </div>
              </div>
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default Update
