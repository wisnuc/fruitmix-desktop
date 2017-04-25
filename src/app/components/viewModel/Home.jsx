import React from 'react'
import Radium from 'radium'

import { IconButton } from 'material-ui'
import { blue800, indigo700, indigo500, teal500 } from 'material-ui/styles/colors'
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
      <div style={style}>
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
    this.state = { select: this.select.state } 
  }

  setState(props) {
    this.state = Object.assign({}, this.state, props)
    this.emit('updated', this.state)
  }

  willReceiveProps(nextProps) { 
    console.log('true home nextProps', nextProps) 

    if (!nextProps.apis || !nextProps.apis.listNavDir) return

    let listNavDir = nextProps.apis.listNavDir
    if (listNavDir.isPending() || listNavDir.isRejected()) return

    // now it's fulfilled
    let value = listNavDir.value()
    if (value !== this.state.listNavDir) {
      this.setState({ listNavDir: value })
      this.select.reset(value.entries.length)
    }
  }

  navEnter() {
    console.log('home enter')
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

    return (
      <div id='file-breadcrumbs' style={style}>
        <BreadCrumbItem text="我的文件" />
        <BreadCrumbSeparator />
        <BreadCrumbItem text="马大哈" />
        <BreadCrumbSeparator />
        <BreadCrumbItem text="5f9a02c4-50e7-440d-af25-6a71b1594447" />
        <BreadCrumbSeparator />
        <BreadCrumbItem text="Hello" />
        <BreadCrumbSeparator />
        <BreadCrumbItem text="Hello" />
        <BreadCrumbSeparator />
        <BreadCrumbItem text="Hello" />
        <BreadCrumbSeparator />
        <BreadCrumbItem text="Hello" />
        <BreadCrumbSeparator />
        <BreadCrumbItem text="Hello" />
        <BreadCrumbSeparator />
        <BreadCrumbItem text="Hello" selected={true} />
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
    return <FileContent home={this.state} />
  }
}

export default Home

