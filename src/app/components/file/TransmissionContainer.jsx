import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import { Paper, Menu, MenuItem } from 'material-ui'
import RunningTask from './RunningTask'
import FinishedTask from './FinishedTask'
import FlatButton from '../common/FlatButton'
import { command } from '../../lib/command'

const debug = Debug('component:file:TrsContainer:')

class TrsContainer extends React.Component {
  constructor(props) {
    super(props)

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

    this.taskSelected = []
    this.finishSelected = []

    this.keydown = (event) => {
      if (event.ctrlKey === this.state.ctrl && event.shiftKey == this.state.shift) return
      this.setState({
        ctrl: event.ctrlKey,
        shift: event.shiftKey
      })
    }

    this.keyup = (event) => {
      if (event.ctrlKey == this.state.ctrl && event.shiftKey == this.state.shift) return
      this.setState({
        ctrl: event.ctrlKey,
        shift: event.shiftKey
      })
    }

    this.hideMenu = () => {
      this.setState({
        menuShow: false
      })
    }

    this.delete = () => {
      const downloadArr = []
      const uploadArr = []
      this.state.tasks.forEach((item) => {
        if (item.trsType === 'download') downloadArr.push(item)
        else uploadArr.push(item)
      })

      ipcRenderer.send(this.taskSelected.length ? 'DELETE_DOWNLOADING' : 'DELETE_DOWNLOADED', downloadArr)
      ipcRenderer.send(this.taskSelected.length ? 'DELETE_UPLOADING' : 'DELETE_UPLOADED', uploadArr)
    }

    this.open = () => {
      console.log(this.state.tasks)
      ipcRenderer.send('OPEN_TRANSMISSION', this.state.tasks)
    }

    this.pause = (uuid, type) => {
      if (type === 'download') ipcRenderer.send('PAUSE_DOWNLOADING', uuid)
      else ipcRenderer.send('PAUSE_UPLOADING', uuid)
    }

    this.resume = (uuid, type) => {
      if (type === 'download') ipcRenderer.send('RESUME_DOWNLOADING', uuid)
      else ipcRenderer.send('RESUME_UPLOADING', uuid)
    }

    this.cleanRecord = () => {
      console.log('cleanRecord')
      command('', 'CLEAN_RECORD', {})
    }

    this.cleanTaskSelect = () => {
      this.taskSelected.forEach((item) => {
      })
      this.taskSelected.length = 0
    }

    this.cleanFinishSelect = () => {
      this.finishSelected.forEach((item) => {
      })
      this.finishSelected.length = 0
    }

    this.openMenu = (event, obj) => {
      const containerDom = document.getElementById('content-container')
      const maxLeft = containerDom.offsetLeft + containerDom.clientWidth - 112
      const x = event.clientX > maxLeft ? maxLeft : event.clientX
      const maxTop = containerDom.offsetTop + containerDom.offsetHeight - 208
      const y = event.clientY > maxTop ? maxTop : event.clientY
      this.setState({ menuShow: true, x, y, play: obj.play, pause: obj.pause, tasks: obj.tasks })
    }

    this.playAll = () => {
      this.state.tasks.forEach((item) => {
        if (item.trsType === 'download') ipcRenderer.send('RESUME_DOWNLOADING', item.uuid)
        else ipcRenderer.send('RESUME_UPLOADING', item.uuid)
      })
    }

    this.pauseAll = () => {
      this.state.tasks.forEach((item) => {
        if (item.trsType === 'download') ipcRenderer.send('PAUSE_DOWNLOADING', item.uuid)
        else ipcRenderer.send('PAUSE_UPLOADING', item.uuid)
      })
    }

    this.select = (type, id, isSelected, index, e) => {
      debug('onselect', this.state, type, id, isSelected, this.taskSelected, this.finishSelected)
      let arr
      if (type === 'running') {
        arr = this.taskSelected
        this.cleanFinishSelect()
      } else {
        arr = this.finishSelected
        this.cleanTaskSelect()
      }
      if (this.state.ctrl) {
        // 'ctrl 按下'
        if (isSelected) {
          // '取消选中'
          if (e.button !== 2) {
            const index = arr.indexOf(id)
            arr.splice(index, 1)
          }
        } else {
          // '选中'
          arr.push(id)
        }

        // shift enter
      } else if (this.state.shift) {

      } else {
        // 右键选中文件 不进行操作 只打开菜单
        if (!(e.button == 2 && isSelected)) {
          // '单选一个任务'
          type === 'running' ? this.cleanTaskSelect() : this.cleanFinishSelect()
          arr.push(id)
        }
      }

      if (e.button === 2) {
        const tasks = []
        let play
        let pause
        arr.forEach((item) => {
        })
        if (type !== 'finish') {
          for (let i = 0; i < tasks.length; i++) {
            if (play !== undefined && pause !== undefined) break
            if (tasks[i].pause) play = false
            else pause = false
          }
          if (play === undefined) play = true
          if (pause === undefined) pause = true
        } else {
          play = true
          pause = true
        }
        const obj = {
          type,
          pause,
          play,
          tasks
        }
        this.openMenu(e, obj)
      }
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keydown)
    document.addEventListener('keyup', this.keyup)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keydown)
    document.removeEventListener('keyup', this.keyup)
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
        {
          userTasks.map((task, index) => (
            <RunningTask
              ref={task.uuid}
              key={task.uuid}
              trsType={task.trsType}
              index={index}
              task={task}
              pause={this.pause}
              resume={this.resume}
              select={this.select}
            />
          ))
        }
        <div style={{ height: 48 }} />

        {/* finished task title */}
        <div style={titileStyle}>
          <div style={{ flexGrow: 1 }}>
            { `已完成（${finishTasks.length}）` }
          </div>
          <div style={{ flex: '0 0 180px', display: 'flex', alignItems: 'center' }}>
            <FlatButton
              label="清除记录"
              icon={<DeleteSvg style={{ color: '#000', opacity: 0.54 }} />}
              onTouchTap={this.cleanRecord}
            />
          </div>
        </div>
        <div style={hrStyle} />

        {/* finished task list*/}
        {
          finishTasks.map((task, index) => (
            <FinishedTask
              ref={task.uuid}
              key={task.uuid}
              index={index}
              task={task}
              select={this.select}
            />
          ))
        }

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
