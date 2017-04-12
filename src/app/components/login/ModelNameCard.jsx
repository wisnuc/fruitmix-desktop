import React from 'react'
import ReactDOM from 'react-dom'

import { ipcRenderer, clipboard } from 'electron'

import { Paper } from 'material-ui'
import FlatButton from '../common/FlatButton'
import ActionOpenInBrowser from 'material-ui/svg-icons/action/open-in-browser'
import { grey500 } from 'material-ui/styles/colors'

import Barcelona from './Barcelona'
import Computer from './Computer'
import HoverNav from './HoverNav'

class ModelNameCard extends React.Component{

	serial = props => {

		let serial = '未知序列号'
		if (this.props.device.name) {
			let split = this.props.device.name.split('-')
			if (split.length === 3 && split[0] === 'wisnuc') {
				serial = split[2]
			}
		}

		return serial
	}

	model = props => {

		let model = '个人计算机'
		if (this.props.device.name) {
			let split = this.props.device.name.split('-')
			if (split.length === 3 && split[0] === 'wisnuc') {
				if (split[1] === 'ws215i') {
					model = 'WS215i'
				}
			}
		}

		return model
	}

	logoType = props => {

		let logoType = Computer

		if (this.props.device.name) {
			let split = this.props.device.name.split('-')
			if (split.length === 3 && split[0] === 'wisnuc') {
				if (split[1] === 'ws215i') {
					logoType = Barcelona
				}
			}
		}

		return logoType
	}


	render(){

		let bcolor = this.props.toggle ? grey500 : this.props.backgroundColor || '#3f51B5'
    let paperStyle = {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: bcolor,
      transition: 'all 300ms'
    }

		return (
			<div>
				<Paper id='top-half-container' style={paperStyle} rounded={false}>
          <div style={{width: '100%', display: 'flex', alignItems: 'stretch'}}>
            <HoverNav
              style={{ flex: this.props.toggle ? '0 0 24px' : '0 0 64px', transition: 'all 300ms' }}
              direction='left'
              color={bcolor}
              onTouchTap={this.props.toggle ? undefined : this.props.onNavPrev}
            />
            <div style={{flexGrow: 1, transition: 'height 300ms'}}>
              <div style={{position: 'relative', width:'100%', height: '100%'}}>
              {
                React.createElement(this.logoType(), {

                  style: this.props.toggle ?  {
                      position: 'absolute',
                      top: 12,
                      right:0,
                      transition: 'all 300ms'
                    } : {
                      position: 'absolute',
                      top: 64,
                      left: 0,
                      right: 0,
                      margin: 'auto',
                      transition: 'all 300ms'
                    },

                  fill: this.props.toggle ? 'rgba(255,255,255,0.7)' : '#FFF',
                  size: this.props.toggle ? 40 : 80
                })
              }
              <div style={{height: this.props.toggle ? 16 : 192, transition: 'height 300ms'}} />
              <div style={{position: 'relative', transition: 'all 300ms'}}>
                <div style={{
                  fontSize: this.props.toggle ? 14 : 24,
                  fontWeight: 'medium',
                  color: this.props.toggle ? 'rgba(255,255,255,0.7)' : '#FFF',
                  marginBottom: this.props.toggle ? 0 : 12,
                }}>{this.model()}</div>
                <div
                  style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onTouchTap={() =>
                    ipcRenderer.send('newWebWindow', '固件版本管理', `http://${this.props.device.address}:3001`)
                  }
                >
                  {this.props.device.address}
                  <ActionOpenInBrowser style={{marginLeft: 8}} color='rgba(255,255,255,0.7)' />
                </div>
                { !this.props.toggle &&
                  <div style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: 16
                  }}>{this.serial()}</div> }
              </div>
              </div>
            </div>
            <HoverNav
              style={{ flex: this.props.toggle ? '0 0 24px' : '0 0 64px', transition: 'all 300ms' }}
              direction='right'
              color={bcolor}
              onTouchTap={this.props.toggle ? undefined : this.props.onNavNext}
            />
          </div>
        </Paper>
			</div>
		)
	}
}

export default ModelNameCard
