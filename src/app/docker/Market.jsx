import React from 'react'
import Debug from 'debug'
import { Paper, IconButton } from 'material-ui'
import AddCirle from 'material-ui/svg-icons/content/add-circle'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:control:deviceinfo')

class Market extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    if (!this.props.docker || !this.props.docker.appstore) return <div>Loading...</div>
    const appstore = this.props.docker.appstore.result
    debug('this.props.device', appstore)
    const url = 'https://raw.githubusercontent.com/wisnuc/appifi-recipes/release/images/'
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
        <div style={{ height: 16 }} />
        <div style={{ fontWeight: 500, marginLeft: 24, color: 'rgba(0,0,0,0.87)' }}>
          推荐应用
        </div>
        <div style={{ height: 8 }} />
        <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 56px)', overflow: 'auto' }}>
          {
            appstore.map(app => (
              <Paper
                key={app.key}
                style={{ float: 'left', margin: 16, height: 266, width: 210 }}
              >
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    height={150}
                    width={150}
                    src={`${url}${app.components[0].imageLink}`}
                    alt={app.appname}
                  />
                </div>
                <div style={{ height: 34, display: 'flex', alignItems: 'center', marginLeft: 16, color: 'rgba(0,0,0,0.87)', fontWeight: 500 }}>
                  { app.appname }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', margin: '8px 0px 8px 8px' }}>
                  <FlatButton
                    label="下载并安装"
                  />
                </div>
              </Paper>
            ))
          }
          <Paper
            style={{ float: 'left', margin: 16, height: 266, width: 210 }}
          >
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconButton
                iconStyle={{ width: 90, height: 90 }}
                style={{ width: 180, height: 180, padding: 45 }}
              >
                <AddCirle color="rgba(0,0,0,0.87)" />
              </IconButton>
            </div>
          </Paper>
        </div>
      </div>
    )
  }
}

export default Market
