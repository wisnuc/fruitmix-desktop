import React from 'react'
import i18n from 'i18n'
import Debug from 'debug'
import { Paper, CircularProgress, LinearProgress, IconButton } from 'material-ui'
import DoneIcon from 'material-ui/svg-icons/action/done'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import WarningIcon from 'material-ui/svg-icons/alert/warning'
import FolderSvg from 'material-ui/svg-icons/file/folder'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'
import MultiSvg from 'material-ui/svg-icons/content/content-copy'
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
          this.setState({ error: 'NoData', loading: false })
        } else {
          this.setState({ tasks: [...res.body].reverse(), loading: false })
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
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        { i18n.__('Failed To Load Task Data') }
      </div>
    )
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
    const tStyles = { marginTop: -8 }
    const svgStyle = { color: '#000', opacity: 0.54 }
    const conflict = nodes.filter(n => n.state === 'Conflict')
    const error = nodes.filter(n => n.state === 'Failed')
    const finished = nodes.findIndex(n => n.parent === null && n.state === 'Finished') > -1

    return (
      <div style={{ height: 72, width: '100%', display: 'flex', alignItems: 'center' }} key={uuid}>
        {/* Icon */}
        <div style={{ width: 56, display: 'flex', alignItems: 'center' }} >
          {
            entries.length > 1 ? <MultiSvg style={svgStyle} /> :
              entries[0].type === 'file' ? <FileSvg style={svgStyle} /> : <FolderSvg style={svgStyle} />
          }
        </div>

        {/* Progress */}
        <div style={{ flexGrow: 1 }} >
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', fontSize: 13 }} >
            { action }
            <div style={{ width: 4 }} />
            <div style={{ maxWidth: entries.length > 1 ? 96 : 192, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 13 }} >
              { entries[0].name }
            </div>
            <div style={{ width: 4 }} />
            { entries.length > 1 && i18n.__('And Other %s Items', entries.length) }
          </div>

          <div style={{ height: 16, width: '100%', display: 'flex', alignItems: 'center', fontSize: 13 }}>
            <LinearProgress
              mode={(finished || conflict.length > 0 || error.length > 0) ? 'determinate' : 'indeterminate'}
              value={finished ? 100 : 61.8}
              style={{ backgroundColor: '#E0E0E0' }}
            />
          </div>

          <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.54)' }}>
            {
              finished ? i18n.__('Finished') : error.length ? i18n.__('Task Failed') :
              conflict.length ? i18n.__('Task Conflict Text') : ''
            }
          </div>
        </div>

        {/* Button */}
        <div style={{ width: 8 }} />
        <IconButton
          iconStyle={{ color: '#9E9E9E' }}
          tooltipStyles={tStyles}
          onTouchTap={() => this.cancelTask(uuid)}
          tooltip={finished ? i18n.__('OK') : i18n.__('Cancel')}
        >
          { finished ? <DoneIcon /> : <CloseIcon /> }
        </IconButton>
        <div style={{ marginLeft: -8, marginRight: -12 }}>
          {
            error.length ?
            <ErrorBox
              style={{ display: 'flex', alignItems: 'center' }}
              tooltip={i18n.__('Detail')}
              iconStyle={{ color: '#db4437' }}
              error={error}
            /> :
            conflict.length ?
            <IconButton
              tooltip={i18n.__('Detail')}
              iconStyle={{ color: '#fb8c00' }}
              tooltipStyles={tStyles}
              onTouchTap={() => this.handleConflict(uuid, type, conflict)}
            >
              <WarningIcon />
            </IconButton>
            : <div style={{ width: 48 }} />
          }
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
            padding: 24,
            width: 416,
            height: 288,
            overflowY: 'auto',
            backgroundColor: '#FAFAFA'
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
