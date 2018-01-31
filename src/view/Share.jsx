import i18n from 'i18n'
import { ShareIcon } from '../common/Svg'
import Home from './Home'

class Share extends Home {
  constructor(ctx) {
    super(ctx)
    this.type = 'share'
    this.title = () => i18n.__('Share Title')
    this.firstEnter = true
  }

  navEnter(target) {
    this.isNavEnter = true
    const apis = this.ctx.props.apis
    if (!apis || !apis.drives || !apis.drives.data) return
    if (target && target.driveUUID) { // jump to specific dir
      const { driveUUID, dirUUID } = target
      apis.request('listNavDir', { driveUUID, dirUUID })
      this.setState({ loading: true })
    } else if (this.firstEnter) {
      this.firstEnter = false
      const drive = apis.drives.data.find(d => d.tag === 'built-in')
      apis.request('listNavDir', { driveUUID: drive.uuid, dirUUID: drive.uuid })
    } else this.refresh()
  }

  navGroup() {
    return 'file'
  }

  menuName() {
    return i18n.__('Share Menu Name')
  }

  menuIcon() {
    return ShareIcon
  }
}

export default Share
