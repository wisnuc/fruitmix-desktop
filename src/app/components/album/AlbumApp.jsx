import React from 'react'
import Debug from 'debug'
import EventListener from 'react-event-listener'
import { FloatingActionButton, Paper, Menu, MenuItem, Divider, IconButton, CircularProgress } from 'material-ui'

const debug = Debug('component:photoApp:')

class AlbumApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  handleResize = () => {
    this.forceUpdate()
  }

  render() {
    debug('AlbumApp, this.props', this.props)
    return (
      <Paper>
        <EventListener
          target="window"
          onResize={this.handleResize}
        />
        hello world!
      </Paper>
    )
  }
}

export default AlbumApp
