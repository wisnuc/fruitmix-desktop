import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { Paper, CircularProgress, LinearProgress, IconButton } from 'material-ui'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import UpIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import DownIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-down'
import Promise from 'bluebird'
import request from 'superagent'
import sanitize from 'sanitize-filename'
import FlatButton from '../common/FlatButton'
import { ShareDisk } from '../common/Svg'

const debug = Debug('component:common:Tasks ')

class Tasks extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      tasks: [],
      loading: true,
      uuid: ''
    }

    this.toggleDetail = (uuid) => {
      this.setState({ uuid: this.state.uuid === uuid ? '' : uuid })
    }

    this.cancelTask = (uuid) => {
      this.props.apis.pureRequest('deleteTask', { uuid }, (err, res) => {
        console.log('deleteTask', err, res && res.body)
        if (err) console.log('deleteTask error', err)
        this.refresh()
      })
    }

    this.refresh = () => {
      this.props.apis.pureRequest('tasks', null, (err, res) => {
        console.log('refresh', err, res && res.body)
        if (err || !res || !res.body) {
          this.setState({ error: 'NoData' })
        } else {
          this.setState({ tasks: res.body, loading: false })
        }
      })
    }
  }

  componentDidMount() {
    this.refresh()
  }

  renderLoading() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={32} thickness={3} />
      </div>
    )
  }

  renderError() {
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
      { 'Failed To Load Task Data' }
    </div>
  }

  renderTask(task) {
    const { uuid, type, src, dst, entries, nodes } = task
    const action = 'Copying'
    const iconStyle = { width: 16, height: 16, color: '#9E9E9E' }
    const show = this.state.uuid === uuid
    
    return (
      <div style={{ height: show ? 160 : 72, width: '100%', transition: 'all 225ms' }} >
        <div style={{ height: 24, width: 300, display: 'flex', alignItems: 'center', marginLeft: 16, fontSize: 13 }} >
          { `Copying ${entries.length} items` }
        </div>
        <div style={{ height: 24, width: 320, display: 'flex', alignItems: 'center', marginLeft: 16, fontSize: 13 }} >
          <LinearProgress mode="indeterminate" />
          <div style={{ width: 16 }} />
          <IconButton tooltip="Cancel" iconStyle={iconStyle} onTouchTap={() => this.cancelTask(uuid)}>
            <CloseIcon />
          </IconButton>
          <IconButton tooltip="Detail" iconStyle={iconStyle} onTouchTap={() => this.toggleDetail(uuid)}>
            { show ? <UpIcon /> : <DownIcon /> }
          </IconButton>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 200 }}
        onTouchTap={() => this.props.onRequestClose()}
      >
        <Paper
          style={{
            position: 'absolute',
            top: 72,
            right: this.props.showDetail ? 376 : 16,
            width: 360,
            height: 320,
            overflowY: 'auto',
            backgroundColor: '#f3f3f3'
          }}
          onTouchTap={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          { this.state.loading ? this.renderLoading() : this.state.error ?
              this.renderError() : this.state.tasks.map(t => this.renderTask(t)) }
        </Paper>
      </div>
    )
  }
}

export default Tasks
