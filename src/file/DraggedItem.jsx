import React from 'react'
import { Avatar } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import ErrorIcon from 'material-ui/svg-icons/alert/error'

import renderFileIcon from '../common/renderFileIcon'

const DraggedItem = ({ onMouseUp, onMouseMove, primaryColor, entry, selected, shouldFire }) => {
  return (
    <div
      id="draggedItem"
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        marginLeft: 0,
        opacity: 0,
        width: '100%',
        height: 48,
        transition: 'all 225ms cubic-bezier(.4,0,1,1)',
        transitionProperty: 'top, left, width, opacity',
        display: 'none',
        alignItems: 'center',
        color: '#FFF',
        boxShadow: '2px 2px 2px rgba(0,0,0,0.27)',
        backgroundColor: primaryColor
      }}
    >
      <div style={{ flexGrow: 1, maxWidth: 48 }} />
      {/* file type may be: folder, public, directory, file, unsupported */}
      <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', margin: 12 }}>
        <Avatar style={{ backgroundColor: 'white', width: 36, height: 36 }}>
          {
            entry.type === 'directory'
            ? <FileFolder style={{ color: 'rgba(0,0,0,0.54)', width: 24, height: 24 }} />
            : entry.type === 'file'
            ? renderFileIcon(entry.name, entry.metadata, 24)
            : <ErrorIcon style={{ color: 'rgba(0,0,0,0.54)', width: 24, height: 24 }} />
          }
        </Avatar>
      </div>
      <div
        style={{
          width: 114,
          marginRight: 12,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }}
      >
        { entry.name }
      </div>
      {
        selected.length > 1 &&
          <div
            style={{
              position: 'absolute',
              top: -12,
              right: -12,
              width: 24,
              height: 24,
              borderRadius: 12,
              boxSizing: 'border-box',
              backgroundColor: shouldFire() ? primaryColor : '#FF4081',
              border: '1px solid rgba(0,0,0,0.18)',
              color: '#FFF',
              fontWeight: 500,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            { selected.length }
          </div>
      }
    </div>
  )
}

export default DraggedItem
