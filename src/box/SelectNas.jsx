import React from 'react'
import i18n from 'i18n'
import { CircularProgress, Paper, Avatar, IconButton, RaisedButton } from 'material-ui'
import ContentAdd from 'material-ui/svg-icons/content/add'
import FileFolder from 'material-ui/svg-icons/file/folder'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import ForwardIcon from 'material-ui/svg-icons/navigation/arrow-forward'
import UpIcon from 'material-ui/svg-icons/navigation/arrow-upward'
import { ShareIcon, ShareDisk } from '../common/Svg'
import FlatButton from '../common/FlatButton'
import FileContent from '../file/FileContent'
import QuickNav from '../nav/QuickNav'
import ListSelect from '../file/ListSelect'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

const imgUrl = 'http://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKQiahrEc8rUfECDTUq94WlcaNkTYTKzIKr3p5xgOPQO1juvtwO1YSUCHOPpup3oWo1AP3nOBVyPCw/132'

class SelectNas extends React.Component {
  constructor(props) {
    super(props)

    this.select = new ListSelect(this)

    this.select.on('updated', next => this.setState({ select: next }))

    this.state = {
      select: this.select.state,
      path: [{}],
      nav: 'home',
      entries: [],
      loading: false
    }

    this.listNavBySelect = () => {
      if (!window.navigator.onLine) return this.props.openSnackBar(i18n.__('Offline Text'))
      const selected = this.select.state.selected
      if (selected.length !== 1) return

      const entry = this.state.entries[selected[0]]
      this.enter(entry)
    }

    /* enter dir */
    this.enter = (node) => {
      /* conditions that can not enter */
      if (node.type === 'file') return

      /* update current path and dir */
      const currentDir = node
      const path = node.setRoot ? [node] : [...this.state.path, node]

      /* set parameter to get file list */
      const dirUUID = node.uuid
      const driveUUID = this.state.path[0].uuid

      if (node.tag === 'home' || node.type === 'public') { // home drive or public drives, driveUUID = dirUUID
        this.list(dirUUID, dirUUID)
          .then((list) => {
            /* reset driveUUID */
            path[0].uuid = dirUUID
            this.updateState(path, currentDir, list)
          })
          .catch(err => console.log(err))
      } else if (node.type === 'directory') { // normal directory in drives
        this.list(driveUUID, dirUUID)
          .then((list) => {
            this.updateState(path, currentDir, list)
          })
          .catch(err => console.log(err))
      } else if (node.type === 'publicRoot') { // list public drives
        const myUUID = this.props.apis.account.data && this.props.apis.account.data.uuid
        const list = this.props.apis.drives.value().filter(d => d.type === 'public' && d.tag !== 'built-in' &&
          (d.writelist === '*' || d.writelist.find(u => u === myUUID)))
        setImmediate(() => this.updateState(path, currentDir, list))
      } else if (node.tag === 'built-in') {
        const builtIn = this.props.apis.drives.value().find(d => d.tag === 'built-in')
        this.list(builtIn.uuid, builtIn.uuid)
          .then((list) => {
            /* reset driveUUID */
            path[0].uuid = builtIn.uuid
            this.updateState(path, currentDir, list)
          })
          .catch(err => console.log(err))
      }
    }

    /* back to parent */
    this.back = () => {
      console.log('this.back', this.state)
      /* conditions that can not back: loading or in root */
      if (this.state.path.length === 1 || this.state.loading) return

      /* update current path and dir */
      const currentDir = this.state.path[this.state.path.length - 2]
      if (!currentDir.type) currentDir.type = 'directory'
      const path = this.state.path.slice(0, this.state.path.length - 1)

      /* set parameter to get file list */
      const dirUUID = currentDir.uuid
      const driveUUID = path[0].uuid

      if (currentDir.type === 'directory' || currentDir.type === 'public' || currentDir.tag === 'built-in' || currentDir.tag === 'home' || currentDir.type === 'share') { // normal directory
        this.list(driveUUID, dirUUID)
          .then(list => this.updateState(path, currentDir, list))
          .catch(err => console.log(err))
      } else if (currentDir.type === 'root') { // root
        const drives = this.props.apis.drives.value()
        const list = [
          { name: i18n.__('Home Title'), type: 'directory', uuid: drives.find(d => d.tag === 'home').uuid, tag: 'home' },
          { name: i18n.__('Share Title'), type: 'built-in', uuid: drives.find(d => d.tag === 'built-in').uuid, tag: 'built-in' },
          { name: i18n.__('Public Drive'), type: 'publicRoot' }
        ]
        setImmediate(() => this.updateState(path, currentDir, list))
      } else if (currentDir.type === 'publicRoot') { // list public drives
        const myUUID = this.props.apis.account.data && this.props.apis.account.data.uuid
        const list = this.props.apis.drives.value().filter(d => d.type === 'public' && d.tag !== 'built-in' &&
          (d.writelist === '*' || d.writelist.find(u => u === myUUID)))
        setImmediate(() => this.updateState(path, currentDir, list))
      }
    }

    this.nav = (nav) => {
      this.setState({ nav })
      const d = this.props.apis.drives
      const drive = d && d.data && d.data.find(dr => dr.tag === 'home')
      if (!drive) return console.log('no drive error')
      switch (nav) {
        case 'home':
          if (drive) this.enter(Object.assign({ setRoot: true }, drive))
          break
        case 'share':
          this.enter({ tag: 'built-in', setRoot: true })
          break
        case 'public':
          this.enter({ type: 'publicRoot', setRoot: true })
          break
        default:
          break
      }
    }

    /* sort file list */
    this.sort = data => [...data.entries].sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'directory') return 1
      return a.name.localeCompare(b.name)
    })

    this.sleep = time => new Promise(resolve => setTimeout(resolve, time))

    /* get file list */
    this.list = async (driveUUID, dirUUID) => {
      this.setState({ loading: true })
      const res = await this.props.apis.pureRequestAsync('listNavDir', { driveUUID, dirUUID })
      const data = this.props.apis.stationID ? res.body.data : res.body
      return this.sort(data)
    }

    this.updateState = (path, currentDir, entries) => {
      entries.forEach(e => (e.name = e.name || e.label))
      this.setState({
        path: path || this.state.path,
        entries: entries || this.state.entries,
        currentDir: currentDir || this.state.currentDir,
        loading: false,
        currentSelectedIndex: -1
      })
    }
  }

  renderLoading(size) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={size || 64} />
      </div>
    )
  }

  componentDidMount() {
    const d = this.props.apis.drives
    const drive = d && d.data && d.data.find(dr => dr.tag === 'home')
    if (drive) this.enter(Object.assign({ setRoot: true }, drive))
  }

  render() {
    console.log('SelectNas', this.props, this.state)
    const navs = [
      {
        key: 'home',
        Icon: FileFolder,
        onTouchTap: () => this.nav('home'),
        text: i18n.__('Home Menu Name'),
        color: this.state.nav === 'home' ? this.props.primaryColor : 'rgba(0,0,0,0.54)'
      },
      {
        key: 'share',
        Icon: ShareIcon,
        onTouchTap: () => this.nav('share'),
        text: i18n.__('Share Menu Name'),
        color: this.state.nav === 'share' ? this.props.primaryColor : 'rgba(0,0,0,0.54)'
      },
      {
        key: 'public',
        Icon: ShareDisk,
        onTouchTap: () => this.nav('public'),
        text: i18n.__('Public Quick Name'),
        color: this.state.nav === 'public' ? this.props.primaryColor : 'rgba(0,0,0,0.54)'
      }
    ]

    return (
      <div style={{ position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, zIndex: 1000 }}>
        {/* header */}
        <div
          style={{
            width: '100%',
            height: 64,
            backgroundColor: '#FFF',
            display: 'flex',
            alignItems: 'center',
            zIndex: 200,
            boxShadow: '0px 1px 4px rgba(0,0,0,0.27)'
          }}
        >
          <div style={{ width: 12 }} />
          <div>
            <IconButton onTouchTap={this.props.onRequestClose}>
              <CloseIcon color="rgba(0,0,0,0.54)" />
            </IconButton>
          </div>
        </div>
        {/* content */}
        <div style={{ width: '100%', height: 'calc(100% - 64px)', display: 'flex', position: 'relative', marginTop: 8 }}>
          <div style={{ width: 72, height: '100%', backgroundColor: '#FFF' }}>
            { this.props.view === 'file' && navs.map(n => <QuickNav {...n} />) }
          </div>
          <div style={{ flexGrow: 1, height: '100%', backgroundColor: '#FFF', overflow: 'hidden', position: 'relative' }}>
            <div style={{ width: '100%', height: 64, backgroundColor: 'rgba(0,0,0,0.09)' }} >
              <IconButton onTouchTap={this.back}>
                <BackIcon color="#FFF" />
              </IconButton>
              <IconButton onTouchTap={this.back}>
                <ForwardIcon color="#FFF" />
              </IconButton>
              <IconButton onTouchTap={this.back}>
                <UpIcon color="#FFF" />
              </IconButton>
            </div>
            <div style={{ width: '100%', height: 'calc(100% - 64px)', position: 'absolute', top: 64, left: 0 }}>
              <FileContent
                {...this.state}
                showNoFiles
                listNavBySelect={this.listNavBySelect}
                showContextMenu={() => {}}
                setAnimation={() => {}}
                ipcRenderer={this.props.ipcRenderer}
                primaryColor={this.props.primaryColor}
                changeSortType={() => {}}
                openSnackBar={this.props.openSnackBar}
                toggleDialog={() => {}}
                showTakenTime={!!this.state.takenTime}
                apis={this.props.apis}
                refresh={this.refresh}
                rowDragStart={() => {}}
                gridDragStart={() => {}}
                setScrollTop={() => {}}
                setGridData={() => {}}
              />
            </div>
          </div>
          <div
            style={{
              width: 360,
              height: 'calc(100% - 8px)',
              boxSizing: 'border-box',
              border: '8px solid #F5F5F5',
              backgroundColor: '#FFF'
            }}
          >
            {/* tweeter */}
            <div style={{ height: 72, width: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 16 }} />
              {/* Avatar */}
              <div style={{ height: 40, width: 40 }}>
                <Avatar src={imgUrl} size={40} />
              </div>
              <div style={{ width: 16 }} />
              <div style={{ width: 100 }}>
                { '李小龙' }
              </div>
            </div>

            {/* comment */}
            <div style={{ height: 61, width: '100%', display: 'flex', alignItems: 'center' }}>
              { '标题' }
            </div>

            {/* file list */}
            <div style={{ height: 'calc(100% - 196px)', width: '100%', display: 'flex', alignItems: 'center' }}>
              { 'blabla' }
            </div>

            {/* action */}
            <div style={{ height: 61, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RaisedButton
                style={{ width: 'calc(100% - 32px)' }}
                primary
                label={i18n.__('Create Tweet')}
                onTouchTap={() => console.log('create tweet')}
              />
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export default SelectNas
