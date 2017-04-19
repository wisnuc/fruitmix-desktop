import React, { Component, PureComponent } from 'react'

class FileContent extends Component {
 
  constructor(props) {
    super(props)
  } 

  render() {

    /**
    let home = this.props.home
    if (home.isPending()) {
      return <div>loading...</div>
    }
    **/

    return (
      <div>loaded</div>
    )
  }
}

export default FileContent

