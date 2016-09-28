/**
 * @component leftNav
 * @description leftNavigation
 * @time 2016-4-27
 * @author liuhua
 **/

 // require core module
import React, { findDOMNode, Component, PropTypes } from 'react';

//require material
import { Menu, MenuItem, SvgIcon } from 'material-ui';
import svg from '../../utils/SVGIcon';

 //import CSS
import css  from  '../../../assets/css/main';

//import action
import Action from '../../actions/action';
const style = {
	margin:0,
	padding:0,
	width: 220
};

const listStyle = {
	height: 55,
	lineHeight:'55px',
	paddingLeft:50,
	color:'#fff',
	fontSize: 12,
	paddingLeft: 60
}
const selectedStyle = {
	height: 55,
	lineHeight:'55px',
	paddingLeft:50,
	color:'#ef6c00',
	fontSize: 12,
	paddingLeft: 60
}

function getStyles () {
	return {
		header: {
			display: 'block',
			lineHeight: '38px',
			fontSize: 14,
			fontWeight: 700,
			color: '#1e1e1e',
			paddingLeft: 56,
			backgroundColor: '#e5e5e5'
		}
	}
}

class leftNav extends Component {
	render () {
		return (
			<div className="left-nav-container" style={{position:'relative',height:'100%'}}>
				{/*top navigation*/}
				<div className="nav-inner">
				  <div className="nav-item-box">
						<label htmlFor="file_h" className="nav-item-header" style={ getStyles().header }>文件</label>
						<input id="file_h" className="slide-emit" type="checkbox" />
						<div className="nav-item-body file-item-body">
							{this.props.state.navigation.nav.map((item,index) => {
								if (item.type == 'leftNav' && index <= 3) {
									return (
										<MenuItem
										className={item.selected?"list-selected left-menu-list":'left-menu-list'}
										primaryText={item.name}
										key={item.name}
										desktop={true}
										onTouchTap={this.itemSelect.bind(this,item.name,index)}
										innerDivStyle={item.selected?selectedStyle:listStyle}
										leftIcon={item.icon?svg[item.icon]():null}
										/>
										)
									}
							})}
						</div>
				  </div>
					<div className="nav-item-box">
						<label htmlFor="photo_h" className="nav-item-header" style={ getStyles().header }>照片</label>
						<input id="photo_h" className="slide-emit" type="checkbox" />
						<div className="nav-item-body photo-item-body">
							{
								this.props.state.navigation.nav.map((item, index) => {
									if (item.type == 'leftNav' && index >= 4) {
										return (
											<MenuItem
											  className={ item.selected ? "list-selected left-menu-list" : 'left-menu-list' }
												primaryText={ item.name }
												key={ item.name }
												desktop={ true }
												onTouchTap={ this.itemSelect.bind(this,item.name,index) }
												innerDivStyle={ item.selected ? selectedStyle : listStyle }
												leftIcon={ item.icon ? svg[item.icon]() : null }>
											</MenuItem>
										);
									}
							  })
						  }
						</div>
					</div>
					<div className="nav-item-box">
						<div className="nav-item-header" style={ getStyles().header }>系统</div>
						<div className="nav-item-body"></div>
					</div>
				</div>
				{/*bottom navigation*/}
				{/*}<div style={{position:'absolute',bottom:0,width:'100%'}}>
					<div>
						<Menu>
							{this.props.state.navigation.nav.map((item,index) => (
								item.type=='other'?<MenuItem primaryText={item.name}
								className={item.selected?"list-selected left-menu-list":'left-menu-list'}
								style={style}
								innerDivStyle={listStyle}
								leftIcon={item.icon?svg[item.icon]():null}
								onTouchTap={this.itemSelect.bind(this,item.name,index)}
								key={item.name}
								 />:false
								))}
						</Menu>
					</div>
				</div>*/}
			</div>
			)
	}
	//select navigation
	itemSelect (name,index,e) {
		this.props.dispatch(Action.changeSelectedNavItem(name));
	}
}


export default leftNav
