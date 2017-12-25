import React from 'react'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { IconButton } from 'material-ui'
import AssistantIcon from 'material-ui/svg-icons/image/assistant'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

import Media from './Media'
import AssistantApp from '../photo/AssistantApp'

const parseDate = (date) => {
  if (!date) return 0
  const a = date.replace(/:|\s/g, '')
  return parseInt(a, 10)
}

/* Extends Media to get medthods about PhotoList */
class Assistant extends Media {
  constructor(ctx) {
    super(ctx)

    this.processMedia = (media, blacklist) => {
      if (!Array.isArray(media) || !Array.isArray(blacklist)) return null

      const showBlacklist = (m, l) => {
        const bl = []
        if (!m.length || !l.length) return bl
        const map = new Map()
        m.filter(item => !!item.hash).forEach(d => map.set(d.hash, d))
        l.forEach((b) => {
          const p = map.get(b)
          if (p) bl.push(p)
        })
        return bl
      }

      /* remove photos without hash and filter media by blacklist */
      const value = showBlacklist(media, blacklist)

      /* sort photos by date */
      value.sort((prev, next) => (parseDate(next.date || next.datetime) - parseDate(prev.date || next.datetime)) || (
        parseInt(`0x${next.hash}`, 16) - parseInt(`0x${prev.hash}`, 16)))

      return value
    }
  }

  willReceiveProps(nextProps) {
    this.handleProps(nextProps.apis, ['media', 'blacklist'])
  }

  menuName() {
    return i18n.__('Assistant Menu Name')
  }

  quickName() {
    return i18n.__('Assistant Quick Name')
  }

  menuIcon() {
    return AssistantIcon
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
    const newStyle = Object.assign(style, { color: '#FFF' })
    return (
      <div style={newStyle}>
        { i18n.__('Assistant Menu Name') }
      </div>
    )
  }


  renderContent() {
    return (<AssistantApp
      media={this.processMedia(this.state.media, this.state.blacklist)}
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
      apis={this.ctx.props.apis}
    />)
  }
}

export default Assistant
