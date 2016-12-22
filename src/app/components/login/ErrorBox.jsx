import { clipboard } from 'electron'

import React from 'react'
import { IconButton, Dialog, RaisedButton } from 'material-ui'
import AlertError from 'material-ui/svg-icons/alert/error'
import ActionSettingsPower from 'material-ui/svg-icons/action/settings-power'


class ErrorBox extends React.Component {

  propTypes: {
    text: React.PropTypes.string.isRequired,
    error: React.PropsType.string.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
  }

  render() {
    return (
      <div 
        style={{
          width: '100%', height: 64, backgroundColor: '#FFF',
          boxSizing: 'border-box', paddingLeft: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}
      >
        <div>{this.props.text}</div>
        <div style={{ display: 'flex', alignItems: 'center'}}>
          <IconButton onTouchTap={() => this.setState(state => Object.assign({}, state, { open: true }))}>
            <AlertError />
          </IconButton> 
          <Dialog
            titleStyle={{fontSize:20}}
            title='错误信息'
            modal={false}
            open={this.state.open}
            onRequestClose={() => this.setState(state => Object.assign({}, state, { open: false })) }
          >
            <textarea style={{width:'100%', height:480, resize: 'none'}} value={this.props.error} readonly={true} disabled={true}></textarea>
            <RaisedButton style={{marginTop: 24}} label='复制到剪贴板' primary={true} onTouchTap={() => clipboard.writeText(this.props.error)} />
          </Dialog>
        </div>
      </div>
    )
  }
}

export default ErrorBox

