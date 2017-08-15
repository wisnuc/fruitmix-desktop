import React, { Component } from 'react'
import FolderSvg from 'material-ui/svg-icons/file/folder'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'
import DownloadSvg from 'material-ui/svg-icons/file/file-download'
import UploadSvg from 'material-ui/svg-icons/file/file-upload'

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
      clearTimeout(this.time)
      if (this.props.task.trsType === 'download') this.time = setTimeout(this.props.open, 200)
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
          { (task.type === 'folder' || task.type === 'directory') ? <FolderSvg style={svgStyle} /> : <FileSvg style={svgStyle} /> }
        </div>

        {/* task item name */}
        <div
          style={{
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {task.name}
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
