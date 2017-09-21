import React, { Component } from 'react'
import FolderSvg from 'material-ui/svg-icons/file/folder'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'
import DownloadSvg from 'material-ui/svg-icons/file/file-download'
import UploadSvg from 'material-ui/svg-icons/file/file-upload'
import MultiSvg from 'material-ui/svg-icons/content/content-copy'

const svgStyle = { color: '#000', opacity: 0.54 }

class FinishedTask extends Component {
  constructor(props) {
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
      console.log('this.openFileLocation')
      if (this.props.task.trsType === 'download') setImmediate(this.props.open)
      else setImmediate(this.props.openInDrive)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state !== nextState)
  }

  getFinishDate(d) {
    console.log(d, typeof d)
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

  render() {
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
            { task.entries.length > 1 && ` 等${task.entries.length}个项目` }
          </div>
        </div>

        <div style={{ flex: '0 0 32px' }} />
        {/* task finishDate */}
        <div style={{ flex: '0 0 224px', color: 'rgba(0, 0, 0, 0.54)' }} >
          { this.getFinishDate(task.finishDate) }
        </div>
      </div>
    )
  }
}

export default FinishedTask
