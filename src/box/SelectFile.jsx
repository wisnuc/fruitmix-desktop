import React from 'react'
import i18n from 'i18n'
import { CircularProgress, Avatar, IconButton, RaisedButton, TextField } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import { AutoSizer } from 'react-virtualized'
import { ShareIcon, ShareDisk } from '../common/Svg'
import FileContent from '../file/FileContent'
import QuickNav from '../nav/QuickNav'
import ListSelect from './ListSelect'
import sortByType from '../common/sort'
import { BreadCrumbItem, BreadCrumbSeparator } from '../common/BreadCrumb'
import ScrollBar from '../common/ScrollBar'
import Row from './Row'

class SelectNas extends React.Component {
  constructor (props) {
    super(props)

    this.select = new ListSelect(this)

    this.selected = new Map()
    this.select.on('updated', (next) => {
      this.selected = new Map([...this.selected].filter(([k]) => next.selected.includes(k)))
      next.selected.forEach((uuid) => {
        const entry = this.state.entries.find(e => e.uuid === uuid)
        const dirUUID = this.state.path.slice(-1)[0].uuid
        const driveUUID = this.state.path[0].uuid
        if (entry) this.selected.set(uuid, Object.assign({ dirUUID, driveUUID }, entry))
      })

      this.setState({ select: next })
    })

    this.delSelected = (uuid) => {
      this.select.delSelected(uuid)
    }

    this.state = {
      sortType: 'nameUp', // nameUp, nameDown, timeUp, timeDown, sizeUp, sizeDown, takenUp, takenDown
      select: this.select.state,
      path: [{}],
      nav: 'home',
      entries: [],
      loading: false
    }

    this.changeSortType = (sortType) => {
      if (sortType === 'takenUp' || sortType === 'takenDown') this.setState({ takenTime: true })
      if (sortType === 'timeUp' || sortType === 'timeDown') this.setState({ takenTime: false })
      this.setState({ sortType, entries: [...this.state.entries].sort((a, b) => sortByType(a, b, sortType)) })
    }

    this.listNavBySelect = (entry) => {
      if (!window.navigator.onLine) this.props.openSnackBar(i18n.__('Offline Text'))
      else this.enter(entry)
    }

    this.fire = () => {
      const args = {
        comment: this.state.comment || '',
        type: 'list',
        boxUUID: this.props.boxUUID,
        stationId: this.props.stationId,
        isMedia: [...this.selected].every(([k, v]) => !!v.metadata),
        list: [...this.selected].map(([k, v]) => ({
          type: 'file', filename: v.name, driveUUID: v.driveUUID, dirUUID: v.dirUUID, nasMedia: !!v.metadata, sha256: v.hash
        }))
      }
      this.props.onRequestClose()
      this.props.createNasTweets(args)
    }

    /* enter dir */
    this.enter = (node, p) => {
      /* conditions that can not enter */
      if (node.type === 'file') return

      /* update current path and dir */
      const currentDir = node
      const path = p || (node.setRoot ? [node] : [...this.state.path, node])

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
          .catch(err => console.error(err))
      } else if (node.type === 'directory') { // normal directory in drives
        this.list(driveUUID, dirUUID)
          .then((list) => {
            this.updateState(path, currentDir, list)
          })
          .catch(err => console.error(err))
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
          .catch(err => console.error(err))
      }
    }

    /* back to parent */
    this.back = () => {
      // console.log('this.back', this.state)
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
          .catch(err => console.error(err))
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
      if (!drive) return console.error('no drive error')
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
      return null
    }

