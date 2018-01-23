import React from 'react'
import i18n from 'i18n'
import { CircularProgress, Paper, Avatar, IconButton } from 'material-ui'
import ContentAdd from 'material-ui/svg-icons/content/add'
import FileFolder from 'material-ui/svg-icons/file/folder'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import { ShareIcon, ShareDisk } from '../common/Svg'
import FlatButton from '../common/FlatButton'
import FileContent from '../file/FileContent'
import QuickNav from '../nav/QuickNav'

const curve = 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'

const imgUrl = 'http://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKQiahrEc8rUfECDTUq94WlcaNkTYTKzIKr3p5xgOPQO1juvtwO1YSUCHOPpup3oWo1AP3nOBVyPCw/132'

class SelectNas extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  renderLoading(size) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={size || 64} />
      </div>
    )
  }

  render() {
    console.log('SelectNas', this.props, this.state)
    const navs = [
      {
        key: 'home',
        Icon: FileFolder,
        onTouchTap: () => this.setState({ nav: 'home' }),
        text: i18n.__('Home Menu Name'),
        color: this.state.nav === 'home' ? this.props.primaryColor : 'rgba(0,0,0,0.54)'
      },
      {
        key: 'share',
        Icon: ShareIcon,
        onTouchTap: () => this.setState({ nav: 'public' }),
        text: i18n.__('Share Menu Name'),
        color: this.state.nav === 'share' ? this.props.primaryColor : 'rgba(0,0,0,0.54)'
      },
      {
        key: 'public',
        Icon: ShareDisk,
        onTouchTap: () => this.setState({ nav: 'public' }),
        text: i18n.__('Public Quick Name'),
        color: this.state.nav === 'public' ? this.props.primaryColor : 'rgba(0,0,0,0.54)'
      }
    ]

    return (
      <div style={{ position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, zIndex: 1000 }} >
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
              <CloseIcon color="rgba(255,255,255,0.54)" />
            </IconButton>
          </div>
        </div>
        {/* content */}
        <div style={{ width: '100%', height: 'calc(100% - 64px)', display: 'flex', position: 'relative' }}>
          <div style={{ width: 72, height: '100%', backgroundColor: '#FFF', marginTop: 8 }}>
            { this.props.view === 'file' && navs.map(n => <QuickNav {...n} />) }
          </div>
          <div style={{ flexGrow: 1, height: '100%' }}>
            <FileContent
              {...this.state}
              listNavBySelect={() => {}}
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
          <div style={{ width: 360, height: '100%' }}>

          </div>
        </div>
      </div>
    )
  }
}

export default SelectNas
