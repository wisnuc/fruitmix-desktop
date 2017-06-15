import React from 'react'
import { AppBar, IconButton } from 'material-ui'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'
import { CatSilhouette, BallOfYarn } from './Svg'

const RenderTitle = props => (
  <div style={{ position: 'absolute', width: '100%' }} >
    <AppBar
      style={{ position: 'absolute', height: 136, width: 'calc(100% - 6px)', marginLeft: -8, marginTop: -8 }}
      showMenuIconButton={false}
      zDepth={2}
      iconElementRight={
        <IconButton onTouchTap={() => props.nav('login')}>
          <ActionExitToApp />
        </IconButton>}
    />
    <CatSilhouette
      style={{ position: 'absolute', top: 34, left: 48, width: 120, height: 114, zIndex: 1200 }}
      color="#E0E0E0"
    />
    <div style={{ margin: 'auto', marginTop: 72, width: 1200, display: 'flex', alignItems: 'center' }} >
      <BallOfYarn style={{ width: 24, height: 24, marginLeft: 24, zIndex: 1100 }} color="#FFF" />
      <div style={{ fontSize: 34, color: '#FFF', marginLeft: 36, zIndex: 1100 }} >
          WISNUC - { !props.state.boot ? '' :
              props.state.boot.state === 'maintenance' ? '维护模式' : '已正常启动'
          }
      </div>
    </div>
  </div>
)

export default RenderTitle
