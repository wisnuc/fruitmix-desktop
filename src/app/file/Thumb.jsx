import React from 'react'
import Debug from 'debug'
import UUID from 'uuid'
import prettysize from 'prettysize'
import { Avatar, IconButton, Paper, MenuItem, Popover, Menu } from 'material-ui'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box'
import ToggleCheckBoxOutlineBlank from 'material-ui/svg-icons/toggle/check-box-outline-blank'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ArrowUpward from 'material-ui/svg-icons/navigation/arrow-upward'
import ArrowDownward from 'material-ui/svg-icons/navigation/arrow-downward'
import CheckIcon from 'material-ui/svg-icons/navigation/check'
import { List, AutoSizer } from 'react-virtualized'
import renderFileIcon from '../common/renderFileIcon'
import FlatButton from '../common/FlatButton'
import { ShareDisk } from '../common/Svg'

const debug = Debug('component:file:GridView:')

class Thumb extends React.PureComponent {
  constructor(props) {
    super(props)

    this.path = ''

    this.updatePath = (event, session, path) => {
      if (this.session === session) {
        this.path = path
        this.forceUpdate()
      }
    }
  }

  componentDidMount() {
    this.session = UUID.v4()
    this.props.ipcRenderer.send('mediaShowThumb', this.session, this.props.digest, 210, 210)
    this.props.ipcRenderer.on('getThumbSuccess', this.updatePath)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.digest !== this.props.digest) {
      this.session = UUID.v4()
      this.props.ipcRenderer.send('mediaShowThumb', this.session, nextProps.digest, 210, 210)
    }
  }

  componentWillUnmount() {
    this.props.ipcRenderer.removeListener('getThumbSuccess', this.updatePath)
    this.props.ipcRenderer.send('mediaHideThumb', this.session)
  }

  render() {
    debug('render Thumb', this.props)
    return (
      <div style={{ width: '100%', height: '100%' }} >
        {
          this.path &&
            <img
              src={this.path}
              alt="img"
              height={this.props.height}
              width={this.props.width}
              style={{ objectFit: this.props.full ? 'contain' : 'cover', transition: 'all 225ms cubic-bezier(0.0, 0.0, 0.2, 1)' }}
            />
        }
      </div>
    )
  }
}
export default Thumb
