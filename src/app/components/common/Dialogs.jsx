import Debug from 'debug'

import React from 'react'
import { Dialog, Divider, FlatButton, TextField } from 'material-ui'
import UUID from 'node-uuid'

import TreeTable from './TreeTable'

export class DialogInput extends React.Component {

  constructor(props) {
    super(props)
    this.inputValue = props.value || ''
    this.id = UUID.v4()
  }

  render() {

    const actions = [
      <FlatButton
        label="取消"
        onTouchTap={() => this.props.onCancel()}
        labelStyle={{fontSize:'15px', fontWeight: 'medium'}}
      />,
      <FlatButton
        label="确认"
        primary={true}
        onTouchTap={() => this.props.onOK(this.inputValue)}
        labelStyle={{fontSize:'15px', fontWeight: 'medium'}}
      />,
    ]    

    return (
      <Dialog
        title={this.props.title}
        actions={actions}
        modal={true}
        contentStyle={{width:480}}
        open={this.props.open}
      >
        <TextField 
          id={this.id}
          hintText={this.props.hint}
          fullWidth={true}
          ref={input => {
            if (input) {
              if (this.inputValue) 
                input.value = this.inputValue
              input.focus()
            }
          }}

          onChange={e => {
            this.inputValue = e.target.value
          }}
        />
      </Dialog>
    )
  }
}

export class DialogConfirm extends React.Component {

  constructor(props) {
    super(props)
  } 

  render() {

    const actions = [
      <FlatButton
        label="取消"
        onTouchTap={() => this.props.onCancel()}
        labelStyle={{fontSize:'15px', fontWeight: 'medium'}}
      />,
      <FlatButton
        label="确认"
        primary={true}
        onTouchTap={() => this.props.onOK(this.inputValue)}
        labelStyle={{fontSize:'15px', fontWeight: 'medium'}}
      />,
    ]    

    return (
      <Dialog
        title={this.props.title}
        actions={actions}
        modal={true}
        contentStyle={{width:400}}
        open={this.props.open} 
      />
    )
  }
}

// 1. data, may changed over render
// 2. status
//   2.1 close
//   2.2 open
//     2.2.1 ready / hint
//     2.2.2 busy / hint
//     2.2.3 error / message

export class DialogImportFile extends React.Component {

  constructor(props) {
    super(props)
    this.state = { 
      select: null 
    }

    this.cancel = () => {
      this.setState(Object.assign({}, this.state, { select: null }))
      this.props.onCancel()
    }
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.open && !this.props.open) {
      this.setState({ select: null })
    }
  }

  render() {

    return (
      <Dialog
        contentStyle={{width: 672}}
        titleStyle={{fontSize: 20}}
        title='导入文件'
        open={this.props.open}
        model={true}
        onRequestClose={this.cancel}
      >
        <p>'选择需要导入的文件夹，点击确定，该文件夹将被移动到当前用户的当前文件夹。'</p>

        <Divider />
        <TreeTable 
          style={{width: '100%', height: 400}}
          data={this.props.data}
          columns={this.props.columns}
          showHeader={this.props.showHeader}
          select={this.state.select}
          onSelect={select => {
            this.setState(Object.assign({}, this.state, { select }))
          }}
        />

        <div style={{
          marginTop: 24, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end'
        }}>
          <FlatButton 
            label='取消' 
            primary={true}
            onTouchTap={this.cancel}
          />
          <FlatButton 
            label='确认' 
            primary={true}
            disabled={this.state.select === null}
            onTouchTap={() => this.state.select && this.props.onOK(this.state.select)}
          />
        </div>
      </Dialog>
    )
  }
}



















