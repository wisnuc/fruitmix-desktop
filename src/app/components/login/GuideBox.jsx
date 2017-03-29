import React from 'react'

import FlatButton from '../common/FlatButton'

import InitStep from './InitStep'

class GuideBox extends React.Component {

  constructor(props) {

    super(props)
    this.state = {
      expanded: false,
      showContent: false,
		}
	}

	childExpanded (newExpanded) {
		this.setState({
			expanded: newExpanded
		})
	}

	childShowContent (newShwoContent) {
		this.setState({
		  showContent: newShowContent
		})
	}


  render() {

		console.log('this.props.volumes',this.props)
    return (
      <div style={{width: '100%'}}>
        <div style={{width: '100%', height: '100%'}}>
					<InitStep
						expanded={this.state.expanded}
						showContent={this.state.showContent}
						onResize={this.props.onResize}
						storage={this.props.storage}
						callbackExpanded={this.childExpanded}
						callbackShowContent={this.childShowContent}
					/>
          <div style={{width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFA'}}>
            <div style={{marginLeft: 24, display: this.state.expanded ? 'none' : 'block'}}>该设备已安装WISNUC OS，但尚未初始化。</div>

            <FlatButton style={{marginRight: 16, display:this.state.expanded ? 'none' : 'block'}} label={'初始化'}
              onTouchTap={() => {
                  this.setState(Object.assign({}, this.state, { expanded: true }))
                  this.props.onResize('VEXPAND')
                  setTimeout(() => {
                    this.props.onResize('HEXPAND')
                    setTimeout(() => {
                      this.setState(Object.assign({}, this.state, { showContent: true }))
                    }, 350)
                  }, 350)
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default GuideBox
