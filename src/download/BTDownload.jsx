import React from 'react'
import Debug from 'debug'
import { ipcRenderer } from 'electron'
import { CircularProgress, FloatingActionButton } from 'material-ui'
import { List, AutoSizer } from 'react-virtualized'
import { Paper, Menu, MenuItem } from 'material-ui'
import DeleteSvg from 'material-ui/svg-icons/action/delete'
import PlaySvg from 'material-ui/svg-icons/av/play-arrow'
import PauseSvg from 'material-ui/svg-icons/av/pause'
import ContentAdd from 'material-ui/svg-icons/content/add'

import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/DialogOverlay'
import PureDialog from '../common/PureDialog'

const debug = Debug('component:download:')

class BTDownload extends React.Component {
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
      loading: true
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

    /* actions */
    this.pause = (uuid) => {
    }

    this.resume = (uuid) => {
    }

    this.destroy = (uuid) => {
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keydown)
    document.addEventListener('keyup', this.keyup)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tasks && this.props.tasks !== nextProps.tasks) this.setState({ loading: false })
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keydown)
    document.removeEventListener('keyup', this.keyup)
  }

  renderNoTasks() {
    return (
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onTouchTap={e => this.onRowTouchTap(e, -1)}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#FAFAFA'
          }}
        >
          <UploadIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} />
          <div style={{ color: 'rgba(0,0,0,0.27)' }}> { '请点击左上按钮添加新的下载任务' } </div>
        </div>
      </div>
    )
  }

  renderOffLine() {
    return (
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onTouchTap={e => this.onRowTouchTap(e, -1)}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#FAFAFA'
          }}
        >
          <ErrorIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} />
          <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.27)' }}> { '网络连接已断开，请检查网络设置' } </div>
        </div>
      </div>
    )
  }

  renderLoading() {
    return (
      <div style={{ width: '100%', height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <CircularProgress size={32} thickness={3} />
      </div>
    )
  }

  renderRow(task) {
    const { magnetURL, name, downloadPath, progress, downloadSpeed, downloaded, timeRemaining } = task
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 22px',
          height: 56,
          fontSize: 14,
          color: 'rgba(0,0,0,0.87)',
          backgroundColor: this.state.isSelected ? '#f4f4f4' : ''
        }}
      >
        {/* task item type */}
        <div style={{ width: 56, height: 56, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              width: 36,
              height: 36,
              border: '4px solid grey',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
          >
            { `${Math.round(progress * 1000) / 10}%` }
          </div>
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              width: 36,
              height: 36,
              transform: 'rotate(45deg)',
              border: '4px solid transparent',
              borderTop: `4px solid ${this.props.primaryColor}`,
              borderRight: `4px solid ${this.props.primaryColor}`,
              borderRadius: '50%'
            }}
          />
        </div>

        {/* task item name */}
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', marginLeft: 24 }} >
          <div
            style={{
              maxWidth: 264,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            { name || magnetURL}
          </div>
        </div>


        {/* progress bar */}
        <div style={{ flex: '0 0 240px' }}>
          <div
            style={{
              display: 'flex',
              width: 200,
              height: 6,
              marginRight: 12,
              borderRadius: 2,
              backgroundColor: 'rgba(0,0,0,.12)'
            }}
          >
          </div>
        </div>
      </div>
    )
  }

  render() {
    debug('render BTDownload', this.state, this.props)
    /* lost connection to wisnuc */
    if (!window.navigator.onLine) return this.renderOffLine()

    /* loding */
    if (this.state.loading) return this.renderLoading()

    /* no tasks */
    if (this.props.tasks && !this.props.tasks.length) return this.renderNoTasks()

    return (
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        {/* FAB */}
        <FloatingActionButton
          style={{ position: 'absolute', top: -36, left: 24, zIndex: 200 }}
          secondary
          onTouchTap={() => this.setState({ newDownload: true })}
        >
          <ContentAdd />
        </FloatingActionButton>
        {/* list */}
        <div style={{ height: 48 }} />
        {
          this.props.tasks.map(task => this.renderRow(task))
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
      </div>
    )
  }
}

export default BTDownload
