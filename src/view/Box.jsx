import React from 'react'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import { IconButton } from 'material-ui'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

import Base from './Base'
import FlatButton from '../common/FlatButton'
import { combineElement, removeElement } from '../common/array'
import Inbox from '../box/Inbox'

/* increase limit of listeners of EventEmitter */
ipcRenderer.setMaxListeners(1000)

class Box extends Base {
  constructor(ctx) {
    super(ctx)
    this.state = {
    }

    this.setAnimation = (component, status) => {
      if (component === 'NavigationMenu') {
        /* add animation to NavigationMenu */
        const transformItem = this.refNavigationMenu
        const time = 0.4
        const ease = global.Power4.easeOut
        if (status === 'In') {
          TweenMax.to(transformItem, time, { rotation: 180, opacity: 1, ease })
        }
        if (status === 'Out') {
          TweenMax.to(transformItem, time, { rotation: -180, opacity: 0, ease })
        }
      }
    }
  }

  willReceiveProps(nextProps) {
    this.data = [
      {
        type: 'list', // 1 media
        comment: 'hello',
        ctime: 1515996423183,
        index: 0,
        tweeter: {
          id: 'ocMvos6NjeKLIBqg5Mr9QjxrP1FA',
          wx: [],
          avatarUrl: 'http://wx.qlogo.cn/mmopen/vi_32/tetOhypdu92cqPgqOelJWlIqq6wosy4XIAu1ooc2tHweTB3KrKXnibtupeWIaseoADnwLvt8ibRjBCgEXPlic0qYQ/0'
        },
        list: [
          {
            hash: 'sahjfwiuefjhsdkfhwef',
            metadata: { height: 600, width: 300 }
          }
        ],
        uuid: 'ff5d42b9-4b8f-452d-a102-ebfde5cdf948'
      },
      {
        type: 'list', // 1 file + 1 media
        comment: 'hello loooooooooooooooooong',
        ctime: 1515996433183,
        index: 1,
        tweeter: {
          id: 'ocMvos6NjeKLIBqg5Mr9QjxrP1FA',
          wx: [],
          avatarUrl: 'http://wx.qlogo.cn/mmopen/vi_32/9DBUNd9N1QOQoJps1KGD3rUc3YRGbzLWeQzKXWzrE7Def0yXjdutvbsaF1FgnY5ibDz96G7qUHddrCfAOPQyCKQ/0'
        },
        list: [
          {
            hash: 'sahjfwiuefjhsdkfhwef',
            metadata: { height: 600, width: 300 }
          },
          {
            hash: 'asdfwsdfasdasds',
            name: 'testfile'
          }
        ],
        uuid: 'ff5d42b9-4b8f-452d-a102-ebfde5cdf947'
      },
      {
        type: 'list', // 2 media
        comment: '23232323',
        ctime: 1515996443183,
        index: 2,
        tweeter: { id: 'ocMvos6NjeKLIBqg5Mr9QjxrP1FA', wx: [] },
        list: [
          {
            hash: 'sahjfsfdfsdfsdfsdfhsdkfhwef',
            metadata: { height: 300, width: 600 }
          },
          {
            hash: 'sahjfssdfsdfsfdsf',
            metadata: { height: 300, width: 600 }
          }
        ],
        uuid: 'ff5d42b9-4b8f-452d-a102-ebfde5cdf946'
      },
      {
        type: 'list', // 2 file
        comment: '世界的发改委i色块的',
        ctime: 1515996453183,
        index: 3,
        tweeter: { id: 'ocMvos6NjeKLIBqg5Mr9QjxrP1FA', wx: [] },
        list: [
          {
            name: 'f-1',
            hash: 'sahjfsfdfsdfsdfsdfhsdkfhwef'
          },
          {
            name: 'f-2',
            hash: 'sdfsdfhajsdgahefvswuadfs'
          }
        ],
        uuid: 'ff5d42b9-4b8f-452d-a102-ebfde5cdf945'
      },
      {
        type: 'list', // four media
        comment: 'a fdf gg ee',
        ctime: 1516996463183,
        index: 4,
        tweeter: {
          id: 'ocMvos6NjeKLIBqg5Mr9QjxrP1FA',
          wx: [],
          avatarUrl: 'http://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKQiahrEc8rUfECDTUq94WlcaNkTYTKzIKr3p'
        },
        list: [
          {
            hash: 'sahjfwiuefjhsdkdfdfgdfgef',
            metadata: { height: 300, width: 10 }
          },
          {
            hash: 'sahjfwidfgdfgdfdfgef',
            metadata: { height: 100, width: 300 }
          },
          {
            hash: 's75645dfgdfgdfdfgdfgef',
            metadata: { height: 900, width: 300 }
          },
          {
            hash: 's75645dfgdfgdfdfgdfgefgfgfdgdfg',
            metadata: { height: 900, width: 300 }
          }
        ],
        uuid: 'ff5d42b9-4b8f-452d-a102-ebfde5cdf944'
      },
      {
        type: 'list',
        comment: '/;.,/[[p+_)(*(*&&^&^%%%$$$$#',
        ctime: 1517996523183,
        index: 5,
        tweeter: { id: 'ocMvos6NjeKLIBqg5Mr9QjxrP1FA', wx: [] },
        list: [
          {
            hash: 'sahjfwiuefjhhfhgffff',
            metadata: { height: 10, width: 300 }
          }
        ],
        uuid: 'ff5d42b9-4b8f-452d-a102-ebfde5cdf943'
      },
      {
        type: 'list',
        comment: 'weujkrffkjdfwkefde',
        ctime: 1518996623183,
        index: 6,
        tweeter: { id: 'ocMvos6NjeKLIBqg5Mr9QjxrP1FA', wx: [] },
        list: [
          {
            hash: 'sahjfwiuefjhdfhgdgsdf',
            metadata: { height: 600, width: 300 }
          }
        ],
        uuid: 'ff5d42b9-4b8f-452d-a102-ebfde5cdf942'
      },
      {
        type: 'list',
        comment: 'hello world',
        ctime: 1519996723183,
        index: 7,
        tweeter: { id: 'ocMvos6NjeKLIBqg5Mr9QjxrP1FA', wx: [] },
        list: [
          {
            hash: 'sahjfwiuefjhsdkfhwefffff',
            metadata: { height: 600, width: 300 }
          }
        ],
        uuid: 'ff5d42b9-4b8f-452d-a102-ebfde5cdf941'
      }
    ]
  }

