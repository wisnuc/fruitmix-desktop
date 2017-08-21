import React from 'react'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'
import FolderSvg from 'material-ui/svg-icons/file/folder'
import PlaySvg from 'material-ui/svg-icons/av/play-arrow'
import PauseSvg from 'material-ui/svg-icons/av/pause'
import DownloadSvg from 'material-ui/svg-icons/file/file-download'
import UploadSvg from 'material-ui/svg-icons/file/file-upload'

const svgStyle = { color: '#000', opacity: 0.54 }
class RunningTask extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isSelected: false
    }

    this.updateDom = (isSelected) => {
      this.setState({ isSelected })
    }

    this.selectTaskItem = (e) => {
      const event = e.nativeEvent
      this.props.select('running', this.props.task.uuid, this.state.isSelected, null, event)
    }

    this.toggleTask = () => {
      const task = this.props.task
      if (task.pause) {
        this.props.resume(task.uuid, task.trsType)
      } else {
        this.props.pause(task.uuid, task.trsType)
      }
    }
  }

  getStatus(task) {
    if (task.state === 'failed') return '失败'
    if (task.pause) return '暂停'
    if (task.state === 'visitless') return '等待中'
    if (task.state === 'visiting') return '正在校验本地文件'
    if (task.state === 'diffing') return '正在校验本地文件'
    if (task.state === 'finish') return '已完成'
    if (task.size === 0) return '0%'
    const percent = (Math.abs(task.completeSize / task.size) * 100).toFixed(2)
    if (percent > 100) return '传输出错'
    return `${percent}%`
  }

  getUploadedSize(task) {
    // console.log(task)
    if ((task.type === 'folder' || task.type === 'directory') && task.count) {
      return `${task.finishCount}/${task.count}  ${this.props.task.pause ? '' : task.speed}`
    } else if (task.type === 'file') {
      return `${this.formatSize(Math.abs(task.completeSize))}  ${this.props.task.pause ? '' : task.speed}`
    }
    return ''
  }

  formatSize(size) {
    if (!size) return `${0}KB`
    size = parseFloat(size)
    if (size < 1024) return `${size.toFixed(2)}B`
    else if (size < (1024 * 1024)) return `${(size / 1024).toFixed(2)}KB`
    else if (size < (1024 * 1024 * 1024)) return `${(size / 1024 / 1024).toFixed(2)}M`
    return `${(size / 1024 / 1024 / 1024).toFixed(2)}G`
  }

  render() {
    console.log('RunningTask', this.props)
    const task = this.props.task
    const pColor = task.pause ? 'rgba(0,0,0,.12)' : '#89c2f2'
    let pWidth = task.completeSize / task.size * 100
    if (pWidth === Infinity || !pWidth) pWidth = 0

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
        onTouchTap={this.selectTaskItem}
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

        {/* task restTime */}
        <div style={{ flex: '0 0 100px' }}>{ task.restTime }</div>

        {/* progress bar */}
        <div style={{ flex: '0 0 240px' }}>
          <div
            style={{
              display: 'flex',
              width: 160,
              height: 6,
              marginRight: 12,
              borderRadius: 2,
              backgroundColor: 'rgba(0,0,0,.12)'
            }}
          >
            <div style={{ backgroundColor: pColor, width: `${pWidth}%` }} />
          </div>

          {/* UploadedSize */}
          <div style={{ height: 20, display: 'flex', alignItems: 'center' }}>
            { this.getUploadedSize(task) }
          </div>
        </div>

        {/* Status */}
        <div style={{ flex: '0 0 160px' }}>{ this.getStatus(task) }</div>

        {/* Pause and resume */}
        <div style={{ flex: '0 0 108px', display: 'flex', alignItems: 'center' }}>
          {
            task.pause ?
              <PlaySvg style={svgStyle} onTouchTap={this.toggleTask} /> :
              <PauseSvg style={svgStyle} onTouchTap={this.toggleTask} />
          }
        </div>
      </div>
    )
  }
}

export default RunningTask
