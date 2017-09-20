import React from 'react'
import Debug from 'debug'
import { IconButton } from 'material-ui'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import FileSvg from 'material-ui/svg-icons/editor/insert-drive-file'
import FolderSvg from 'material-ui/svg-icons/file/folder'
import PlaySvg from 'material-ui/svg-icons/av/play-arrow'
import PauseSvg from 'material-ui/svg-icons/av/pause'
import InfoSvg from 'material-ui/svg-icons/action/info'
import DownloadSvg from 'material-ui/svg-icons/file/file-download'
import UploadSvg from 'material-ui/svg-icons/file/file-upload'
import MultiSvg from 'material-ui/svg-icons/content/content-copy'

const debug = Debug('component:file:RunningTask: ')
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
      if (task.paused) this.props.resume(task.uuid)
      else this.props.pause(task.uuid)
    }

    this.checkError = () => {
      debug('this.checkError', this.props.task)
      this.props.openErrorDialog(this.props.task.errors)
    }
  }

  getStatus(task) {
    if (task.state === 'failed') return '已停止'
    if (task.paused) return '已暂停'
    if (task.state === 'visitless') return '等待中'
    if (task.state === 'hashing') return '正在校验'
    if (task.state === 'diffing') return '正在校验'
    if (task.state === 'uploadless') return '等待上传'
    if (task.state === 'uploading') return '正在上传'
    if (task.state === 'downloadless') return '等待下载'
    if (task.state === 'downloading') return '正在下载'
    if (task.state === 'finish') return '已完成'
    return '未知状态'
  }

  formatSize(s) {
    const size = parseFloat(s, 10)
    if (!size) return `${0} KB`
    if (size < 1024) return `${size.toFixed(2)} B`
    else if (size < (1024 * 1024)) return `${(size / 1024).toFixed(2)} KB`
    else if (size < (1024 * 1024 * 1024)) return `${(size / 1024 / 1024).toFixed(2)} MB`
    return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
  }

  formatSpeed(size) {
    return `${this.formatSize(size)}/s`
  }

  formatSeconds(seconds) {
    if (!seconds || seconds === Infinity || seconds === -Infinity || this.props.task.paused) return '- - : - - : - -'
    let s = parseInt(seconds, 10)
    let m = 0
    let h = 0
    if (s > 60) {
      m = parseInt(s / 60)
      s = parseInt(s % 60)
      if (m > 60) {
        h = parseInt(m / 60)
        m = parseInt(m % 60)
      }
    }
    if (h.toString().length === 1) h = `0${h}`
    if (m.toString().length === 1) m = `0${m}`
    if (s.toString().length === 1) s = `0${s}`
    if (h > 24) return '> 24 小时'
    return `${h} : ${m} : ${s}`
  }

  renderSizeAndSpeed(task) {
    const speed = this.props.task.paused ? '' : this.formatSpeed(task.speed)
    const uploaded = task.count === 1 ? this.formatSize(task.completeSize) : `${task.finishCount}/${task.count}`
    return (
      <div style={{ height: 20, width: 160, display: 'flex', alignItems: 'center' }}>
        <div> { uploaded } </div>
        <div style={{ flexGrow: 1 }} />
        <div> { speed } </div>
      </div>
    )
  }

  renderPercent(task) {
    if (task.size === 0) return '0%'
    const percent = (Math.abs(task.completeSize / task.size) * 100).toFixed(2)
    return `${percent}%`
  }

  render() {
    console.log('RunningTask', this.props)
    const task = this.props.task
    const pColor = task.paused ? 'rgba(0,0,0,.12)' : '#89c2f2'
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
          { task.entries.length > 1 ? <MultiSvg style={svgStyle} />
          : task.taskType === 'file' ? <FileSvg style={svgStyle} /> : <FolderSvg style={svgStyle} /> }
        </div>

        {/* task item name */}
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }} >
          <div
            style={{
              maxWidth: 264,
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


        {/* progress bar */}
        <div style={{ flex: '0 0 200px' }}>
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

          {/* Uploaded size and speed */}
          { this.renderSizeAndSpeed(task) }
        </div>

        {/* percent */}
        <div style={{ flex: '0 0 80px' }}>{ this.renderPercent(task) }</div>

        {/* task restTime */}
        <div style={{ flex: '0 0 164px' }}>{ this.formatSeconds(task.restTime) }</div>

        {/* Status */}
        <div style={{ flex: '0 0 100px' }}>{ this.getStatus(task) }</div>

        {/* Pause, resume and delete task*/}
        <div style={{ flex: '0 0 120px', display: 'flex', alignItems: 'center' }}>
          {
            task.state === 'failed'
            ? <IconButton iconStyle={{ color: '#F44336 ' }} onTouchTap={this.checkError} tooltip="查看"> <InfoSvg /> </IconButton>
            : <IconButton iconStyle={svgStyle} onTouchTap={this.toggleTask} tooltip={task.paused ? '开始' : '暂停'}>
              { task.paused ? <PlaySvg /> : <PauseSvg /> }
            </IconButton>
          }
          {
            task.paused &&
              <IconButton iconStyle={svgStyle} onTouchTap={this.props.delete} tooltip="取消">
                <DeleteSvg />
              </IconButton>
          }
        </div>
      </div>
    )
  }
}

export default RunningTask
