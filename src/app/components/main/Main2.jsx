import React from 'react'
import { Paper, IconButton } from 'material-ui'

import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import NavigationApps from 'material-ui/svg-icons/navigation/apps'
import SocialNotifications from 'material-ui/svg-icons/social/notifications'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'

/**
  AppBar may have 
  1. bgcolor, title color, icon color, show detail yes or no
  2. title, may be text or region, if region, height
  3. a list of menu command, icon, disabled, command
  4.  
**/ 
class AppBar extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      prominent: false
    }
  }

  render() {
    return (
      <Paper style={this.props.style} rounded={false}>
        <div style={{width: '100%', height: '100%', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{flex: '0 0 12px'}} />
          <IconButton><NavigationMenu /></IconButton>
          <div style={{flex: '0 0 20px'}} />
          <div style={{fontSize: 24}}>文件</div>
          <div style={{flexGrow: 1}} />
          <IconButton><NavigationApps /></IconButton>
          <IconButton><SocialNotifications /></IconButton>
          <IconButton><ActionExitToApp /></IconButton>
          <div style={{flex: '0 0 12px'}} />
        </div>
      </Paper>
    )
  } 
}

class SampleApp extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      showDetail: false
    }
  }

  render() {
    return (
      <div style={{width: '100%', height: '100%', display: 'flex'}}>
        <div style={{width: 72, height: '100%'}} />
        <div style={{flexGrow: 1, height: '100%', backgroundColor: '#FAFAFA',
          borderRight: 'thin solid #EEEEEE'}}>
          <div style={{width: '100%', height: 64, 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{marginLeft: 8, fontSize: 20}}>{'hello > world > hello > world'}</div>
            <IconButton 
              style={{marginRight: 12}}
              onTouchTap={() => this.setState({showDetail: !this.state.showDetail})}>
              <ActionExitToApp />
            </IconButton>
          </div>
        </div>
        <div style={{width: this.state.showDetail ? 400 : 0, height: '100%', 
          backgroundColor: '#FFFFFF', transition: 'width 300ms'}} />
      </div>
    )
  }
}

class Main extends React.Component {

  constructor(props) {
    super(props)

    this.barHeight = 64
    this.state = {}
  }

  render() {
    return (
      <div style={{width: '100%', height: '100%'}}>
        <AppBar style={{position: 'absolute', width: '100%', height: this.barHeight}} />
        <div style={{width: '100%', height: this.barHeight}} />
        <div style={{width: '100%', height: `calc(100% - ${this.barHeight}px)`, 
          overflow: 'hidden'}}>
          <SampleApp />
        </div>
      </div>
    )
  }
}

export default Main




