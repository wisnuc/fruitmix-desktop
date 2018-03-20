import React from 'react'
import { Avatar, IconButton } from 'material-ui'
import CloseIcon from 'material-ui/svg-icons/navigation/close'

import { formatMtime } from '../common/datetime'
import renderFileIcon from '../common/renderFileIcon'

class Row extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hover: ''
    }
  }

  render () {
    // console.log('Row', this.props)
    const { uuid, mtime, metadata, name, action, height } = this.props
    const color = '#FFF'
    const hoverColor = '#EEEEEE'
    const hovered = this.state.hover === uuid
    if (!name) return <div />
    return (
      <div key={uuid}>
        <div
          style={{
            width: '100%',
            height: height || '100%',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            backgroundColor: hovered ? hoverColor : color,
            boxSizing: 'border-box'
          }}
          onMouseMove={() => this.state.hover !== uuid && this.setState({ hover: uuid })}
          onMouseLeave={() => this.setState({ hover: '' })}
        >
          {/* file type may be: folder, public, directory, file, unsupported */}
          <div style={{ flex: '0 0 48px', display: 'flex', alignItems: 'center' }} >
            <Avatar style={{ backgroundColor: '#FFF' }}>
              { renderFileIcon(name, metadata, 24) }
            </Avatar>
          </div>

          <div style={{ flex: '0 1 216px', display: 'flex' }} >
            <div style={{ width: 192, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} >
              { name }
            </div>
            <div style={{ width: 24 }} />
          </div>

          <div style={{ flex: '0 1 144px', fontSize: 13, color: 'rgba(0,0,0,.54)' }}>
            { mtime && formatMtime(mtime) }
          </div>
          <div style={{ flexGrow: 1 }} />
          {
            action &&
              <div
                style={{
                  left: 0,
                  height: '100%',
                  position: 'absolute',
                  opacity: hovered ? 1 : 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <IconButton
                  iconStyle={{ width: 24, height: 24, color: '#424242' }}
                  style={{ width: 40, height: 40, padding: 8, backgroundColor: hoverColor }}
                  onTouchTap={() => action(uuid)}
                >
                  <CloseIcon />
                </IconButton>
              </div>
          }
        </div>
      </div>
    )
  }
}

export default Row
