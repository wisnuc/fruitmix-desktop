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
        <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 56px)', overflow: 'auto' }}>
          {
            appstore.map(app => (
              <Paper
                key={app.key}
                style={{ float: 'left', margin: 16, height: 232, width: 176 }}
              >
                <div style={{ height: 168, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    height={128}
                    width={128}
                    src={`${url}${app.components[0].imageLink}`}
                    alt={app.appname}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 16, color: 'rgba(0,0,0,0.87)' }}>
                  { app.appname }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', margin: '2px 0px 8px 8px' }}>
                  <FlatButton
                    primary
                    label="下载并安装"
                    labelStyle={{ fontSize: 11 }}
                  />
                </div>
              </Paper>
            ))
          }
          <Paper
            style={{ float: 'left', margin: 16, height: 226, width: 160 }}
          >
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconButton
                iconStyle={{ width: 80, height: 80 }}
                style={{ width: 160, height: 160, padding: 40 }}
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
