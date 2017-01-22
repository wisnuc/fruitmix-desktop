import React from 'react'

class FirstUserBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  render() {
    return (
      <Paper key='first-user-box' style={this.props.style}>
        <div style={{
          boxSizing: 'border-box', 
          width:'100%', 
          paddingLeft:64, 
          paddingRight:64, 
          backgroundColor:'#FFF'
        }}>
          <div style={{
            width: '100%', 
            height: '100%', 
            paddingTop: 16, // line padding
            display: 'flex', 
            justifyContent: 'flex-start', 
            flexWrap: 'wrap'
          }}>
            { this.users && 
                this.users.map((user, index) => 
                  <NamedAvatar 
                    key={user.uuid} 
                    style={{marginRight:16, marginBottom:16}} 
                    name={user.username} 
                    onTouchTap={() => {

                      this.inputValue = ''
                      this.setState(Object.assign({}, this.state, { selectedIndex: index }))
                      this.props.onResize('VEXPAND')
                    }}

                  />)}
          </div>
        </div>
        <Paper style={{
          boxSizing: 'border-box', 
          width: '100%', 
          height: this.state.selectedIndex !== -1 ? 240 : 0, 
          backgroundColor: '#FAFAFA', 
          paddingLeft: 64, 
          paddingRight: 64, 
          overflow: 'hidden', 
          transition: 'all 300ms'
        }}>
          { this.state.selectedIndex !== -1 && this.renderLoginBox() }
        </Paper>
      </Paper>
    )
  }
}
