import React from 'react'
import FlatButton from '../common/FlatButton'
import InitStep from './InitStep'

class InfoBar extends React.PureComponent {
  render() {
    return (
      <div style={{width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFA'}}>
        <div style={{marginLeft: 24}}>该设备已安装WISNUC OS，但尚未初始化。</div>
        <FlatButton style={{marginRight: 16}} label={'初始化'} 
          onTouchTap={() => {
          console.log(this.props)
          this.props.requestExpand()
        }} />
      </div>
    ) 
  }
}

class GuideBox extends React.Component {

  constructor(props) {
    super(props)
	}

  render() {

    return (
      <div style={this.props.style}>
        { this.props.transform !== 'normal' && 
          <InitStep {...this.props} /> }
        { this.props.transform === 'normal' && <InfoBar {...this.props} /> }
      </div>
    )
  }
}

export default GuideBox

