import React from 'react'
import Debug from 'debug'
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover'
import { pinkA200 } from 'material-ui/styles/colors'
import { ReportProblem } from './Svg'

const debug = Debug('component:maintenance:VolumeWisnucError')

/** **

          ENOWISNUC         // wisnuc folder does not exist         // no fruitmix
          EWISNUCNOTDIR     // wisnuc folder is not a dir           // no fruitmix
          ENOFRUITMIX       // fruitmix folder does not exist       // no fruitmix
          EFRUITMIXNOTDIR   // fruitmix folder is not a dir         // no fruitmix
          ENOMODELS         // models folder does not exist         // ambiguous
          EMODELSNOTDIR     // models folder is not a dir           // ambiguous
          ENOUSERS          // users.json file does not exist       // ambiguous
          EUSERSNOTFILE     // users.json is not a file             // ambiguous
          EUSERSPARSE       // users.json parse fail                // damaged        RED
          EUSERSFORMAT      // users.json is not well formatted     // damaged        RED

 ** **/

const ReportProblemIcon = props => <ReportProblem style={{ marginRight: 8 }} {...props} />

export default class VolumeWisnucError extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      open: false,
      anchorEl: null
    }
    this.toggleList = (target) => {
      if (this.state.open === false) {
        this.setState({
          open: true,
          anchorEl: target
        })
      } else {
        this.setState({
          open: false,
          anchorEl: null
        })
      }
    }
  }

  render() {
    debug('VolumeWisnucError', this.props)
    const { boot, creatingNewVolume, volume } = this.props

    /* wisnuc is running */
    if (boot.current !== null) return (<div />)

    /* volume is Missing */
    if (volume.isMissing) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ReportProblemIcon color={this.props.creatingNewVolume === null ? pinkA200 : 'rgba(0,0,0,0.38)'} />
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: this.props.creatingNewVolume === null ? pinkA200 : 'rgba(0,0,0,0.38)'
            }}
          >
            发现有磁盘缺失
          </div>
        </div>
      )
    }

    let error = ''
    let users = []
    if (typeof volume.users === 'string') {
      error = volume.users
    } else if (typeof volume.users === 'array') {
      users = volume.users
    }

    // if (error) return <div>{ `error: ${error}, status: ${status}` }</div>

    if (users) {
      if (users.length === 0) {
        return <div>WISNUC已安装但尚未创建用户</div>
      }
      return (<div />)
    } else if (error) {
      let text
      switch (error) {
        case 'ENOALT' :
          text = 'WISNUC未安装'; break
        case 'EDATA':
          text = 'WISNUC未正确安装，用户信息未找到或不能正确解析'; break
        case 'EFAIL':
          text = 'WISNUC未正确安装，无法正常启动'; break
      }
      return (
        <div style={{ display: 'flex' }}>
          <ReportProblemIcon color={this.props.creatingNewVolume === null ? pinkA200 : 'rgba(0,0,0,0.38)'} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 14,
              fontWeight: 500,
              color: this.props.creatingNewVolume === null ? pinkA200 : 'rgba(0,0,0,0.38)'
            }}
          >{ text }
          </div>
        </div>
      )
    } else if (0) {
      return (
        <div style={{ display: 'flex' }}>
          <ReportProblemIcon color={this.props.creatingNewVolume === null ? pinkA200 : 'rgba(0,0,0,0.38)'} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 14,
              fontWeight: 500,
              color: this.props.creatingNewVolume === null ? pinkA200 : 'rgba(0,0,0,0.38)'
            }}
            onTouchTap={(e) => {
              e.stopPropagation()
              this.toggleList(e.currentTarget)
            }}
          >
            <div>检测WISNUC时遇到问题</div>
            <Popover
              open={this.state.open}
              anchorEl={this.state.anchorEl}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              targetOrigin={{ horizontal: 'left', vertical: 'top' }}
              onRequestClose={() => this.setState({ open: false, anchorEl: null })}
              animated={false}
              animation={PopoverAnimationVertical}
            >
              <div style={{ width: 240, margin: 8 }}>
                文件系统存在{'wisnuc/fruitmix'}目录，但是
                {
                  error === 'ENOMODELS' ? '没有models目录' :
                    error === 'EMODELS' ? 'models不是目录' :
                    error === 'ENOUSERS' ? '没有users.json文件' :
                    error === 'EUSERSNOTFILE' ? 'users.json不是文件' :
                    error === 'EUSERSPARSE' ? 'users.json无法解析，不是合法的json格式' :
                    error === 'EUSERSFORMAT' ? 'users.json文件内部数据格式错误' : '未知的错误'
                }
              </div>
            </Popover>
          </div>
        </div>
      )
    }
    return <div />
  }
}