  navEnter() {
  }

  navLeave() {
  }

  navGroup() {
    return 'box'
  }

  menuName() {
    return i18n.__('Inbox Menu Name')
  }

  menuIcon() {
    return PhotoIcon
  }

  quickName() {
    return i18n.__('Inbox Quick Name')
  }

  appBarStyle() {
    return 'light'
  }

  prominent() {
    return false
  }

  hasDetail() {
    return false
  }

  detailEnabled() {
    return true
  }

  detailWidth() {
    return 400
  }

  renderNavigationMenu({ style, onTouchTap }) {
    const CustomStyle = Object.assign(style, { opacity: 1 })
    return (
      <div style={CustomStyle} ref={ref => (this.refNavigationMenu = ref)}>
        <IconButton onTouchTap={onTouchTap}>
          <NavigationMenu color="rgba(0,0,0,0.54)" />
        </IconButton>
      </div>
    )
  }

  renderTitle({ style }) {
    const newStyle = Object.assign(style, { color: 'rgba(0,0,0,0.54)' })
    return (
      <div style={newStyle}>
        { i18n.__('Inbox Title') }
        { !!this.data && ` (${this.data.length})` }
      </div>
    )
  }

  renderContent() {
    return (<Inbox
      data={this.data}
      ipcRenderer={ipcRenderer}
      apis={this.ctx.props.apis}
      setAnimation={this.setAnimation}
      memoize={this.memoize}
      primaryColor={this.groupPrimaryColor()}
    />)
  }
}

export default Box
