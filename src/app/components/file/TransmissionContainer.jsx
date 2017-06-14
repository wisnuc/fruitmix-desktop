import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { Paper, Menu, MenuItem } from 'material-ui'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import PlaySvg from 'material-ui/svg-icons/av/play-arrow'
import PauseSvg from 'material-ui/svg-icons/av/pause'

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
      tasks: [],
      userTasks: [],
      finishTasks: []
    }

    this.taskSelected = []
    this.finishSelected = []

    this.keydown = (event) => {
      if (event.ctrlKey === this.state.ctrl && event.shiftKey === this.state.shift) return
      this.setState({
        ctrl: event.ctrlKey,
        shift: event.shiftKey
      })
    }

    this.keyup = (event) => {
      if (event.ctrlKey === this.state.ctrl && event.shiftKey === this.state.shift) return
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
      command('', 'CLEAN_RECORD', {})
    }

    this.cleanTaskSelect = () => {
      this.taskSelected.forEach((item) => {
        if (this.refs[item]) {
          this.refs[item].updateDom(false)
        }
      })
      this.taskSelected.length = 0 // need to keep the same reference
    }

    this.cleanFinishSelect = () => {
      this.finishSelected.forEach((item) => {
        if (this.refs[item]) {
          this.refs[item].updateDom(false)
        }
      })
      this.finishSelected.length = 0 // need to keep the same reference
    }

    this.openMenu = (event, obj) => {
      const containerDom = document.getElementById('content-container')
      const maxLeft = containerDom.offsetLeft + containerDom.clientWidth - 168
      const x = event.clientX > maxLeft ? maxLeft : event.clientX
      const maxTop = containerDom.offsetTop + containerDom.offsetHeight - (16 + 96 + (obj.play + obj.pause) * 48)
      const y = event.clientY > maxTop ? maxTop : event.clientY
      this.setState({ menuShow: true, x, y, play: obj.play, pause: obj.pause, tasks: obj.tasks })
    }

    this.playAll = (tasks) => {
      // debug('this.play', tasks)
      tasks.forEach((item) => {
        if (item.trsType === 'download') ipcRenderer.send('RESUME_DOWNLOADING', item.uuid)
        else ipcRenderer.send('RESUME_UPLOADING', item.uuid)
      })
    }

    this.pauseAll = (tasks) => {
      // debug('this.pause', tasks)
      tasks.forEach((item) => {
        if (item.trsType === 'download') ipcRenderer.send('PAUSE_DOWNLOADING', item.uuid)
        else ipcRenderer.send('PAUSE_UPLOADING', item.uuid)
      })
    }

    this.deleteAll = (tasks) => {
      const downloadArr = []
      const uploadArr = []
      tasks.forEach((item) => {
        if (item.trsType === 'download') downloadArr.push(item)
        else uploadArr.push(item)
      })

      ipcRenderer.send('DELETE_DOWNLOADING', downloadArr)
      ipcRenderer.send('DELETE_UPLOADING', uploadArr)
    }

    this.select = (type, id, isSelected, index, e) => {
      let selectedArray
      /*
        selectedArray is a reference of this.taskSelected or this.finishSelected
        posh/pop selectedArray would alse change vlaue of this.taskSelected or this.finishSelected
      */
      if (type === 'running') {
        selectedArray = this.taskSelected
        this.cleanFinishSelect()
      } else {
        selectedArray = this.finishSelected
        this.cleanTaskSelect()
      }

      /* ctrl */
      if (this.state.ctrl) {
        /* only left click */
        if (e.button === 0) {
          if (isSelected) {
            /* cancel select */
            const index = selectedArray.indexOf(id)
            selectedArray.splice(index, 1)
            this.refs[id].updateDom(!isSelected)
          } else {
            /* add select */
            selectedArray.push(id)
            this.refs[id].updateDom(!isSelected)
          }
        }
      } else if (this.state.shift && e.button === 0) {
        /* shift */
        if (selectedArray.length === 0) {
          selectedArray.push(id)
          this.refs[id].updateDom(true)
        } else {
          const userTasks = this.state.userTasks
          const finishTasks = this.state.finishTasks
          const lastSelect = selectedArray[selectedArray.length - 1]
          let lastIndex
          let currentIndex
          if (type === 'running') {
            lastIndex = userTasks.findIndex(task => task.uuid === lastSelect)
            currentIndex = userTasks.findIndex(task => task.uuid === id)
          } else {
            lastIndex = finishTasks.findIndex(task => task.uuid === lastSelect)
            currentIndex = finishTasks.findIndex(task => task.uuid === id)
          }
          let minor = lastIndex
          let major = currentIndex
          if (lastIndex > currentIndex) {
            minor = currentIndex
            major = lastIndex
          }
          for (let i = minor; i <= major; i++) {
            let uuid
            if (type === 'running') {
              uuid = userTasks[i].uuid
            } else {
              uuid = finishTasks[i].uuid
            }
            selectedArray.push(uuid)
            this.refs[uuid].updateDom(true)
          }
          // debug('shift', lastSelect, lastIndex, id, currentIndex)
        }
      } else if (!(e.button === 2 && isSelected)) {
        /* select an item: no shift or ctrl, not right click a selected item */
        type === 'running' ? this.cleanTaskSelect() : this.cleanFinishSelect()
        selectedArray.push(id)
        this.refs[id].updateDom(true)
      }

      /* right click: open menu */
      if (e.button === 2) {
        const tasks = []
        let play = false
        let pause = false

        /* get selected tasks */
        selectedArray.forEach((item) => {
          if (this.refs[item]) tasks.push(this.refs[item].props.task)
        })

        /* add play or pause option to running task */
        if (type === 'running') {
          for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].pause) play = true
            else pause = true
          }
        }

        this.openMenu(e, { type, pause, play, tasks })
      }
    }

    this.updateTransmission = (e, type, userTasks, finishTasks) => {
      this.setState({ userTasks, finishTasks })
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keydown)
    document.addEventListener('keyup', this.keyup)
    ipcRenderer.on('UPDATE_TRANSMISSION', this.updateTransmission)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keydown)
    document.removeEventListener('keyup', this.keyup)
    ipcRenderer.removeListener('UPDATE_TRANSMISSION', this.updateTransmission)
  }

  render() {
    const userTasks = this.state.userTasks
    const finishTasks = this.state.finishTasks
    // debug('render', userTasks)

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

    /* show playAll button when allPaused = true */
    let allPaused = true
    userTasks.forEach((task) => {
      if (!task.pause) {
        allPaused = false
      }
    })

    return (
      <div style={{ padding: 16 }}>
        <div style={{ height: 24 }} />

        {/* running task title */}
        <div style={titileStyle} >
          <div style={{ flexGrow: 1 }}>
            { `传输中（${userTasks.length}）` }
          </div>
          <div style={{ flex: '0 0 240px', display: 'flex', alignItems: 'center' }}>
            {
              allPaused ?
                <FlatButton
                  label="全部开始"
                  icon={<PlaySvg style={{ color: '#000', opacity: 0.54 }} />}
                  onTouchTap={() => this.playAll(userTasks)}
                /> :
                <FlatButton
                  label="全部暂停"
                  icon={<PauseSvg style={{ color: '#000', opacity: 0.54 }} />}
                  onTouchTap={() => this.pauseAll(userTasks)}
                />
            }
            <FlatButton
              label="全部取消"
              icon={<DeleteSvg style={{ color: '#000', opacity: 0.54 }} />}
              onTouchTap={() => this.deleteAll(userTasks)}
            />
          </div>
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
          <div style={{ flex: '0 0 120px', display: 'flex', alignItems: 'center' }}>
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
                  { this.state.play && <MenuItem primaryText="继续" onTouchTap={() => this.playAll(this.state.tasks)} /> }
                  { this.state.pause && <MenuItem primaryText="暂停" onTouchTap={() => this.pauseAll(this.state.tasks)} /> }
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
