import React from 'react'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { IconButton } from 'material-ui'
import AssistantIcon from 'material-ui/svg-icons/image/assistant'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

import Media from './Media'
import AssistantApp from '../photo/AssistantApp'

/* Extends Media to get medthods about PhotoList */
class Assistant extends Media {
  constructor(ctx) {
    super(ctx)

    this.processMedia = (media, blacklist) => {
      if (!Array.isArray(media) || !Array.isArray(blacklist)) return null

      /* data not change */
      if (media === this.preMedia && blacklist === this.preBL && this.value) return this.value

      /* store data */
      this.preMedia = media
      this.preBL = blacklist

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
      this.value = showBlacklist(media, blacklist)

      /* formate date */
      this.value.forEach((v) => {
        let date = v.date || v.datetime
        if (!date || date.search(/:/g) !== 4 || date.search(/^0/) > -1) date = ''
        v.date = date
      })

      /* sort photos by date */
      this.value.sort((prev, next) => next.date.localeCompare(prev.date))

      console.log('Assistant finished', (new Date()).getTime() - this.timeFlag)
      return this.value
    }
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
      media={this.media}
      ipcRenderer={ipcRenderer}
      apis={this.ctx.props.apis}
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
