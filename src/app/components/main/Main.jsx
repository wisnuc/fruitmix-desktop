/**
 * @component Main
 * @description main interface
 * @time 2016-4-26
 * @author liuhua
 **/
import { ipcRenderer } from 'electron'

import React from 'react';

import {Avatar, Menu, Paper, Snackbar, MenuItem, IconButton, Divider,
  Subheader, List, ListItem, SvgIcon} from 'material-ui';

import {blue500, pink500, yellow500, green500, grey500, blueGrey500, brown500, lightBlue500} from 'material-ui/styles/colors'
import NavigationApps from 'material-ui/svg-icons/navigation/apps'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import ActionSettings from 'material-ui/svg-icons/action/settings'

import FileFolder from 'material-ui/svg-icons/file/folder'
import ImagePhoto from 'material-ui/svg-icons/image/photo'
import ImagePhotoAlbum from 'material-ui/svg-icons/image/photo-album'
import ImagePortrait from 'material-ui/svg-icons/image/portrait'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'

import { sharpCurve, sharpCurveDuration, sharpCurveDelay } from '../common/motion'
import Action from '../../actions/action'

import { command } from '../../lib/command'

import FileApp from '../file/FileApp'
import ControlApp from '../control/ControlApp'
import PhotoApp from '../photo/PhotoApp';

import DockerIcon from './DockerIcon'

import css  from  '../../../assets/css/main';

const storeState = () => window.store.getState()

const appMap = new Map()

const systemPaneWidth = 320

class SystemDrawer extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div style={this.props.style}>
        <Paper
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#36474F'
          }}
          transitionEnabled={false}
          rounded={false}
          zDepth={3}
        >
          <div style={{height: 56, display: 'flex', alignItems: 'center',
            color: '#FFF', backgroundColor: '#36474F', }}>
            <div style={{marginLeft: 72, fontSize: 21, fontWeight: 'medium', opacity: this.props.resizing ? 0 : 1}}>闻上云管家</div>
          </div>
          <Divider style={{backgroundColor: '#353535' }}/>
          <div>
          <List style={{color: '#FFF'}}>
            <Subheader style={{color: '#7EC7C0', fontWeight: 'medium'}}>应用</Subheader>
            <ListItem style={{color: '#FFF'}}
              primaryText='文件'
              leftAvatar={<Avatar icon={<FileFolder />} backgroundColor={blue500} />}
              onTouchTap={() => this.props.onLauncherSelect(FileApp)}
            />
            <ListItem style={{color: '#FFF'}}
              primaryText='照片'
              leftAvatar={<Avatar icon={<ImagePhoto />} backgroundColor={lightBlue500} />}
              onTouchTap={() => this.props.onLauncherSelect(PhotoApp)}
            />
{/*
            <ListItem style={{color: 'rgba(255,255,255,0.7)'}}
              primaryText='相册（暂不可用）'
              leftAvatar={<Avatar icon={<ImagePhotoAlbum />} backgroundColor={grey500} />}
              disabled={true}
            />
            <ListItem style={{color: 'rgba(255,255,255,0.7)'}}
              primaryText='分享（暂不可用）'
              leftAvatar={<Avatar icon={<ImagePortrait />} backgroundColor={grey500} />}
              disabled={true}
            />
*/}
            <ListItem style={{color: '#FFF'}}
              primaryText='设置'
              leftAvatar={<Avatar icon={<ActionSettings />} backgroundColor={blueGrey500} />}
              onTouchTap={() => this.props.onLauncherSelect(ControlApp)}
            />
            <ListItem style={{color: '#FFF'}}
              primaryText='应用与市场'
              leftAvatar={<Avatar icon={<DockerIcon />}  backgroundColor={lightBlue500} />}
              onTouchTap={() => 
                ipcRenderer.send('newWebWindow', 'appifi', `http://${window.store.getState().login.device.address}:3000`)}
            />
            <ListItem style={{color: '#FFF'}}
              primaryText='退出登录'
              leftAvatar={<Avatar icon={<ActionExitToApp />} backgroundColor={brown500} />}
              onTouchTap={() => {window.store.dispatch({type:'LOGIN_OFF'});ipcRenderer.send('loginOff')}}
            />
            <div style={{height: 8}} />
            <Divider style={{backgroundColor: '#353535'}}/>
            <Subheader style={{color: '#7EC7C0', fontWeight: 'medium'}}>通知</Subheader>
          </List>
          </div>
        </Paper>
      </div>
    )
  }
}

