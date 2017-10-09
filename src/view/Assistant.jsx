import React from 'react'
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
  willReceiveProps(nextProps) {
    console.log('Assistant nextProps', nextProps)
    if (!nextProps.apis || !nextProps.apis.media || !nextProps.apis.blacklist) return
    const media = nextProps.apis.media
    const blacklist = nextProps.apis.blacklist
    if (media.isPending() || media.isRejected() || blacklist.isPending() || blacklist.isRejected()) return

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


    const preValue = media.value()
    const blValue = blacklist.value()

    if (preValue !== this.state.preValue || blValue !== this.state.blValue) {
      /* remove photos without hash and filter media by blacklist */
      const value = showBlacklist(preValue, blValue)
      /* sort photos by date */
      value.sort((prev, next) => (parseDate(next.datetime) - parseDate(prev.datetime)) || (
        parseInt(`0x${next.hash}`, 16) - parseInt(`0x${prev.hash}`, 16)))

      this.setState({ preValue, media: value, blValue })
    }
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
