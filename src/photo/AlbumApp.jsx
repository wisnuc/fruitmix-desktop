import React from 'react'
import Debug from 'debug'
import EventListener from 'react-event-listener'
import { FloatingActionButton, Paper, Menu, MenuItem, Divider, IconButton, CircularProgress, Card } from 'material-ui'

const debug = Debug('component:photoApp:')

class AlbumApp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    }

    this.handleResize = () => {
      this.forceUpdate()
    }

    this.openAlbum = (digest) => {
      debug('this.openAlbum', digest)
      const index = this.props.mediaShare.findIndex(item => (item.digest === digest))
      debug('findIndex', index, this.props.mediaShare[index])
    }
  }

  render() {
    debug('AlbumApp, this.props', this.props)
    const albums = this.props.mediaShare
    const mediaPath = '../media/'
    if (!albums) return <div />
    debug('albums', albums)
    return (
      <Paper
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          width: '100%',
          height: '100%'
        }}
      >
        <EventListener
          target="window"
          onResize={this.handleResize}
        />
        {
          albums.map(album => (
            <Paper
              key={album.digest}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                flexDirection: 'column',
                margin: 8
              }}
              onTouchTap={() => this.openAlbum(album.digest)}
            >
              <img
                alt="img"
                src={`${mediaPath}${album.doc.contents[0].digest}&height=210&width=210`}
                height={210}
                width={210}
              />
              <br />
              <span>{album.doc.album.title}</span>
              <br />
              <span>{album.doc.album.text}</span>
            </Paper>
            ))
        }
      </Paper>
    )
  }
}

export default AlbumApp
