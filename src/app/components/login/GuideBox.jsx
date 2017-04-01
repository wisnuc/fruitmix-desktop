import React from 'react'

import FlatButton from '../common/FlatButton'

import InitWiard from './InitWiard'
import { Paper, RaisedButton, IconButton, Dialog } from 'material-ui'

const GuideFooter = (props) => {
	return (
		<div style={{width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFA'}}>
			<div style={{marginLeft: 24}}>该设备已安装WISNUC OS，但尚未初始化。</div>
			<FlatButton style={{marginRight: 16}} label={'初始化'} onTouchTap={props.onOpen}/>
		</div>
	)
}

const TransitionCard = (props) => {
	return (
		<div style={{ height: props.initWiard === 'opening' || props.initWiard === 'closeing' ? 680 : 64, transition: 'height 350ms' }}>
			<Paper style={{height: '100%', width: '100%'}} />
		</div>
	)
}

const GuideBox = (props) => {

		console.log('&*&*&*&*',props.initWiard)
		console.log('!!!!!!!!!!!)))',props.onMaintain)
    return (
			<div style={{width: '100%', height: '100%'}}>
					{
						props.initWiard === 'close' ? <GuideFooter onOpen={props.onOpen}/> :
							props.initWiard === 'opening' || props.initWiard === 'closeing' ?
							<TransitionCard initWiard={props.initWiard} /> :
							<InitWiard
								storage={props.storage}
								onClose={props.onClose}
								onMaintain={props.onMaintain}
							/>
					}
				</div>
    )
}

export default GuideBox
