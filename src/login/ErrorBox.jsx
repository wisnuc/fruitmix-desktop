import React from 'react'
import { clipboard } from 'electron'
import JSONTree from 'react-json-tree'
import { IconButton, Dialog, RaisedButton } from 'material-ui'
import AlertError from 'material-ui/svg-icons/alert/error'

class ErrorBox extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { open: false }
  }

  render() {
    const theme = {
      scheme: 'wisnuc',
      author: 'lxw',
      base00: '#1d1f21',
      base01: '#282a2e',
      base02: '#373b41',
      base03: '#969896',
      base04: '#b4b7b4',
      base05: '#c5c8c6',
      base06: '#e0e0e0',
      base07: '#ffffff',
      base08: '#CC342B',
      base09: '#F96A38',
      base0A: '#FBA922',
      base0B: '#00897b',
      base0C: '#3971ED',
      base0D: '#3971ED',
      base0E: '#A36AC7',
      base0F: '#3971ED'
    }
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
            <div style={{ height: 480, overflow: 'auto' }}>
              <JSONTree
                hideRoot
                theme={theme}
                data={this.props.error}
                shouldExpandNode={() => true}
                getItemString={type => (<span>{ type }</span>)}
                valueRenderer={raw => <span style={{ userSelect: 'text' }}>{raw}</span>}
              />
            </div>
            <RaisedButton style={{ marginTop: 24 }} label="复制到剪贴板" primary onTouchTap={() => clipboard.writeText(this.props.error)} />
          </Dialog>
        </div>
      </div>
    )
  }
}

export default ErrorBox

