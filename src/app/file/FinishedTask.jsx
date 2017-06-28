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
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state !== nextState)
  }

  getFinishDate(date) {
    const d = this.createDate
    const year = d.getFullYear()
    const mouth = d.getMonth() + 1
    const day = d.getDate()
    const hour = d.getHours()
    const minute = d.getMinutes()
    if (year === date[0] && mouth === date[1] && day === date[2]) return `${date[3]}:${date[4]}`
    if (year === date[0] && mouth === date[1] && day === date[2] + 1) return '昨天'
    return `${date[0]}-${date[1]}-${date[2]}`
  }

  render() {
    const task = this.props.task
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 88px',
          height: 40,
          lindeHeight: 40,
          fontSize: 14,
          color: 'rgba(0,0,0,0.87)',
          backgroundColor: this.state.isSelected ? '#f4f4f4' : ''
        }}
        onMouseUp={this.selectFinishItem}
      >
        {/* task type */}
        <div style={{ flex: '0 0 48px' }}>
          { task.trsType === 'download' ? <DownloadSvg style={svgStyle} /> : <UploadSvg style={svgStyle} /> }
        </div>

        {/* task item type */}
        <div style={{ flex: '0 0 32px' }}>
          { task.type === 'folder' ? <FolderSvg style={svgStyle} /> : <FileSvg style={svgStyle} /> }
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
