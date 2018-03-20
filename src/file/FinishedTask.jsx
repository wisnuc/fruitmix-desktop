import React, { Component } from 'react'
import i18n from 'i18n'
import FolderSvg from 'material-ui/svg-icons/file/folder'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'
import WarningIcon from 'material-ui/svg-icons/alert/warning'
import DownloadSvg from 'material-ui/svg-icons/file/file-download'
import UploadSvg from 'material-ui/svg-icons/file/file-upload'
import MultiSvg from 'material-ui/svg-icons/content/content-copy'
import IconButton from '../common/IconButton'

const svgStyle = { color: '#000', opacity: 0.54 }

class FinishedTask extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isSelected: false
    }

    this.createDate = new Date()

    this.updateDom = (isSelected) => {
      this.setState({ isSelected })
    }

    this.selectFinishItem = (e) => {
      const event = e.nativeEvent
      this.props.select('finish', this.props.task.uuid, this.state.isSelected, null, event)
    }

    this.openFileLocation = () => {
      if (this.props.task.trsType === 'download') setImmediate(this.props.open)
      else setImmediate(this.props.openInDrive)
    }

    this.checkError = () => {
      const errors = this.props.task.errors || []
      const warnings = this.props.task.warnings || []
      this.props.openErrorDialog([...errors, ...warnings], true)
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (this.state !== nextState)
  }

  getFinishDate (d) {
    const date = new Date()
    if (typeof d === 'number') {
      date.setTime(d)
    } else {
      return '-'
    }
    const year = date.getFullYear()
    const mouth = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    return `${year}-${mouth}-${day} ${hour}:${minute}`
  }

  render () {
    const task = this.props.task
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 88px',
          height: 56,
          fontSize: 14,
          color: 'rgba(0,0,0,0.87)',
          backgroundColor: this.state.isSelected ? '#f4f4f4' : ''
        }}
        role="presentation"
        onMouseUp={this.selectFinishItem}
        onDoubleClick={this.openFileLocation}
      >
        {/* task type */}
        <div style={{ flex: '0 0 48px' }}>
          { task.trsType === 'download' ? <DownloadSvg style={svgStyle} /> : <UploadSvg style={svgStyle} /> }
        </div>

        {/* task item type */}
        <div style={{ flex: '0 0 32px' }}>
          { task.entries.length > 1 ? <MultiSvg style={svgStyle} /> : task.taskType === 'file' ? <FileSvg style={svgStyle} /> : <FolderSvg style={svgStyle} /> }
        </div>

        {/* task item name */}
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div
            style={{
              maxWidth: 540,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            { task.name }
          </div>
          <div>
            { task.entries.length > 1 && i18n.__('And Other %s Items', task.entries.length)}
          </div>
        </div>

        <div style={{ flex: '0 0 32px' }} />
        {/* task finishDate */}
        <div style={{ flex: '0 0 288px', color: 'rgba(0, 0, 0, 0.54)' }} >
          { this.getFinishDate(task.finishDate) }
        </div>
        <div style={{ flex: '0 0 60px', display: 'flex', alignItems: 'center', marginRight: 8 }}>
          {
            task.warnings && !!task.warnings.length &&
            <IconButton onTouchTap={this.checkError} tooltip={i18n.__('Detail')}>
              <WarningIcon color="#FB8C00" />
            </IconButton>
          }
        </div>
      </div>
    )
  }
}

export default FinishedTask