const toggleAppBar = () => window.store.dispatch({ type: 'TOGGLE_APPBAR' })

class Main extends React.Component {

	constructor(props) {
    super(props)

    this.state = {
      currentApp: PhotoApp,
      showAppBar: true,
      resizing: false
    }

    this.toggleAppBar = () => {
      this.setState({
        showAppBar: !this.state.showAppBar,
        resizing: true
      })
      setTimeout(() => this.setState({
        resizing: false
      }), sharpCurveDuration * 2)
    }

    this.onLauncherSelect = (app) => {
      if (app === this.state.currentApp) return
      this.setState(Object.assign({}, this.state, { currentApp: app }))
    }
  }

	render() {

    const topBarHeight = 48
    const showAppBar = this.state.showAppBar

    const appProps = {
      maximized: !showAppBar,
      resizing: this.state.resizing,
      nudge: true
    }

    return (

      <div style={{width: '100%', height: '100%'}}>
        <div style={{
            position: 'absolute',
            // width: showAppBar ? 'calc(100% - 320px)': '100%',
            width: '100%',
            height: '100%',
            transition: sharpCurve('all'),
            overflow: 'hidden'
        }}>
          { React.createElement(this.state.currentApp, appProps, null) }
        </div>

        { showAppBar &&
        <div style={{
          position: 'fixed',
          width: '100%', height: '100%', top: 0, left: 0,
          zIndex: 999
          }}

          onTouchTap={this.toggleAppBar}
        />
        }
        <SystemDrawer
          style={{
            position: 'absolute',
            width: 320,
            height: '100%',
            right: showAppBar ? 0 : -320,
            transition: sharpCurve('right'),
            zIndex: 1000
          }}
          resizing={this.state.resizing}
          onLauncherSelect={this.onLauncherSelect}
        />

        <IconButton
          style={{position: 'absolute',
            top: (56 - 48 ) / 2,
            transition: sharpCurve('top'),
            right: 0,
            zIndex: 1000
          }}

          iconStyle={showAppBar ?
            ({color: '#FFF', opacity: 1}) :
            ({color: '#FFF', opacity: 1})
          }
          onTouchTap={this.toggleAppBar}
        >
          { showAppBar ? <NavigationChevronRight /> : <NavigationApps /> }
        </IconButton>

        <Snackbar
          style={{textAlign:'center'}}
          open={window.store.getState().snack.open}
          message={window.store.getState().snack.text}
          autoHideDuration={3000}
          onRequestClose={() => window.store.dispatch({ type: 'CLEAN_SNACK' })}
        />
      </div>
	  )
	}

	//close snackbar
	cleanSnack() {
		this.props.dispatch(Action.cleanSnack());
	}

	componentDidMount() {

    setTimeout(() => this.setState(Object.assign({}, this.state, {
      showAppBar: false
    })), 5000)

/**

		var _this = this
		ipcRenderer.send('getMediaData')
		ipcRenderer.send('getMediaShare')
    ipcRenderer.send('GET_TRANSMISSION')

		ipcRenderer.on('refreshStatusOfUpload',(err,tasks, finish)=>{
			window.store.dispatch(Action.refreshStatusOfUpload(tasks, finish));
		});

		ipcRenderer.on('refreshStatusOfDownload',(err,tasks, finish)=>{
			window.store.dispatch(Action.refreshStatusOfDownload(tasks, finish));
		})

    ipcRenderer.on('UPDATE_UPLOAD', (err, userTasks, finishTasks) => {
      window.store.dispatch({
        type : 'UPDATE_UPLOAD',
        userTasks,
        finishTasks
      })
    })

    ipcRenderer.on('UPDATE_DOWNLOAD', (err, userTasks, finishTasks) => {
      window.store.dispatch({
        type : 'UPDATE_DOWNLOAD',
        userTasks,
        finishTasks
      })
    })

		ipcRenderer.on('message',(err,message,code)=>{
			window.store.dispatch(Action.setSnack(message,true))
		});

		ipcRenderer.on('setUsers',(err,user)=>{
			this.props.dispatch({type:'SET_USER',user:user});
		});

		ipcRenderer.on('setDownloadPath',(err,path)=>{
			this.props.dispatch({type:'SET_DOWNLOAD_PATH',path:path});
		})

		ipcRenderer.on('setMoveData', (err,data) => {
			this.props.dispatch(Action.setMoveData(data))
		})
**/
	}
}

export default Main
