import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { Paper, CircularProgress, LinearProgress, IconButton } from 'material-ui'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import WarningIcon from 'material-ui/svg-icons/alert/warning'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
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
import ErrorBox from '../common/ErrorBox'

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
        if (err) console.log('deleteTask error', err)
        this.refresh()
      })
    }

    this.refresh = () => {
      this.props.apis.pureRequest('tasks', null, (err, res) => {
        if (err || !res || !res.body) {
          this.setState({ error: 'NoData' })
        } else {
          this.setState({ tasks: res.body, loading: false })
        }
      })
    }

    this.handleConflict = (uuid, type, nodes) => {
      const data = {
        session: uuid,
        actionType: type,
        conflicts: nodes.map((n) => {
          const name = n.src.name
          const entryType = n.type
          const nodeUUID = n.src.uuid
          const remote = { type: n.error && n.error.xcode === 'EISDIR' ? 'directory' : 'file' }
          return ({ name, entryType, remote, nodeUUID })
        })
      }
      this.props.openMovePolicy(data)
    }
  }

  componentDidMount() {
    this.refresh()
    this.timer = setInterval(() => this.refresh(), 1000)
  }

  componentWillUnmount() {
    this.state.tasks.filter(t => t.nodes.findIndex(n => n.parent === null && n.state === 'Finished') > -1).forEach((t) => {
      this.props.apis.pureRequest('deleteTask', { uuid: t.uuid })
    })
    clearInterval(this.timer)
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
      { i18n.__('Failed To Load Task Data') }
    </div>
  }

  renderNoTask() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        { i18n.__('No Running Tasks') }
      </div>
    )
  }

  renderTask(task) {
    const { uuid, type, src, dst, entries, nodes } = task
    const action = type === 'copy' ? i18n.__('Copying') : i18n.__('Moving')
    const iStyle = { width: 16, height: 16, color: '#9E9E9E' }
    const iStyleWarning = { width: 16, height: 16, color: '#fb8c00' }
    const iStyleError = { width: 16, height: 16, color: '#FF4081' }
    const tStyles = { marginTop: -8 }
    const show = this.state.uuid === uuid
    const conflict = nodes.filter(n => n.state === 'Conflict')
    const error = nodes.filter(n => n.state === 'Failed')
    const finished = nodes.findIndex(n => n.parent === null && n.state === 'Finished') > -1

    return (
      <div style={{ height: show ? '' : 72, width: '100%', transition: 'all 225ms' }} key={uuid}>
        <div style={{ height: 24, width: 300, display: 'flex', alignItems: 'center', fontSize: 13 }} >
          <div style={{ width: 16 }} />
          { action }
          <div style={{ width: 4 }} />
          <div style={{ maxWidth: 96, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} >
            { entries[0].name }
          </div>
          <div style={{ width: 4 }} />
          { entries.length > 1 && i18n.__('And Other %s Items', entries.length) }
        </div>

        <div style={{ height: 24, width: '100%', display: 'flex', alignItems: 'center', fontSize: 13 }} >
          <div style={{ width: 16 }} />
          <div style={{ flexGrow: 1 }} >
            <LinearProgress
              mode={(finished || conflict.length > 0 || error.length > 0) ? 'determinate' : 'indeterminate'}
              value={finished ? 100 : 61.8}
            />
          </div>
          <div style={{ width: 16 }} />
          <IconButton
            iconStyle={iStyle}
            tooltipStyles={tStyles}
            onTouchTap={() => this.cancelTask(uuid)}
            tooltip={finished ? i18n.__('OK') : i18n.__('Cancel')}
          >
            { finished ? <DoneIcon /> : <CloseIcon /> }
          </IconButton>
          {
            error.length ?
              <ErrorBox
                style={{ display: 'flex', alignItems: 'center' }}
                tooltip={i18n.__('Detail')}
                iconStyle={iStyleError}
                error={error}
              /> :
              conflict.length ?
              <IconButton
                tooltip={i18n.__('Detail')}
                iconStyle={iStyleWarning}
                tooltipStyles={tStyles}
                onTouchTap={() => this.handleConflict(uuid, type, conflict)}
              >
                { show ? <UpIcon /> : <WarningIcon /> }
              </IconButton>
              : <div style={{ width: 48 }} />
          }
        </div>
        <div style={{ fontSize: 13, marginLeft: 16 }}>
          { finished ? i18n.__('Finished') : error.length ? i18n.__('Task Failed') : conflict.length ? i18n.__('Task Conflict Text') : '' }
        </div>
        { show && <div style={{ height: 16 }} /> }
        {
          show && conflict.map(c => (
            <div style={{ height: 24, width: 300, display: 'flex', alignItems: 'center', fontSize: 11 }}>
              <div style={{ width: 16 }} />
              <div style={{ width: 144, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} >
                { c.src.name }
              </div>
              <div style={{ width: 16 }} />
              { i18n.__('Task Conflict Text') }
            </div>
          ))
        }
        { show && <div style={{ height: 16 }} /> }
        {
          show &&
            <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <FlatButton label={i18n.__('Handle')} onTouchTap={() => this.handleConflict(uuid, type, conflict)} primary />
              <FlatButton label={i18n.__('Abort')} onTouchTap={() => this.cancelTask(uuid)} primary />
            </div>
        }
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
          { this.state.loading ? this.renderLoading() : this.state.error ? this.renderError()
              : this.state.tasks.length ? this.state.tasks.map(t => this.renderTask(t)) : this.renderNoTask() }
        </Paper>
      </div>
    )
  }
}

export default Tasks
