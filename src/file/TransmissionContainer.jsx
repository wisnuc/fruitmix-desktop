import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { List, AutoSizer } from 'react-virtualized'
import { Paper, Menu, MenuItem } from 'material-ui'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import PlaySvg from 'material-ui/svg-icons/av/play-arrow'
import PauseSvg from 'material-ui/svg-icons/av/pause'

import RunningTask from './RunningTask'
import FinishedTask from './FinishedTask'
import ErrorDialogInTrans from './ErrorDialogInTrans'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/DialogOverlay'

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
      finishTasks: [],
      clearRunningDialog: false,
      clearFinishedDialog: false,
      errors: null
    }

    this.taskSelected = []
    this.finishSelected = []

    this.toggleDialog = op => this.setState({ [op]: !this.state[op] })

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

    this.openMenu = (event, obj) => {
      debug('this.openMenu', obj.tasks)
      const containerDom = document.getElementById('content-container')
      const maxLeft = containerDom.offsetLeft + containerDom.clientWidth - 168
      const x = event.clientX > maxLeft ? maxLeft : event.clientX
      const maxTop = containerDom.offsetTop + containerDom.offsetHeight - (16 + 96 + (obj.play + obj.pause) * 48)
      const y = event.clientY > maxTop ? maxTop : event.clientY
      this.setState({ menuShow: true, x, y, play: obj.play, pause: obj.pause, tasks: obj.tasks })
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
          if (type === 'running') this.cleanTaskSelect()
          else this.cleanFinishSelect()
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
        if (type === 'running') this.cleanTaskSelect()
        else this.cleanFinishSelect()
        selectedArray.push(id)
        this.refs[id].updateDom(true)
        this.setState({ tasks: [this.refs[id].props.task] })
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
            if (tasks[i].paused) play = true
            else pause = true
          }
        }

        this.openMenu(e, { type, pause, play, tasks })
      }
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

    /* ipc communication */
    this.pause = (uuid) => {
      ipcRenderer.send('PAUSE_TASK', [uuid])
    }

    this.resume = (uuid) => {
      ipcRenderer.send('RESUME_TASK', [uuid])
    }

    /* type: 'PAUSE', 'RESUME', 'DELETE' */
    this.handleAll = (tasks, type) => {
      debug('ipcRenderer.send', `${type}_TASK`, tasks.map(t => t.uuid))
      ipcRenderer.send(`${type}_TASK`, tasks.map(t => t.uuid))
    }

    this.open = () => {
      debug('this.open', this.state.tasks)
      ipcRenderer.send('OPEN_TRANSMISSION', this.state.tasks.map(t => t.downloadPath))
    }

    this.openInDrive = () => {
      debug('this.openInDrive', this.state.tasks)
      const { driveUUID, dirUUID } = this.state.tasks[0]
      this.props.navToDrive(driveUUID, dirUUID)
    }

    this.openErrorDialog = (errors) => {
      this.setState({ errors })
    }

    this.updateTransmission = (e, userTasks, finishTasks) => {
      debug('this.updateTransmission', userTasks, finishTasks)
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
    // debug('render TrsContainer')
    const userTasks = this.state.userTasks
    const finishTasks = this.state.finishTasks

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

    /* show resumeAll button when allPaused = true */
    let allPaused = true
    userTasks.forEach((task) => {
      if (!task.paused) {
        allPaused = false
      }
    })

    const list = []

    /* running task title */
    const runningTaskTitle = () => (
      <div>
        <div style={{ height: 24 }} />
        <div style={titileStyle} >
          <div style={{ flexGrow: 1 }}>
            { `传输中（${userTasks.length}）` }
          </div>
          <div style={{ flex: '0 0 240px', display: 'flex', alignItems: 'center' }}>
            {
                allPaused ?
                  <FlatButton
                    label="全部开始"
                    disabled={!userTasks.length}
                    icon={<PlaySvg style={{ color: '#000', opacity: 0.54 }} />}
                    onTouchTap={() => this.handleAll(userTasks, 'RESUME')}
                  /> :
                  <FlatButton
                    label="全部暂停"
                    disabled={!userTasks.length}
                    icon={<PauseSvg style={{ color: '#000', opacity: 0.54 }} />}
                    onTouchTap={() => this.handleAll(userTasks, 'PAUSE')}
                  />
              }
            <FlatButton
              label="全部取消"
              disabled={!userTasks.length}
              icon={<DeleteSvg style={{ color: '#000', opacity: 0.54 }} />}
              onTouchTap={() => this.toggleDialog('clearRunningDialog')}
            />
          </div>
        </div>
        <div style={hrStyle} />
      </div>
    )

    list.push(runningTaskTitle())

    /* running task list */
    list.push(...userTasks.map((task, index) => (
      <RunningTask
        ref={task.uuid}
        key={task.uuid}
        trsType={task.trsType}
        index={index}
        task={task}
        pause={this.pause}
        resume={this.resume}
        select={this.select}
        delete={() => this.toggleDialog('deleteRunningDialog')}
        openErrorDialog={this.openErrorDialog}
      />
    )))

    list.push(<div style={{ height: 56 }} />)

    /* finished task title */
    const finishedTaskTitle = () => (
      <div>
        <div style={titileStyle}>
          <div style={{ flexGrow: 1 }}>
            { `已完成（${finishTasks.length}）` }
          </div>
          <div style={{ flex: '0 0 120px', display: 'flex', alignItems: 'center' }}>
            <FlatButton
              label="清除记录"
              disabled={!finishTasks.length}
              icon={<DeleteSvg style={{ color: '#000', opacity: 0.54 }} />}
              onTouchTap={() => this.toggleDialog('clearFinishedDialog')}
            />
          </div>
        </div>
        <div style={hrStyle} />
      </div>
      )

    list.push(finishedTaskTitle())

    /* finished task list*/
    list.push(...finishTasks.map((task, index) => (
      <FinishedTask
        ref={task.uuid}
        key={task.uuid}
        index={index}
        task={task}
        select={this.select}
        open={this.open}
        openInDrive={this.openInDrive}
      />
    )))

    /* rowCount */
    const rowCount = userTasks.length + finishTasks.length + 3

    /* rowHeight */
    const allHeight = []
    allHeight.length = rowCount
    allHeight.fill(56)
    allHeight[0] = 80
    const rowHeight = ({ index }) => allHeight[index]

    /* rowRenderer */
    const rowRenderer = ({ key, index, style }) => (
      <div key={key} style={Object.assign({ marginLeft: 20 }, style)}>
        { list[index] }
      </div>
    )
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              rowHeight={rowHeight}
              rowRenderer={rowRenderer}
              rowCount={rowCount}
              overscanRowCount={3}
              style={{ outline: 'none' }}
            />
            )}
        </AutoSizer>

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
                  {
                    this.state.play &&
                      <MenuItem
                        primaryText={this.state.tasks[0].state === 'failed' ? '重试' : '继续'}
                        onTouchTap={() => this.handleAll(this.state.tasks, 'RESUME')}
                      />
                  }
                  { this.state.pause && <MenuItem primaryText="暂停" onTouchTap={() => this.handleAll(this.state.tasks, 'PAUSE')} /> }
                  {
                    this.state.tasks.length === 1 && this.state.tasks[0].trsType === 'download' &&
                      <MenuItem primaryText="打开所在文件夹" onTouchTap={this.open} />
                  }
                  {
                    this.state.tasks.length === 1 && this.state.tasks[0].trsType === 'upload' &&
                      <MenuItem primaryText="查看所在目录" onTouchTap={this.openInDrive} />
                  }
                  { this.state.play && <MenuItem primaryText="删除" onTouchTap={() => this.toggleDialog('deleteRunningDialog')} /> }
                  { this.state.tasks[0].state === 'finished' &&
                  <MenuItem primaryText="删除" onTouchTap={() => this.handleAll(this.state.tasks, 'DELETE')} /> }
                </Menu>
              </Paper>
            </div>
          )
        }
        {/* Delete Runing Tasks Dialog */}
        <DialogOverlay open={!!this.state.deleteRunningDialog}>
          <div>
            {
              this.state.deleteRunningDialog &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { '要取消选中的任务吗？' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { '但如果是下载或上传的是文件夹，文件夹内已完成的文件将保留。' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="放弃" primary onTouchTap={() => this.toggleDialog('deleteRunningDialog')} keyboardFocused />
                    <FlatButton
                      label="取消任务"
                      primary
                      onTouchTap={() => {
                        this.toggleDialog('deleteRunningDialog')
                        this.handleAll(this.state.tasks, 'DELETE')
                      }}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>

        {/* clear Running Tasks dialog */}
        <DialogOverlay open={!!this.state.clearRunningDialog}>
          <div>
            {
              this.state.clearRunningDialog &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { '要取消所有任务吗？' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { '但如果是下载或上传的是文件夹，文件夹内已完成的文件将保留。' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="放弃" primary onTouchTap={() => this.toggleDialog('clearRunningDialog')} keyboardFocused />
                    <FlatButton
                      label="取消任务"
                      primary
                      onTouchTap={() => {
                        this.toggleDialog('clearRunningDialog')
                        this.handleAll(userTasks, 'DELETE')
                      }}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>

        {/* clear Finished Tasks dialog */}
        <DialogOverlay open={!!this.state.clearFinishedDialog}>
          <div>
            {
              this.state.clearFinishedDialog &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>
                    { '要清除所有上传及下载记录吗？' }
                  </div>
                  <div style={{ height: 20 }} />
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { '该操作无法撤销，所有记录将被彻底清除。' }
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.toggleDialog('clearFinishedDialog')} keyboardFocused />
                    <FlatButton
                      label="清除"
                      primary
                      onTouchTap={() => {
                        this.handleAll(this.state.finishTasks, 'DELETE')
                        this.toggleDialog('clearFinishedDialog')
                      }}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>

        {/* error dialog */}
        <DialogOverlay open={!!this.state.errors} onRequestClose={() => this.setState({ errors: null })}>
          { this.state.errors && <ErrorDialogInTrans errors={this.state.errors} resume={this.resume} /> }
        </DialogOverlay>
      </div>
    )
  }
}

export default TrsContainer