    /* get file list */
    this.list = async (driveUUID, dirUUID) => {
      this.setState({ loading: true })
      const data = await this.props.apis.pureRequestAsync('listNavDir', { driveUUID, dirUUID })
      return [...data.entries].sort((a, b) => sortByType(a, b, this.state.sortType))
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

  componentDidMount () {
    const d = this.props.apis.drives
    const drive = d && d.data && d.data.find(dr => dr.tag === 'home')
    if (drive) this.enter(Object.assign({ setRoot: true }, drive))
  }

  renderLoading (size) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={size || 64} />
      </div>
    )
  }

  renderBreadCrumb (navs) {
    const path = this.state.path

    const touchTap = node => this.enter(node, path.slice(0, path.indexOf(node) + 1))

    const title = navs.find(n => n.key === this.state.nav).text
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
        {
          path.reduce((acc, node, index) => {
            const onHoverHeader = () => {}
            const isDrop = () => false
            const dropable = () => false
            const funcs = { node, onTouchTap: () => touchTap(node), onHoverHeader, isDrop, dropable }

            if (path.length > 4 && index > 0 && index < path.length - 3) {
              if (index === path.length - 4) {
                acc.push(<BreadCrumbSeparator key={`Separator${node.uuid}`} alt />)
                acc.push(<BreadCrumbItem key="..." text="..." {...funcs} alt />)
              }
              return acc
            }

            if (index !== 0) acc.push(<BreadCrumbSeparator key={`Separator${node.uuid}`} alt />)

            /* the first one is always special */
            if (index === 0) acc.push(<BreadCrumbItem text={title} key="root" {...funcs} alt />)
            else acc.push(<BreadCrumbItem text={node.name} key={`Item${node.uuid}`} {...funcs} alt />)

            return acc
          }, [])
        }
      </div>
    )
  }

  render () {
    // console.log('SelectNas', this.props, this.state, this.selected)

    const { currentUser, primaryColor, onRequestClose, ipcRenderer } = this.props
    const navs = [
      {
        key: 'home',
        Icon: FileFolder,
        onTouchTap: () => this.nav('home'),
        text: i18n.__('Home Menu Name'),
        color: this.state.nav === 'home' ? primaryColor : 'rgba(0,0,0,0.54)'
      },
      {
        key: 'share',
        Icon: ShareIcon,
        onTouchTap: () => this.nav('share'),
        text: i18n.__('Share Menu Name'),
        color: this.state.nav === 'share' ? primaryColor : 'rgba(0,0,0,0.54)'
      },
      {
        key: 'public',
        Icon: ShareDisk,
        onTouchTap: () => this.nav('public'),
        text: i18n.__('Public Quick Name'),
        color: this.state.nav === 'public' ? primaryColor : 'rgba(0,0,0,0.54)'
      }
    ]

    return (
      <div style={{ position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, zIndex: 1000, backgroundColor: '#FFF' }}>
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
            <IconButton onTouchTap={onRequestClose}>
              <CloseIcon color="rgba(0,0,0,0.54)" />
            </IconButton>
          </div>
          <div style={{ width: 12 }} />
          <div style={{ color: 'rgba(0,0,0,.54)', fontSize: 20, fontWeight: 500 }} >
            { i18n.__('%s File Selected', [...this.selected].length) }
          </div>
          <div style={{ flexGrow: 1 }} />
        </div>
        {/* content */}
        <div style={{ width: '100%', height: 'calc(100% - 64px)', display: 'flex', position: 'relative', marginTop: 8 }}>
          <div style={{ width: 72, height: '100%', backgroundColor: '#FFF' }}>
            { navs.map(n => <QuickNav {...n} />) }
          </div>

          {/* file list */}
          <div style={{ flexGrow: 1, height: '100%', backgroundColor: '#FFF', overflow: 'hidden', position: 'relative' }}>
            <div style={{ width: '100%', height: 56, margin: '-4px 0 0 60px', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 32, height: 32 }}>
                { this.state.path.length > 1 &&
                  <IconButton
                    onTouchTap={this.back}
                    iconStyle={{ width: 18, height: 18 }}
                    style={{ width: 32, height: 32, padding: 7 }}
                  >
                    <BackIcon color="rgba(0,0,0,.54)" />
                  </IconButton>
                }
              </div>
              { this.renderBreadCrumb(navs) }
            </div>
            <div style={{ width: '100%', height: 'calc(100% - 64px)', position: 'absolute', top: 48, left: 0 }}>
              <FileContent
                {...this.state}
                resetScrollTo={() => {}}
                fileSelect
                listNavBySelect={this.listNavBySelect}
                showContextMenu={() => {}}
                setAnimation={() => {}}
                ipcRenderer={ipcRenderer}
                primaryColor={this.primaryColor}
                changeSortType={this.changeSortType}
                openSnackBar={this.props.openSnackBar}
                toggleDialog={() => {}}
                showTakenTime={!!this.state.takenTime}
                apis={this.props.apis}
                rowDragStart={() => {}}
                gridDragStart={() => {}}
                setScrollTop={() => {}}
                setGridData={() => {}}
              />
            </div>
          </div>

          {/* rigth frame */}
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
                <Avatar src={currentUser.avatarUrl} size={40} />
              </div>
              <div style={{ width: 16 }} />
              <div style={{ width: 100 }}>
                { currentUser.nickName }
              </div>
            </div>

            {/* comment */}
            <div style={{ height: 61, width: '100%', marginLeft: 16, display: 'flex', alignItems: 'center' }}>
              <TextField
                style={{ width: 272 }}
                name="comment"
                value={this.state.comment}
                hintText={i18n.__('Say Something')}
                onChange={e => this.setState({ comment: e.target.value })}
              />
              <ModeEdit color="rgba(0,0,0,.54)" style={{ marginLeft: 16 }} />
            </div>

            {/* file list title */}
            <div
              style={{
                height: 40,
                width: '100%',
                margin: 8,
                display: 'flex',
                alignItems: 'center',
                fontSize: 13,
                color: 'rgba(0,0,0,.54)'
              }}
            >
              <div style={{ flex: '0 0 36px' }} />
              <div style={{ flex: '0 0 220px', display: 'flex', alignItems: 'center' }}>
                { i18n.__('Name') }
              </div>
              <div style={{ flex: '0 0 96px' }}>
                { i18n.__('Date Modified') }
              </div>
            </div>

            {/* file list content */}
            <div style={{ height: 'calc(100% - 261px)', width: '100%', overflowY: 'hidden' }}>
              <AutoSizer>
                {({ height, width }) => (
                  <ScrollBar
                    allHeight={[...this.selected].length * 40}
                    height={height}
                    width={width}
                    rowCount={[...this.selected].length}
                    rowHeight={40}
                    rowRenderer={({ index, key, style }) => {
                      const entry = [...this.selected][index][1]
                      return (
                        <div style={style} key={key}>
                          <Row {...entry} action={this.delSelected} key={entry.uuid} />
                        </div>
                      )
                    }}
                  />
                )}
              </AutoSizer>
            </div>

            {/* action */}
            <div style={{ height: 61, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RaisedButton
                disabled={![...this.selected].length}
                style={{ width: 'calc(100% - 32px)' }}
                primary
                label={i18n.__('Create Tweet')}
                onTouchTap={this.fire}
              />
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export default SelectNas
