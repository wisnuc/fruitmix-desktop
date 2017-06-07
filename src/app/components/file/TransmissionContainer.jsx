import React from 'react'
import { ipcRenderer } from 'electron'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import { Paper, Menu, MenuItem } from 'material-ui'
import RowList from './TransmissionRowList'
import FlatButton from '../common/FlatButton'
import { command } from '../../lib/command'

class TrsContainer extends React.Component {
  constructor(props) {
    super(props)
    this.taskSelected = []
    this.finishSelected = []
    this.state = {
      x: 0,
      y: 0,
      ctrl: false,
      shift: false,
      play: true,
      pause: true,
      menuShow: false,
      tasks: []
    }
    this.kd = this.keydown.bind(this)
    this.ku = this.keyup.bind(this)
    this.hideMenu = this.hideMenu.bind(this)
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
    this.delete = this.delete.bind(this)
    this.open = this.open.bind(this)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.kd)
    document.addEventListener('keyup', this.ku)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.kd)
    document.removeEventListener('keyup', this.ku)
  }

  keydown(event) {
    if (event.ctrlKey == this.ctrl && event.shiftKey == this.shift) return
    this.setState({
      ctrl: event.ctrlKey,
      shift: event.shiftKey
    })
  }

  keyup(event) {
    if (event.ctrlKey == this.ctrl && event.shiftKey == this.shift) return
    this.setState({
      ctrl: event.ctrlKey,
      shift: event.shiftKey
    })
  }

  cleanRecord() {
    console.log('')
    command('', 'CLEAN_RECORD', {})
  }

  cleanTaskSelect() {
    this.taskSelected.forEach((item) => {
      if (this.refs.running.refs[item]) {
        this.refs.running.refs[item].updateDom(false)
      }
    })
    this.taskSelected.length = 0
  }

  cleanFinishSelect() {
    this.finishSelected.forEach((item) => {
      if (this.refs.finish.refs[item]) {
        this.refs.finish.refs[item].updateDom(false)
      }
    })
    this.finishSelected.length = 0
  }

  openMenu(event, obj) {
    const containerDom = document.getElementById('content-container')
    const maxLeft = containerDom.offsetLeft + containerDom.clientWidth - 112
    const x = event.clientX > maxLeft ? maxLeft : event.clientX
    const maxTop = containerDom.offsetTop + containerDom.offsetHeight - 208
    const y = event.clientY > maxTop ? maxTop : event.clientY
    this.setState({ menuShow: true, x, y, play: obj.play, pause: obj.pause, tasks: obj.tasks })
  }

  hideMenu() {
    this.setState({
      menuShow: false
    })
  }

  play() {
    this.state.tasks.forEach((item) => {
      if (item.trsType === 'download') ipcRenderer.send('RESUME_DOWNLOADING', item.uuid)
      else ipcRenderer.send('RESUME_UPLOADING', item.uuid)
    })
  }

  pause() {
    this.state.tasks.forEach((item) => {
      if (item.trsType === 'download') ipcRenderer.send('PAUSE_DOWNLOADING', item.uuid)
      else ipcRenderer.send('PAUSE_UPLOADING', item.uuid)
    })
  }

  delete() {
    const downloadArr = []
    const uploadArr = []
    this.state.tasks.forEach((item) => {
      if (item.trsType === 'download') downloadArr.push(item)
      else uploadArr.push(item)
    })

    ipcRenderer.send(this.taskSelected.length ? 'DELETE_DOWNLOADING' : 'DELETE_DOWNLOADED', downloadArr)
    ipcRenderer.send(this.taskSelected.length ? 'DELETE_UPLOADING' : 'DELETE_UPLOADED', uploadArr)
  }

  open() {
    console.log(this.state.tasks)
    ipcRenderer.send('OPEN_TRANSMISSION', this.state.tasks)
  }

  render() {
    const transmission = window.store.getState().transmission
    const userTasks = transmission.userTasks
    const finishTasks = transmission.finishTasks

    const titileStyle = {
      display: 'flex',
      alignItems: 'center',
      padding: '0 88px',
      fontWeight: 500,
      color: 'rgba(0,0,0,0.87)'
    }

    const hrStyle = {
      boxSizing: 'border-box',
      height: '1px',
      backgroundColor: '#b8b8b8',
      margin: '8px 88px 12px 88px'
    }

    return (
      <div style={{ padding: 16 }}>
        <div style={{ height: 24 }} />
        {/* running task title */}
        <div style={titileStyle} >
          { `传输中（${userTasks.length}）` }
        </div>
        <div style={hrStyle} />

        {/* running task list */}
        <RowList
          ref="running"
          listType="running"
          tasks={userTasks}
          taskSelected={this.taskSelected}
          finishSelected={this.finishSelected}
          ctrl={this.state.ctrl}
          shift={this.state.shift}
          cleanFinishSelect={this.cleanFinishSelect.bind(this)}
          cleanTaskSelect={this.cleanTaskSelect.bind(this)}
          openMenu={this.openMenu.bind(this)}
        />

        {/* finished task title */}
        <div style={titileStyle}>
          <div style={{ flexGrow: 1 }}>
            { `已完成（${finishTasks.length}）` }
          </div>
          <div style={{ flex: '0 0 180px', display: 'flex', alignItems: 'center' }}>
            <FlatButton
              label="清除记录"
              icon={<DeleteSvg style={{ color: '#000', opacity: 0.54 }} />}
              onTouchTap={this.cleanRecord.bind(this)}
            />
          </div>
        </div>
        <div style={hrStyle} />

        {/* finished task list*/}
        <RowList
          listType="finish"
          ref="finish"
          tasks={finishTasks}
          taskSelected={this.taskSelected}
          finishSelected={this.finishSelected}
          ctrl={this.state.ctrl}
          shift={this.state.shift}
          cleanFinishSelect={this.cleanFinishSelect.bind(this)}
          cleanTaskSelect={this.cleanTaskSelect.bind(this)}
          openMenu={this.openMenu.bind(this)}
        />

        {/* menu */}
        {
          this.state.menuShow && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
              onTouchTap={this.hideMenu}
            >
              <Paper style={{ position: 'absolute', top: this.state.y, left: this.state.x }}>
                <Menu>
                  <MenuItem primaryText="继续" disabled={this.state.play} onTouchTap={this.play} />
                  <MenuItem primaryText="暂停" disabled={this.state.pause} onTouchTap={this.pause} />
                  <MenuItem primaryText="打开所在文件夹" onTouchTap={this.open} />
                  <MenuItem primaryText="删除" onTouchTap={this.delete} />
                </Menu>
              </Paper>
            </div>
          )
        }
      </div>
    )
  }
}

export default TrsContainer
