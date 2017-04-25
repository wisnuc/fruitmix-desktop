import React from 'react'
import Radium from 'radium'

import { IconButton } from 'material-ui'
import { orange700, blue700, indigo700, indigo500, teal500 } from 'material-ui/styles/colors'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'

import ListSelect from '../file/ListSelect2'
import Base from './Base'

import FileContent from '../file/FileContent'

@Radium
class BreadCrumbItem extends React.PureComponent {

  render() {

    let style = {
      cursor: 'pointer',
      borderRadius: 2, // mimic a flat button
      height: 32,
      paddingLeft: 8, 
      paddingRight: 8, 
      backgroundColor: 'rgba(255,255,255,0)',
      ':hover': {
        backgroundColor: 'rgba(255,255,255,0.14)' // value from material-component card example
      }
    }

    return (
      <div style={style} onTouchTap={this.props.onTouchTap}>
        { this.props.text }   
      </div>
    )
  }
}

class BreadCrumbSeparator extends React.PureComponent {

  render() {
    return (
      <div style={{height:32, width:8, display:'flex', flexDirection:'column', alignItems:'center'}}>
        &rsaquo;
      </div>
    )
  }
}

class Home extends Base {

  constructor(ctx) {

    super(ctx)
    this.select = new ListSelect(this)
    this.select.on('updated', next => this.setState({ select: next }))
    this.state = { 

      select: this.select.state,
      listNavDir: null, // save a reference
      path: [],         // 
      entries: [],      // sorted
    } 

    this.onListNavBySelect = this.listNavBySelect.bind(this)
  }

  listNavBySelect() {

    let selected = this.select.state.selected
    if (selected.length !== 1) return

    let entry = this.state.entries[selected[0]]
    if (entry.type !== 'folder') return

    this.ctx.props.apis.request('listNavDir', {
      dirUUID: entry.uuid,
      rootUUID: this.state.path[0].uuid
    })
  }

  setState(props) {
    this.state = Object.assign({}, this.state, props)
    this.emit('updated', this.state)
  }

  updateState(listNavDir) {

    if (listNavDir === this.state.listNavDir) return

    let { path, entries } = listNavDir

    entries = [...entries].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'folder') return 1
      return a.name.localeCompare(b.name)
    })
 
    let select = this.select.reset(entries.length) 
    let state = { select, listNavDir, path, entries }
    
    console.log('home updating state', state)
    this.setState(state)
  }

  willReceiveProps(nextProps) { 

    if (!nextProps.apis || !nextProps.apis.listNavDir) return
    let listNavDir = nextProps.apis.listNavDir
    if (listNavDir.isPending() || listNavDir.isRejected()) return
    this.updateState(listNavDir.value())
  }

  navEnter() {

    if (!this.ctx.props.apis || !this.ctx.props.apis.listNavDir) return
    let listNavDir = this.ctx.props.apis.listNavDir
    if (listNavDir.isPending() || listNavDir.isRejected()) return
    this.updateState(listNavDir.value())
  }

  navLeave() {
    console.log('home leave')
  }

  navGroup() {
    return 'file'
  }

  menuName() {
    return '我的文件'
  }

  menuIcon() {
    return FileFolder
  }

  quickName() {
    return '我的文件'
  }

  quickIcon() {
    return FileFolder 
  }

  appBarStyle() {
    return 'colored'
  }

  appBarColor() {
    return teal500
  }

  primaryColor() {
    return teal500
  }

  prominent() {
    return true
  }

  hasDetail() {
    return true
  }

  detailEnabled() {
    return true
  }

  detailWidth() {
    return 400
  }

  // breadcrumb
  renderTitle({style}) {

    if (!this.state.listNavDir) return

    const path = this.state.path

    // each one is preceded with a separator, except for the first one
    // each one is assigned an action, except for the last one
    return (
      <div id='file-breadcrumbs' style={style}>
        { this.state.listNavDir.path.reduce((acc, node, index, arr) => {

          if (index !== 0) acc.push(<BreadCrumbSeparator />)

          if (index === 0) { // the first one is always special
            acc.push(
              <BreadCrumbItem text='我的文件' 
                onTouchTap={() => this.ctx.props.apis.request('listNavDir', {
                  dirUUID: path[0].uuid,
                  rootUUID: path[0].uuid,
                })}
              />
            )
          }
          else if (index === arr.length - 1) {
            acc.push(<BreadCrumbItem text={node.name} />)
          } 
          else {
            acc.push(<BreadCrumbItem text={node.name} />)
          }
          return acc
        }, [])}
      </div>
    )
  }

  renderToolBar({style}) {

    return (
      <div style={style}>
        <IconButton><FileCreateNewFolder color='#FFF' /></IconButton>
      </div>
    )
  }

  renderDetail({style}) {
  }

  renderContent() {
    return (
      <FileContent 

        home={this.state} 
        select={this.state.select} 
        entries={this.state.entries} 

        listNavBySelect={this.onListNavBySelect}
      />
    )
  }
}

export default Home

