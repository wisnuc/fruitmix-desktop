import React from 'react'
import { Checkbox, Chip } from 'material-ui'

export const SUBTITLE_HEIGHT = 32
export const TABLEHEADER_HEIGHT = 48
export const TABLEDATA_HEIGHT = 48
export const HEADER_HEIGHT = 104
export const FOOTER_HEIGHT = 48
export const SUBTITLE_MARGINTOP = 24
export const alphabet = 'abcdefghijklmnopqrstuvwxyz'

export const styles = {
  chip: {
    backgroundColor: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'medium',
    height: 26,
    marginRight: 5,
    border: '1px solid #e6e6e6'
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  paperHeader: {
    position: 'relative',
    width: '100%',
    height: HEADER_HEIGHT,
    border: '1px solid #e6e6e6',
    display: 'flex',
    alignItems: 'center'
  }
}

export const partitionDisplayName = (name) => {
  const numstr = name.slice(3)
  return `分区 #${numstr}`
}

export const SubTitleRow = props => (
  <div style={{ width: '100%', height: SUBTITLE_HEIGHT, display: 'flex', alignItems: 'center' }}>
    <div style={{ flex: '0 0 256px' }} />
    <div
      style={{ flex: '0 0 184px',
        fontSize: 13,
        color: props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)',
        fontWeight: 'bold'
      }}
    >
      {props.text}
    </div>
  </div>
)

export const VerticalExpandable = props => (
  <div style={{ width: '102%', height: props.height, transition: 'height 300ms', overflow: 'hidden' }}>
    { props.children }
  </div>
)

export const TableHeaderRow = (props) => {
  const style = {
    height: TABLEHEADER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    fontSize: 11,
    color: props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.54)',
    fontWeight: props.disabled ? 'normal' : 'bold'
  }

  return (
    <div style={props.style}>
      <div style={style}>
        { props.items.map((item) => {
          const style = { flex: `0 0 ${item[1]}px` }
          if (item[2] === true) { style.textAlign = 'right' }
          return (<div style={style} key={item.toString()}>{item[0]}</div>)
        }) }
      </div>
    </div>
  )
}

export const TableDataRow = (props) => {
  const containerStyle = {
    height: TABLEDATA_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: props.disabled ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.87)'
  }

  if (!props.disabled && props.selected) { containerStyle.backgroundColor = '#F5F5F5' }

  return (
    <div style={props.style}>
      <div style={containerStyle}>
        { props.items.map((item) => {
          if (typeof item[0] === 'string') {
            const style = { flex: `0 0 ${item[1]}px` }
            if (item[2] === true) style.textAlign = 'right'
            return <div style={style} key={item.toString()}>{item[0]}</div>
          }
          const style = {
            flex: `0 0 ${item[1]}px`,
            display: 'flex',
            alignItems: 'center'
          }

          if (item[2] === true) style.justifyContent = 'center'
          return <div style={style} key={item.toString()}>{item[0]}</div>
        }) }
      </div>
    </div>
  )
}

export const diskDisplayName = (name) => {
  const chr = name.charAt(2)
  const number = alphabet.indexOf(chr) + 1
  return `硬盘 #${number}`
}

export const HeaderTitle1 = props => (
  <div style={props.style} onTouchTap={props.onTouchTap}>
    <div style={{ marginBottom: 2 }}>
      {props.title}
    </div>
    <div style={styles.wrapper}>
      {
        props.textFilesystem &&
        <Chip style={styles.chip} labelStyle={{ marginTop: -4 }}>
          <span style={{ color: '#9e9e9e' }}>
            {props.textFilesystem}
          </span>
        </Chip>
      }
      {
        props.volumemode &&
          <Chip style={styles.chip} labelStyle={{ marginTop: -4 }}>
            <span style={{ color: '#9e9e9e' }}>
              {props.volumemode}
            </span>
          </Chip>
        }
    </div>
  </div>
)

export const Checkbox40 = props => (
  <div style={{ width: 40, height: 40 }}>
    <Checkbox
      {...props} style={{ margin: 8 }}
      iconStyle={{ fill: props.fill }}
    />
  </div>
)

export const HeaderIcon = props => (
  <div
    style={{
      width: 40,
      marginLeft: 24,
      marginTop: 24,
      marginRight: 16
    }}
  >
    { props.children }
  </div>
)
