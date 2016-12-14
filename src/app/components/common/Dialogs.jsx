import React from 'react'
import { Dialog, FlatButton, TextField } from 'material-ui'
import UUID from 'node-uuid'

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

export class DialogImportFile extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Dialog
        titleStyle={{fontSize: 20}}
        title='导入文件夹'
        open={this.props.open}
        model={true}
        onRequestClose={this.props.onCancel}
      >
        <Divider />
        <TreeTable 
          data={this.props.data}
          columns={this.props.columns}
          showHeader={this.props.showHeader}
          disabled={this.props.disabled}
        />
      </Dialog>
    )
  }
}



















