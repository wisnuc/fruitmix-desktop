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

import SocialNotifications from 'material-ui/svg-icons/social/notifications'
import {blue500, pink500, yellow500, green500, grey500, blueGrey500, brown500, lightBlue500} from 'material-ui/styles/colors'
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
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'

import { sharpCurve, sharpCurveDuration, sharpCurveDelay } from '../common/motion'
import Action from '../../actions/action'

import { command } from '../../lib/command'

import FileApp from '../file/FileApp'
import ControlApp from '../control/ControlApp'
import PhotoApp from '../photo/PhotoApp';

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
            leftAvatar={<Avatar icon={<ImagePhoto />} backgroundColor={lightBlue500} />}
            onTouchTap={() => props.onLauncherSelect(PhotoApp)}
          />
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
          <ListItem style={{color: '#FFF'}}
            primaryText='设置'
            leftAvatar={<Avatar icon={<ActionSettings />} backgroundColor={blueGrey500} />}
            onTouchTap={() => props.onLauncherSelect(ControlApp)}
          />
          <ListItem style={{color: '#FFF'}}
            primaryText='应用与市场'
            leftAvatar={<Avatar icon={
              <SvgIcon viewBox="0 0 128 176">
                <path d="m 35.342575,103.40594 c -7.386153,0.40907 -12.720571,-9.266577 -7.439462,-14.894382 5.069711,-6.521328 17.337886,-2.768809 17.00382,5.785471 0.03854,5.014639 -4.675211,9.158751 -9.564358,9.108911 z M 152.84753,53.762374 c -0.93488,-8.409321 -7.15165,-14.808034 -13.66337,-19.58416 -7.73073,7.983312 -8.58014,21.433093 -2.27722,30.514852 -10.40378,6.28869 -22.73566,4.173144 -34.26638,4.554456 -33.970613,0 -67.94123,0 -101.91184709,0 -1.84691781,10.773383 -0.15488452,22.43413 5.46534669,31.881188 6.4558514,12.35342 19.2275544,20.86878 32.5949364,24.41393 17.883348,4.46994 36.924859,2.51821 54.467584,-2.56682 25.12815,-7.28259 45.88364,-26.773895 55.49194,-50.995624 10.24032,0.808494 22.00694,-2.96169 26.40672,-13.040897 2.00666,-3.882791 -7.32229,-5.019983 -10.13077,-5.927476 -4.05372,-0.568579 -8.2215,-0.294547 -12.17694,0.750551 z M 94.095053,46.475245 c -5.920792,0 -11.841584,0 -17.762376,0 0,5.920792 0,11.841584 0,17.762376 5.920792,0 11.841584,0 17.762376,0 0,-5.920792 0,-11.841584 0,-17.762376 z m 0,-22.316833 c -5.920792,0 -11.841584,0 -17.762376,0 0,5.920792 0,11.841585 0,17.762377 5.920792,0 11.841584,0 17.762376,0 0,-5.920792 0,-11.841585 0,-17.762377 z m 0,-22.7722782 c -5.920792,0 -11.841584,0 -17.762376,0 0,5.9207924 0,11.8415852 0,17.7623772 5.920792,0 11.841584,0 17.762376,0 0,-5.920792 0,-11.8415848 0,-17.7623772 z M 115.95644,46.475245 c -5.92079,0 -11.84158,0 -17.762377,0 0,5.920792 0,11.841584 0,17.762376 5.920797,0 11.841587,0 17.762377,0 0,-5.920792 0,-11.841584 0,-17.762376 z m -66.039606,0 c -5.920792,0 -11.841585,0 -17.762377,0 0,5.920792 0,11.841584 0,17.762376 5.920792,0 11.841585,0 17.762377,0 0,-5.920792 0,-11.841584 0,-17.762376 z m 22.316832,0 c -5.920792,0 -11.841585,0 -17.762377,0 0,5.920792 0,11.841584 0,17.762376 5.920792,0 11.841585,0 17.762377,0 0,-5.920792 0,-11.841584 0,-17.762376 z m -44.17822,0 c -5.920792,0 -11.841584,0 -17.762376,0 0,5.920792 0,11.841584 0,17.762376 5.920792,0 11.841584,0 17.762376,0 0,-5.920792 0,-11.841584 0,-17.762376 z m 44.17822,-22.316833 c -5.920792,0 -11.841585,0 -17.762377,0 0,5.920792 0,11.841585 0,17.762377 5.920792,0 11.841585,0 17.762377,0 0,-5.920792 0,-11.841585 0,-17.762377 z m -22.316832,0 c -5.920792,0 -11.841585,0 -17.762377,0 0,5.920792 0,11.841585 0,17.762377 5.920792,0 11.841585,0 17.762377,0 0,-5.920792 0,-11.841585 0,-17.762377 z" />
              </SvgIcon>
            } backgroundColor={lightBlue500} />}
            onTouchTap={() => ipcRenderer.send('newWebWindow', 'appifi', `http://${window.store.getState().login.device[window.store.getState().login.selectIndex].address}:3000`)}
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
    })), 1500)

		var _this = this

		ipcRenderer.send('getMediaData')
		ipcRenderer.send('getMediaShare')

    setTimeout(() => {
      //about mediaApi test function should put in here

      // createMediaShareTest()
      // mediaListThumbTest()
      // mediaShareThumbTest()
    }, 2000)

    const createMediaShareTest = () => {
      let media = storeState().media
      let mediaList = media.data.map(item => {
        console.log(item)
        return item.digest
      })
      let userList = storeState().node.server.users.forEach(item => {
        return item.uuid
      })
      ipcRenderer.send('createMediaShare',mediaList,userList,null)
    }

    const mediaListThumbTest = () => {
      let media = storeState().media
      let data = media.data
      ipcRenderer.send('getThumb',data)
    }

    const mediaShareThumbTest = () => {
      let media = storeState().media
      let mediaShare = media.mediaShare[0]
      let digest = mediaShare.digest
      let arr = mediaShare.doc.contents
      ipcRenderer.send('getAlbumThumb',arr,digest)
    }

		ipcRenderer.on('setTree',(err,tree)=>{
			this.props.dispatch(Action.setTree(tree));
		});

    ipcRenderer.on('treeChildren',(err,treeChildren)=>{
      this.props.dispatch(Action.setTree(treeChildren));
    });

		ipcRenderer.on('refreshStatusOfUpload',(err,tasks, finish)=>{
			window.store.dispatch(Action.refreshStatusOfUpload(tasks, finish));
		});

		ipcRenderer.on('refreshStatusOfDownload',(err,tasks, finish)=>{
			window.store.dispatch(Action.refreshStatusOfDownload(tasks, finish));
		})

		ipcRenderer.on('message',(err,message,code)=>{
			window.store.dispatch(Action.setSnack(message,true))
		});


		ipcRenderer.on('donwloadMediaSuccess',(err,item)=>{
			window.store.dispatch(Action.setMediaImage(item));
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
	}

}

export default Main
