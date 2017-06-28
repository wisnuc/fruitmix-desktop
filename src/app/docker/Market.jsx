import React from 'react'
import Debug from 'debug'
import prettysize from 'prettysize'
import { IconButton, Subheader }from 'material-ui'
import {GridList, GridTile} from 'material-ui/GridList'
import StarBorder from 'material-ui/svg-icons/toggle/star-border'

const debug = Debug('component:control:deviceinfo')

class Market extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    debug('this.props.device', this.props)
    if (!this.props.docker || !this.props.docker.appstore) return <div>Loading...</div>
    const appstore = this.props.docker.appstore.result
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
        hello world
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GridList
            cellHeight="auto"
            style={{ width: 1200, height: 600, overflowY: 'auto' }}
            padding={24}
            cols={6}
          >
            <Subheader>December</Subheader>
            { appstore.map((app) => (
              <GridTile
                key={app.key}
                title={app.name}
                subtitle={app.flavor}
                actionIcon={<IconButton><StarBorder color="white" /></IconButton>}
              >
                <img
                  src={'https://raw.githubusercontent.com/wisnuc/appifi-recipes/release/images/owncloud.png'}
                />
              </GridTile>
            ))}
          </GridList>
        </div>
      </div>
    )
  }
}

export default Market
