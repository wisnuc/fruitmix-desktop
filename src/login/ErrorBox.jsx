import React from 'react'
import { clipboard } from 'electron'
import { IconButton, Dialog, RaisedButton } from 'material-ui'
import AlertError from 'material-ui/svg-icons/alert/error'

class ErrorBox extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { open: false }
  }

  render() {
    return (
      <div style={this.props.style}>
        <div>{this.props.text}</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onTouchTap={() => this.setState(state => Object.assign({}, state, { open: true }))}>
            <AlertError />
          </IconButton>
          <Dialog
            titleStyle={{ fontSize: 20 }}
            title="错误信息"
            modal={false}
            open={this.state.open}
            onRequestClose={() => this.setState(state => Object.assign({}, state, { open: false }))}
          >
            <textarea style={{ width: '100%', height: 480, resize: 'none' }} value={this.props.error} readOnly disabled />
            <RaisedButton style={{ marginTop: 24 }} label="复制到剪贴板" primary onTouchTap={() => clipboard.writeText(this.props.error)} />
          </Dialog>
        </div>
      </div>
    )
  }
}

export default ErrorBox

