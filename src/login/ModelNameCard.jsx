import React from 'react'
import { ipcRenderer } from 'electron'
import { Paper } from 'material-ui'
import ActionOpenInBrowser from 'material-ui/svg-icons/action/open-in-browser'
import { grey500 } from 'material-ui/styles/colors'

import Barcelona from './Barcelona'
import Computer from './Computer'
import HoverNav from './HoverNav'

class ModelNameCard extends React.Component {
  serial = () => {
    let serial = '未知序列号'
    if (this.props.device.name) {
      const split = this.props.device.name.split('-')
      if (split.length === 3 && split[0] === 'wisnuc') {
        serial = split[2]
      }
    }

    return serial
  }

  model = () => (this.props.ws215i ? 'WS215i' : ' 个人计算机')

  logoType = () => (this.props.ws215i ? Barcelona : Computer)

  render() {
    const bcolor = this.props.toggle ? '#FAFAFA' : this.props.backgroundColor || '#3f51B5'
    const paperStyle = {
      // height: this.props.toggle ? '' : 404,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: bcolor,
      transition: 'all 300ms'
    }

    return (
      <Paper id="top-half-container" style={paperStyle} rounded={false}>
        <div style={{ width: '100%', display: 'flex', alignItems: 'stretch' }}>
          <HoverNav
            style={{ flex: this.props.toggle ? '0 0 24px' : '0 0 64px', transition: 'all 300ms', zIndex: 100 }}
            direction="left"
            color={bcolor}
            onTouchTap={this.props.toggle ? undefined : this.props.onNavPrev}
          />
          <div style={{ flexGrow: 1, transition: 'height 300ms' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {
                React.createElement(this.logoType(), {

                  style: this.props.toggle ? {
                    position: 'absolute',
                    top: 12,
                    right: 0,
                    transition: 'all 300ms'
                  } : {
                    position: 'absolute',
                    top: 64,
                    left: 0,
                    right: 0,
                    margin: 'auto',
                    transition: 'all 300ms'
                  },

                  fill: this.props.toggle ? 'rgba(0,0,0,0.54)' : '#006064',
                  size: this.props.toggle ? 40 : 80
                })
              }
              <div style={{ height: this.props.toggle ? 20 : 192, transition: 'height 300ms' }} />
              <div style={{ position: 'relative', transition: 'all 300ms', marginLeft: this.props.toggle ? 0 : -40 }}>
                <div
                  style={{
                    fontSize: this.props.toggle ? 14 : 24,
                    fontWeight: 500,
                    color: this.props.toggle ? 'rgba(0,0,0,0.54)' : 'rgba(0,0,0,0.87)',
                    marginBottom: this.props.toggle ? 4 : 12
                  }}
                >
                  { this.props.name || '闻上盒子' }
                </div>
                {
                  !this.props.toggle &&
                    <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.54)', marginBottom: 8 }}> { this.model() } </div>
                }
                <div
                  style={{
                    fontSize: 14,
                    color: 'rgba(0,0,0,0.54)',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  { this.props.device.address }
                  {
                    /*
                        onTouchTap={() => ipcRenderer.send('newWebWindow', '固件版本管理', `http://${this.props.device.address}:3001`) }
                        <ActionOpenInBrowser style={{ marginLeft: 8 }} color="rgba(0,0,0,0.54)" />
                        */
                  }
                </div>
              </div>
            </div>
          </div>
          <HoverNav
            style={{ flex: this.props.toggle ? '0 0 24px' : '0 0 64px', transition: 'all 300ms' }}
            direction="right"
            color={bcolor}
            onTouchTap={this.props.toggle ? undefined : this.props.onNavNext}
          />
        </div>
      </Paper>
    )
  }
}

export default ModelNameCard
