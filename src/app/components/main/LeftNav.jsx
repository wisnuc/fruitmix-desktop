/**
 * @component leftNav
 * @description leftNavigation
 * @time 2016-4-27
 * @author liuhua
 **/

 // require core module
 import React, { findDOMNode, Component, PropTypes } from 'react';

//require material
import { Menu, MenuItem } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import svg from '../../utils/SVGIcon';

 //import CSS
import css  from  '../../../assets/css/main';

//import action 
import Action from '../../actions/action';
const style = {
	margin:0,
	width:200,
	padding:0
};

const listStyle = {
	height: 48,
	lineHeight:'48px',
	paddingLeft:50
}

class leftNav extends Component {

	itemSelect (name,index,e) {
		this.props.dispatch(Action.changeSelectedNavItem(name));
	}

	getChildContext() {
		const muiTheme = getMuiTheme(lightBaseTheme);
		return {muiTheme};
	}

	render () {
		return (
			<div className="left-nav-container" style={{position:'relative',height:'100%'}}>
				<Menu style={style}>
				{this.props.nav.nav.map((item,index) => {
					if (item.type == 'leftNav') {
						return (
							<MenuItem 
							className={item.selected?"list-selected":''}
							primaryText={item.name} 
							key={item.name} 
							desktop={true} 
							onTouchTap={this.itemSelect.bind(this,item.name,index)}
							style={style}
							innerDivStyle={listStyle}
							leftIcon={item.icon?svg[item.icon]():null}
							/>
							)
						}
				})}
				</Menu>
				<div style={{position:'absolute',bottom:0,width:'100%'}}>
					
					<div>
						<Menu>
							{this.props.nav.nav.map((item,index) => (
								item.type=='other'?<MenuItem primaryText={item.name}
								className={item.selected?"list-selected":''}
								style={style}
								innerDivStyle={listStyle}
								leftIcon={item.icon?svg[item.icon]():null} 
								onTouchTap={this.itemSelect.bind(this,item.name,index)}
								key={item.name} 
								 />:false
								))}
						</Menu>
					</div>
				</div>
			</div>
			)
	}
}

leftNav.childContextTypes = {
	muiTheme: React.PropTypes.object.isRequired
}

export default leftNav