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
	width: 241
};

const listStyle = {
	height: 50,
	lineHeight:'50px',
	paddingLeft:50,
	color:'#fff',
	fontSize:'14px',
	paddingLeft: '60px'
}
const selectedStyle = {
	height: 50,
	lineHeight:'50px',
	paddingLeft:50,
	color:'#ef6c00',
	fontSize:'14px',
	paddingLeft: '60px'
}

function getStyles () {
	return {
		header: {
			textAlign: 'center',
			lineHeight: '55px',
			fontSize: 16,
			color: '#fff',
			backgroundColor: 'rgba(0,0,0,.2)',
			borderBottom: '1px solid rgba(0,0,0,.25)'
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
						<div className="nav-item-header" style={ getStyles().header }>
							文件
						</div>
						<div className="nav-item-body">
							{this.props.state.navigation.nav.map((item,index) => {
								if (item.type == 'leftNav') {
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
						<div className="nav-item-header" style={ getStyles().header }>
							照片
						</div>
						<div className="nav-item-body">
							{
								this.props.state.navigation.photoMenu.map((item, index) => {
									return (
										<MenuItem
										  className={ item.selected ? "list-selected left-menu-list" : 'left-menu-list' }
											primaryText={ item.text }
											key={ item.name }
											desktop={ true }
											onTouchTap={ this.itemSelect.bind(this,item.name,index) }
											innerDivStyle={ item.selected ? selectedStyle : listStyle }
											leftIcon={ item.icon ? svg[item.icon]() : null }>
										</MenuItem>
									);
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


export default  leftNav
