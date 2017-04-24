import EventEmitter from 'eventemitter3'

class Base extends EventEmitter {

  constructor(ctx) {
    super()
    this.ctx = ctx
  }

  willReceiveProps(nextProps) {
  }

  navEnter() {
  }

  navLeave() {
  }

  navGroup() {
    return 'unfiled'
  }

  menuName() {
  }

  menuIcon() {
  }

  quickName() {
  }

  quickIcon() {
  }


  // 'light' or 'transparent', no appBarColor required
  // 'colored' or 'dark', should further provide appBarColor
  appBarStyle() {
    return 'light'
  }

  appBarColor() {
  } 

  prominent() {
  }

  hasDetail() {
  }

  detailEnabled() {
  }

  detailWidth() {
    return 400
  }

  renderTitle({style}) {
    return <div/>
  }

  renderToolBar({style}) {
    return <div style={style} />
  }

  renderDetail() {
  }

  renderContent() {
    return <div>hello world</div>
  }
}

export default Base

