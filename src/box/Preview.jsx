import React from 'react'
import i18n from 'i18n'
import { IconButton, CircularProgress, RaisedButton, TextField } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error-outline'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import { AutoSizer } from 'react-virtualized'
import FileContent from '../file/FileContent'
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
        uuid: l.sha256 + i.toString(), name: l.filename || i18n.__('Unkown File'), size: l.size, type: 'file'
      }))
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
            listNavBySelect={this.listNavBySelect}
            showContextMenu={() => {}}
            setAnimation={() => {}}
            ipcRenderer={ipcRenderer}
            primaryColor={this.primaryColor}
            changeSortType={this.changeSortType}
            openSnackBar={openSnackBar}
            toggleDialog={() => {}}
            showTakenTime={!!this.state.takenTime}
            apis={apis}
            refresh={this.refresh}
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
