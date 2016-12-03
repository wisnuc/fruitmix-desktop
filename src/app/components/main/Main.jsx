/**
 * @component Main
 * @description main interface
 * @time 2016-4-26
 * @author liuhua
 **/
import { ipcRenderer } from 'electron'

import React from 'react';

import {Avatar, Menu, Paper, Snackbar, MenuItem, IconButton, Divider, 
  Subheader, List, ListItem } from 'material-ui';

import SocialNotifications from 'material-ui/svg-icons/social/notifications'
import {blue500, pink500, yellow500, green500, gray500} from 'material-ui/styles/colors'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import NavigationApps from 'material-ui/svg-icons/navigation/apps'
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less'
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'

import FileFolder from 'material-ui/svg-icons/file/folder'
import ImagePhoto from 'material-ui/svg-icons/image/photo'
import ImagePhotoAlbum from 'material-ui/svg-icons/image/photo-album'
import ImagePortrait from 'material-ui/svg-icons/image/portrait'

import { sharpCurve, sharpCurveDuration, sharpCurveDelay } from '../common/motion'
import Action from '../../actions/action'

import { command } from '../../lib/command'

import FileApp from '../file/FileApp'
import ControlApp from '../control/ControlApp'

//import CSS
import css  from  '../../../assets/css/main';

const storeState = () => window.store.getState()

const appMap = new Map()

const TopBar = (props) => (

  <div style={props.style}>
    <Paper style={{ 
      height: '100%', backgroundColor: '#FFF',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
    }}>
      <div style={{marginLeft: 72, width: (210 - 72), fontSize: 16, opacity:0.54}}>闻上云管家</div>
      
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      <Avatar style={{marginRight: 16, flex: '0 0 32px'}} src="../src/assets/custom/images/romantic_dog.jpg" size={32} />
      
      <div style={{flex:'1 0'}} />

      <IconButton iconStyle={{opacity: 0.54}}><NavigationApps /></IconButton>
      <IconButton iconStyle={{opacity: 0.54}}><ActionSettings /></IconButton> 
      <IconButton iconStyle={{opacity: 0.54}}><SocialNotifications /></IconButton>
      <IconButton iconStyle={{opacity: 0.54}}><ActionAccountCircle /></IconButton>
      <div style={{width: 64}} />
    </Paper>
  </div>
)

const systemPaneWidth = 320

