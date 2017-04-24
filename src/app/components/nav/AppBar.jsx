import React from 'react'

import { Paper, IconButton } from 'material-ui'
import ActionInfo from 'material-ui/svg-icons/action/info'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import SocialNotifications from 'material-ui/svg-icons/social/notifications'

/**

  prominent: true or false
  
  Title: string or component (only if prominent is true)
  Toolbar: component (a list of icons)
  
  toggleDetail: function
  openDrawer: function

**/ 
class AppBar extends React.PureComponent {

  render() {

    let color = '#FFF' // TODO

    let { prominent, title, toolbar } = this.props

    let topbarStyle = {
      width: '100%', 
      height: 48, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between'
    }

    let toolbarStyle = {
      flexGrow: 1, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'flex-end'
    }

    let titleRegionStyle = {
      width: '100%',
      height: 48,
      marginLeft: 72
    }

    return (
      <Paper style={this.props.style} rounded={false}>

        <div style={topbarStyle}>

          <div style={{flex: '0 0 12px'}} />

          {/** menu button **/}
          <IconButton onTouchTap={() => this.props.openDrawer(true)}>
            <NavigationMenu color='#FFF' />
          </IconButton>

          {/** spacer **/}
          <div style={{flex: '0 0 20px'}} />
         
          {/** non-prominent title **/} 
          { (!prominent && typeof title === 'string') && title }

          {/** context-sensitive toolbar **/}
          <div style={toolbarStyle}>
            { toolbar }
          </div>

          {/** global notification button **/}
          <IconButton>
            <SocialNotifications color={color} />
          </IconButton>

          {/** optional toggle detail button **/}
          <IconButton onTouchTap={this.props.toggleDetail}>
            <ActionInfo color={color} />
          </IconButton>

          {/** right padding **/} 
          <div style={{flex: '0 0 12px'}} />

        </div>

        { (prominent && title && typeof title === 'string') &&
          <div style={{fontSize: 20, fontWeight: 500, color: '#FFF'}}>{title}</div> }

        { (prominent && title && typeof title !== 'string') && 
          <div style={titleRegionStyle}>{title}</div> }

      </Paper>
    )
  } 
}

export default AppBar
