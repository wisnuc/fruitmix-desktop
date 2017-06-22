import React from 'react'
import Radium from 'radium'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import { IconButton } from 'material-ui'
import { blue800, indigo700, indigo500, teal500 } from 'material-ui/styles/colors'
import AssistantIcon from 'material-ui/svg-icons/image/assistant'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import AddAPhoto from 'material-ui/svg-icons/image/add-to-photos'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

import Media from './Media'
import AssistantApp from '../photo/AssistantApp'
import { formatDate } from '../common/datetime'
import FlatButton from '../common/FlatButton'

const debug = Debug('component:viewModel:Media: ')
const parseDate = (date) => {
  if (!date) return 0
  const a = date.replace(/:|\s/g, '')
  return parseInt(a, 10)
}

/* increase limit of listeners of EventEmitter */
ipcRenderer.setMaxListeners(1000)

/* Extends Media to get medthods about PhotoList */
class Assistant extends Media {
  constructor(ctx) {
    super(ctx)
  }

  navGroup() {
    return 'media'
  }

  menuName() {
    return '智能助理'
  }

  menuIcon() {
    return AssistantIcon
  }

  quickName() {
    return '智能助理'
  }

  appBarStyle() {
    return 'colored'
  }

  renderNavigationMenu({ style, onTouchTap }) {
    const CustomStyle = Object.assign(style, { opacity: 1 })
    return (
      <div style={CustomStyle} ref={ref => (this.refNavigationMenu = ref)}>
        <IconButton onTouchTap={onTouchTap}>
          <NavigationMenu color="#FFF" />
        </IconButton>
      </div>
    )
  }

  renderTitle({ style }) {
    return <div style={style}> 智能助手 </div>
  }

  renderToolBar({ style }) {
    return (
      <div style={style}>
        {
          /*
            <FlatButton label="上传" onTouchTap={this.uploadMedia} primary />
          */
        }
      </div>
    )
  }

  renderContent() {
    return (<AssistantApp
      media={this.state.media}
      setPhotoInfo={this.setPhotoInfo}
      getTimeline={this.getTimeline}
      ipcRenderer={ipcRenderer}
      apis={this.apis}
      requestData={this.requestData}
      setAnimation={this.setAnimation}
      memoize={this.memoize}
      removeListToSelection={this.removeListToSelection}
      addListToSelection={this.addListToSelection}
      selectedItems={this.state.selectedItems}
      clearSelect={this.clearSelect}
      primaryColor={this.groupPrimaryColor()}
      startDownload={this.startDownload}
      removeMedia={this.removeMedia}
      hideMedia={this.hideMedia}
      getHoverPhoto={this.getHoverPhoto}
      getShiftStatus={this.getShiftStatus}
      shiftStatus={{ shift: this.state.shift, items: this.state.shiftHoverItems }}
    />)
  }
}

export default Assistant