const SystemDrawer = (props) => {
  return (
    <div style={props.style}>
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
          <div style={{marginLeft: 72, fontSize: 21, fontWeight: 'medium', opacity: props.resizing ? 0 : 1}}>闻上云管家</div>
        </div>
        <Divider style={{backgroundColor: '#353535' }}/>
        <div>
        <List style={{color: '#FFF'}}>
          <Subheader style={{color: '#7EC7C0', fontWeight: 'medium'}}>应用</Subheader>
          <ListItem style={{color: '#FFF'}}
            primaryText='文件'
            leftAvatar={<Avatar icon={<FileFolder />} backgroundColor={blue500} />}
            onTouchTap={() => props.onLauncherSelect(FileApp)}
          />
          <ListItem style={{color: '#FFF'}}
            primaryText='照片'
            leftAvatar={<Avatar icon={<ImagePhoto />} backgroundColor={pink500} />}
          />
          <ListItem style={{color: '#FFF'}}
            primaryText='相册'
            leftAvatar={<Avatar icon={<ImagePhotoAlbum />} backgroundColor={yellow500} />}
          />
          <ListItem style={{color: '#FFF'}}
            primaryText='分享'
            leftAvatar={<Avatar icon={<ImagePortrait />} backgroundColor={green500} />}
          />
          <ListItem style={{color: '#FFF'}}
            primaryText='系统设置'
            leftAvatar={<Avatar icon={<ActionSettings />} backgroundColor={gray500} />}
            onTouchTap={() => props.onLauncherSelect(ControlApp)}
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

const toggleAppBar = () => window.store.dispatch({ type: 'TOGGLE_APPBAR' })

class Main extends React.Component {

	constructor(props) {
    super(props)

    this.state = { 
      currentApp: FileApp, 
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

        <SystemDrawer 
          style={{
            position: 'absolute',
            width: 320,
            height: '100%',
            right: showAppBar ? 0 : -320,
            transition: sharpCurve('right')
          }}
          resizing={this.state.resizing}
          onLauncherSelect={this.onLauncherSelect}
        />

        <IconButton 
          style={{position: 'absolute', 
            top: (56 - 48 ) / 2,
            transition: sharpCurve('top'),
            right: 0,
            zIndex: 10000
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
          open={storeState().snack.open} 
          message={storeState().snack.text} 
          autoHideDuration={3000} 
          onRequestClose={() => window.store.dispatch() /* TODO */}
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
    })), 1500)

		var _this = this

    // fileNav('HOME_DRIVE', null)

		// ipcRenderer.send('getRootData')
		ipcRenderer.send('getMediaData')
		// ipcRenderer.send('getMoveData')
		// ipcRenderer.send('getFilesSharedToMe')
		// ipcRenderer.send('getFilesSharedToOthers')
		ipcRenderer.send('getMediaShare')
    setTimeout(() => {
      ipcRenderer.send('getThumb',[storeState().media.data[0],storeState().media.data[1],storeState().media.data[2]])
    },2000)

		// this.props.dispatch(Action.filesLoading());

		// ipcRenderer.on('receive',function (err,dir,children,path) {
		// 	_this.props.dispatch(Action.setDirctory(dir,children,path))
		// });
		ipcRenderer.on('setTree',(err,tree)=>{
			this.props.dispatch(Action.setTree(tree));
		});

		// ipcRenderer.on('uploadSuccess',(err,file,children)=>{
		// 		this.props.dispatch(Action.refreshDir(children));
		// });

		// ipcRenderer.on('setShareChildren',(err,shareChildren,sharePath)=>{
		// 	this.props.dispatch(Action.setShareChildren(shareChildren,sharePath));
		// });

		ipcRenderer.on('refreshStatusOfUpload',(err,tasks)=>{
			this.props.dispatch(Action.refreshStatusOfUpload(tasks));
		});

		ipcRenderer.on('refreshStatusOfDownload',(err,file,status)=>{
			this.props.dispatch(Action.refreshStatusOfDownload(file,status));
		})

		// ipcRenderer.on('refreshDownloadStatusOfFolder',(err,key,status)=>{
		// 	this.props.dispatch(Action.refreshDownloadStatusOfFolder(key,status));
		// });

		// ipcRenderer.on('refreshUploadStatusOfFolder',(err,key,status)=>{
		// 	this.props.dispatch(Action.refreshUploadStatusOfFolder(key,status));
		// });


		ipcRenderer.on('deleteSuccess',(err,obj,children,dir)=>{
			if (dir.uuid == storeState().data.directory.uuid) {
				this.props.dispatch(Action.refreshDir(children));
			}
		});

		ipcRenderer.on('message',(err,message,code)=>{
			this.props.dispatch(Action.setSnack(message,true));
			switch(code) {
				case 1:
					this.props.dispatch(Action.getDataFailed());
			}
		});

		ipcRenderer.on('treeChildren',(err,treeChildren)=>{
			this.props.dispatch(Action.setTree(treeChildren));
		});
		//media--------------------------------------------------------------------------
		// ipcRenderer.on('mediaFinish',(err,media)=>{
		// 	this.props.dispatch(Action.setMedia(media));
		// });

		// ipcRenderer.on('getThumbSuccess',(err,item,path)=>{
		// 	this.props.dispatch(Action.setThumb(item,path,'ready'));
		// });

		// ipcRenderer.on('getThumbFailed',(err,item)=>{
		// 	this.props.dispatch(Action.setThumb(item,'failed'));
		// });

		ipcRenderer.on('donwloadMediaSuccess',(err,item)=>{
			window.store.dispatch(Action.setMediaImage(item));
		});

		// ipcRenderer.on('mediaShare', (err,data) => {
		// 	this.props.dispatch(Action.setMediaShare(data))
		// })

		// ipcRenderer.on('getShareThumbSuccess', (err, item, path) => {
		// 	this.props.dispatch(Action.setShareThumb(item,path))
		// })

		//transmission---------------------------------------------------------------------
		// ipcRenderer.on('transmissionDownload',(err,obj)=>{
		// 	this.props.dispatch(Action.addDownload(obj));
		// });

		// ipcRenderer.on('transmissionUpload',(err,obj)=>{
		// 	this.props.dispatch(Action.addUpload(obj));
		// });

		ipcRenderer.on('setUsers',(err,user)=>{
			this.props.dispatch({type:'SET_USER',user:user});
		});

		ipcRenderer.on('setDownloadPath',(err,path)=>{
			this.props.dispatch({type:'SET_DOWNLOAD_PATH',path:path});
		})

		ipcRenderer.on('setMoveData', (err,data) => {
			this.props.dispatch(Action.setMoveData(data))
		})

		setTimeout(()=>{
		},2000)
	}

}

export default Main


