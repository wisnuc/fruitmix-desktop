import React from 'react'
import Radium from 'radium'

@Radium
export class BreadCrumbItem extends React.PureComponent {
  render() {
    return (
      <div
        style={{
          cursor: 'pointer',
          borderRadius: 2, // mimic a flat button
          height: 32,
          paddingLeft: 8,
          paddingRight: 8,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0)',
          ':hover': {
            backgroundColor: 'rgba(255,255,255,0.14)' // value from material-component card example
          }
        }}
        onTouchTap={this.props.onTouchTap}
      >
        <div
          style={{
            maxWidth: '100px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}
        >
          { this.props.text }
        </div>
      </div>
    )
  }
}

export class BreadCrumbSeparator extends React.PureComponent {
  render() {
    return (
      <div style={{ height: 32, width: 8, display: 'flex', alignItems: 'center' }}>
        &rsaquo;
      </div>
    )
  }
}
