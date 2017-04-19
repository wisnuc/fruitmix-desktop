import React from 'react'

import { IconButton } from 'material-ui'
import FileCreateNewFolder from 'material-ui/svg-icons/file/create-new-folder'

// file toolbar has the following props
// 1. model
// 2. nav showDetail (state)
// 3. nav toggleShowDetail
class FileToolBar extends React.PureComponent {

  render() {
    return (
      <div>
        <IconButton><FileCreateNewFolder /></IconButton>
      </div>
    )
  }
}

export default FileToolBar

