import React from 'react'
import i18n from 'i18n'
import { IconButton, CircularProgress, RaisedButton, TextField } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error-outline'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import { AutoSizer } from 'react-virtualized'
import FileContent from '../file/FileContent'
import sortByType from '../common/sort'
import FlatButton from '../common/FlatButton'
import ScrollBar from '../common/ScrollBar'
import ListSelect from './ListSelect'

class Preview extends React.PureComponent {
  constructor(props) {
    super(props)

    this.select = new ListSelect(this)

    this.select.on('updated', next => this.setState({ select: next }))
    this.state = {
      select: this.select.state,
      path: [{ type: 'box', uuid: this.props.list[0].sha256, name: 'box' }],
      entries: this.props.list.map((l, i) => ({
        uuid: l.sha256 + i.toString(), name: l.filename || i18n.__('Unknown File'), size: l.size, type: 'file'
      }))
    }

    this.changeSortType = (sortType) => {
      if (sortType === 'takenUp' || sortType === 'takenDown') this.setState({ takenTime: true })
      if (sortType === 'timeUp' || sortType === 'timeDown') this.setState({ takenTime: false })
      this.setState({ sortType, entries: [...this.state.entries].sort((a, b) => sortByType(a, b, sortType)) })
    }

    this.startDownload = () => {
      // console.log('this.startDownload', this.state, this.props)
      const list = this.state.select.selected
      if (!list || !list.length) return
      const files = list.map(uuid => this.props.list.find((l, i) => (l.sha256 + i.toString()) === uuid))
        .map((f, i) => ({
          name: f.filename || (i18n.__('Unknown File') + f.sha256.slice(0, 4)),
          size: f.size,
          type: 'file',
          uuid: f.sha256 + i.toString(),
          sha256: f.sha256,
          station: this.props.station
        }))
      this.state.select.putSelect([])
      this.props.ipcRenderer.send('DOWNLOAD', { entries: files, dirUUID: 'boxFiles' })

      // this.setState({ selectedItems: [] })
    }
  }

  render() {
    const { list, openSnackBar, ipcRenderer, apis } = this.props
    return (
      <div style={{ position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, zIndex: 1000, backgroundColor: '#FFF' }}>
        {/* Selected Header */}
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
          <div ref={ref => (this.refClearSelected = ref)}>
            <IconButton onTouchTap={this.props.onRequestClose}>
              <CloseIcon color="rgba(0,0,0,0.54)" />
            </IconButton>
          </div>
          <div style={{ width: 12 }} />
          <div style={{ color: 'rgba(0,0,0,.54)', fontSize: 20, fontWeight: 500 }} >
            { this.props.author && i18n.__('Files Shared From %s', this.props.author.nickName) }
          </div>
          <div style={{ flexGrow: 1 }} />

          <IconButton onTouchTap={this.startDownload} tooltip={i18n.__('Download')} >
            <DownloadIcon color="rgba(0,0,0,0.54)" />
          </IconButton>
          <div style={{ width: 24 }} />
        </div>

        {/* content */}
        <div
          style={{
            position: 'relative',
            margin: '16px 0 0 0px',
            boxSizing: 'border-box',
            width: '100%',
            height: 'calc(100% - 64px)'
          }}
        >
          <FileContent
            {...this.state}
            fileSelect
            noGridSelect
            listNavBySelect={() => {}}
            showContextMenu={() => {}}
            setAnimation={() => {}}
            ipcRenderer={ipcRenderer}
            primaryColor={this.primaryColor}
            changeSortType={this.changeSortType}
            openSnackBar={openSnackBar}
            toggleDialog={() => {}}
            showTakenTime={!!this.state.takenTime}
            apis={apis}
            refresh={() => {}}
            rowDragStart={() => {}}
            gridDragStart={() => {}}
            setScrollTop={() => {}}
            setGridData={() => {}}
          />
        </div>
      </div>
    )
  }
}

export default Preview
